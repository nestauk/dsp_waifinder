from typing import Dict

from metaflow import (
    current,
    FlowSpec,
    Parameter,
    project,
    step,
    conda,
    batch,
)

import json

"""
    Read in the data provided from GtR, Crunchbase and GlassAI
    and merge and reformat for outputs.

    Place information (e.g. city) is added for each organisation
    using either the original data source (if city was given), or
    by querying the postcode using the pgeocode package (quick but
    incomplete) or by querying the lat/long coordinates using the
    geopy package (slow but complete).
    NUT3 codes are also found for all places.

    Attributes:
        gtr_output: (DataFrame)
            The final output of the GtrAI flow
        glass_output: (DataFrame)
            The final output of the GlassAICompanies flow
        cb_output: (DataFrame)
            The final output of the CrunchbaseAI flow
        ai_map_data: (DataFrame)
            The merged organisation data for all the data sources,
            including place name.
        geopy_addresses: (DataFrame)
            The address information found for each organisation's
            lat/long coordinate
        places: (DataFrame)
            Information about each place - central lat/long, NUTS3
        ai_map_data_final: (DataFrame)
            The v1 output of each organisation's information
        output_dict: (dict)
            The v2 output of a dictionary of each organisation's
            information, plus each place's information
    """


@project(name="ai_map")
class merge_map_datasets(FlowSpec):
    @step
    def start(self):

        """Importing datasets (crunchbase, glassai, gtr)"""

        from ds.getters.crunchbase import get_cb_ai_investors
        from ds.getters.glassai import get_glassai_companies
        from ds.getters.gtr import get_gtr_ai_orgs

        self.gtr_output = get_gtr_ai_orgs()
        self.glass_output = get_glassai_companies()
        self.cb_output = get_cb_ai_investors()

        # Due to legal reasons we need to remove all the crunchbase fields apart from Name
        self.cb_output = self.cb_output[["Name"]]
        self.gtr_output.drop(columns=["Link", "Description"], inplace=True)

        # adding column names
        self.glass_output["Company"] = 1
        self.cb_output["Funder"] = 1
        self.gtr_output["University / RTO"] = 1
        self.glass_output["Incubator / accelerator"] = [
            1 if v == "Y" else None for v in self.glass_output["is_incubator"]
        ]

        self.next(self.merge_datasets)

    @step
    def merge_datasets(self):

        """Merging datasets (crunchbase, glassai, gtr)"""
        import pandas as pd

        self.ai_map_data = pd.concat(
            [self.glass_output, self.cb_output, self.gtr_output]
        )
        self.ai_map_data = self.ai_map_data.drop(columns="is_incubator")

        # order column names
        self.ai_map_data = self.ai_map_data[
            [
                "Name",
                "Link",
                "Latitude",
                "Longitude",
                "City",
                "Postcode",
                "Description",
                "Company",
                "Funder",
                "Incubator / accelerator",
                "University / RTO",
            ]
        ]

        self.next(self.quality)

    @step
    def quality(self):
        """Quality check of merged dataset ai_map_data"""

        if self.ai_map_data["Company"].sum() != len(self.glass_output):
            print(
                f"error at ai_map_data['Company'].  {self.ai_map_data['Company'].sum()} != {len(self.glass_output)} "
            )

        if self.ai_map_data["Funder"].sum() != len(self.cb_output):
            print(
                f"error at ai_map_data['Funder']. {self.ai_map_data['Funder'].sum()} != {len(self.cb_output)}"
            )

        if self.ai_map_data["University / RTO"].sum() != len(self.gtr_output):
            print(
                f"error at ai_map_data['University / RTO']. {self.ai_map_data['University / RTO'].sum()} != {len(self.gtr_output)}"
            )

        if (
            self.ai_map_data["Incubator / accelerator"].sum()
            != self.glass_output["is_incubator"].apply(lambda x: x == "Y").sum()
        ):
            print(
                f"error at ai_map_data['Incubator / accelerator']. {self.ai_map_data['Incubator / accelerator'].sum()} != {self.glass_output['is_incubator'].apply(lambda x: x=='Y').sum()}"
            )

        self.next(self.merge_names)

    @step
    def merge_names(self):
        from ds.pipeline.ai_map.utils import (
            get_merged_data,
            clean_dash_names,
            manual_edits,
        )
        from ds import config

        self.ai_map_data["Name"], self.ai_map_data["Name_extra"] = map(
            list, zip(*self.ai_map_data["Name"].map(clean_dash_names))
        )

        self.ai_map_data = get_merged_data(self.ai_map_data)

        # Make manual edits
        with open(config["flows"]["utils"]["orgs_to_remove_filename"]) as f:
            orgs_to_remove_list = set(f.read().splitlines())
        with open(config["flows"]["utils"]["incubator_companies_filename"]) as f:
            incubator_companies_list = set(f.read().splitlines())
        self.ai_map_data = manual_edits(
            self.ai_map_data, incubator_companies_list, orgs_to_remove_list
        )

        self.next(self.add_places)

    @step
    def add_places(self):
        """
        Find the place for an organisation using postcode and lat/long
        for those organisations which don't already have this data
        """

        from ds.pipeline.ai_map.utils import flow_add_places

        self.geopy_addresses, self.ai_map_data = flow_add_places(self.ai_map_data)

        self.next(self.organise_places)

    @step
    def organise_places(self):
        """
        For each organisation there should be one place, and each place should be linked to NUTS codes

        """
        from ds.pipeline.ai_map.utils import (
            get_geo_data,
            clean_places,
            get_final_places,
        )

        self.geo_data = get_geo_data()
        city_names = self.geo_data["city"].tolist()

        self.ai_map_data = clean_places(self.ai_map_data)
        self.ai_map_data["Place"], self.ai_map_data["Place type"] = get_final_places(
            self.ai_map_data, city_names
        )

        self.next(self.nuts3_info)

    @step
    def nuts3_info(self):

        from ds.pipeline.ai_map.utils import merge_place_data, add_nuts

        self.places = merge_place_data(self.ai_map_data, self.geo_data)
        self.places = add_nuts(self.places)

        place_type_dict = {
            k: v[0]
            for k, v in dict(
                self.ai_map_data.groupby("Place")["Place type"].unique()
            ).items()
        }
        self.places["place_type"] = self.places["Place"].map(place_type_dict)

        self.next(self.enrich_postcode)

    @step
    def enrich_postcode(self):

        from ds.pipeline.ai_map.utils import get_postcode_field

        # If there was no postcode given, then use the geopy package
        self.ai_map_data["Postcode"] = self.ai_map_data.apply(
            lambda x: get_postcode_field(
                x["Postcode"], x["geopy_postcode"], x["lat_long"]
            ),
            axis=1,
        )

        self.ai_map_data["Postcode"] = self.ai_map_data["Postcode"].apply(
            lambda x: x.upper().replace(" ", "") if x else None
        )

        self.next(self.data_clean_up)

    @step
    def data_clean_up(self):

        from toolz.itertoolz import partition
        import pandas as pd

        from ds.pipeline.ai_map.utils import convert_unicode

        self.ai_map_data["Description"] = self.ai_map_data["Description"].map(
            convert_unicode
        )

        self.ai_map_data = pd.merge(
            self.ai_map_data, self.places[["Place", "place_id"]], how="left", on="Place"
        ).reset_index(drop=True)

        # Chunk up for Batch
        all_links = self.ai_map_data["Link"].dropna().tolist()
        self.links_chunked = list(partition(50, all_links))

        # # For loop through each data path
        print(
            f"Running predictions on {len(all_links)} data files in {len(self.links_chunked)} batches ..."
        )

        # Get batching ready
        self.next(self.format_links, foreach="links_chunked")

    @batch(
        queue="job-queue-GPU-nesta-metaflow",
        image="metaflow-pytorch",
        memory=60000,
        cpu=8,
    )
    @step
    def format_links(self):
        """
        Create dicts of {original url: formatted url}
        """
        import requests

        def is_url_ok(url):
            # From https://pytutorial.com/check-url-is-reachable
            try:
                get = requests.get(url)
                if get.status_code == 200:
                    return True
                else:
                    return False
            except requests.exceptions.RequestException as e:
                return False

        def format_url(url):
            """
            url: raw url from the dataset
            """
            if url:
                if url[0:5] == "https":
                    return url
                elif url[0:5] == "http:":
                    https_version = url.replace("http", "https")
                    if is_url_ok(https_version):
                        return https_version
                    else:
                        return url
                else:
                    https_version = "https://" + url
                    if is_url_ok(https_version):
                        return https_version
                    else:
                        return "http://" + url
            else:
                return None

        self.url_format_dict = {}
        for i, url in enumerate(self.input):
            if i % 10 == 0:
                print(f"{i}th url")
            self.url_format_dict[url] = format_url(url)

        self.next(self.join_data)

    @step
    def join_data(self, inputs):

        import numpy as np

        self.merge_artifacts(inputs, include=["ai_map_data", "places"])

        self.all_url_format_dict = {}
        for batch_i in inputs:
            self.all_url_format_dict.update(batch_i.url_format_dict)

        self.ai_map_data["Link"] = self.ai_map_data["Link"].map(
            self.all_url_format_dict
        )
        # Make sure all nulls are coded the same (as None)
        self.ai_map_data.replace({np.nan: None}, inplace=True)

        self.next(self.save_tsv)

    @step
    def save_tsv(self):
        """
        This is the original v1 tsv output
        """

        self.ai_map_data_final = self.ai_map_data[
            [
                "Name",
                "Name_extra",
                "Link",
                "Longitude",
                "Latitude",
                "Place",
                "Postcode",
                "place_id",
                "Description",
                "Company",
                "Funder",
                "Incubator / accelerator",
                "University / RTO",
            ]
        ]

        for i in range(1, 12):
            self.ai_map_data_final[f"Sector {i}"] = None

        self.ai_map_data_final.to_csv(
            "outputs/data/ai_map_data.tsv", index=False, sep="\t"
        )

        self.places.to_csv("outputs/data/ai_map_places.tsv", index=False, sep="\t")

        self.next(self.save_json)

    @step
    def save_json(self):
        """
        This is the v2 output.
        """
        from ds.pipeline.ai_map.utils import format_places, format_organisations

        import json

        types_dict = {
            name: str(number)
            for number, name in enumerate(
                ["Company", "Funder", "Incubator / accelerator", "University / RTO"]
            )
        }

        self.output_dict = {
            "orgs": format_organisations(self.ai_map_data, types_dict),
            "places": format_places(self.places),
            "org_types": {v: k for k, v in types_dict.items()},
        }
        with open("outputs/data/ai_map_orgs_places.json", "w") as outfile:
            json.dump(self.output_dict, outfile)

        self.next(self.end)

    @step
    def end(self):
        pass


if __name__ == "__main__":
    merge_map_datasets()
