"""
Flow to get AI data from Crunchbase SQL database

Find the investors which have funded organisations
that are tagged with AI topics.
"""
from ds import config
from ds.utils.metaflow import est_conn

from metaflow import FlowSpec, project, step


@project(name="ai_map")
class CrunchbaseAI(FlowSpec):
    """
    We query the Crunchbase database to find the investors of organisations
    which are tagged with AI topics. We output the investors that invest in
    AI in decent proportions.

    Attributes:
        ai_investors_df: Dataframe of investor information for all
            investors of AI tagged organisations (investor_id is unique).
        ai_investors_df_filtered: A dataframe containing containing a subset
            of ai_investors_df, filtered to only include investors with
            1. the total number of organisations funded is over
                a threshold of min_num_org_funded,
            2. the proportion of AI organisations funded is over
                a threshold of min_ai_prop,
            3. an address in the UK,
            4. the investor type is not "person" (it is "organization")
            4. Lat/Lon co-ordinates were found
    """

    min_ai_prop = config["flows"]["crunchbase"]["min_ai_prop"]
    min_num_org_funded = config["flows"]["crunchbase"]["min_num_org_funded"]

    @step
    def start(self):
        """Start flow"""

        self.next(self.get_ai_orgs_data)

    @step
    def get_ai_orgs_data(self):
        """Get data for the investors of organisations which have AI tags.
        This includes:
        Investor name, id, location data,
        number of AI projects, total number of projects
        """

        from ds.pipeline.crunchbase.utils import (
            cb_ai_tags,
            query_ai_topics,
            query_ai_investors,
            query_ai_investors_all_topics,
            query_ai_investors_locations,
            get_ai_investors,
        )
        import pandas as pd

        # Establish the connection to the SQL database
        conn = est_conn()

        # Get all the organisation ids for AI topic-tagged organisations
        ai_orgs_ids_df = pd.read_sql(
            query_ai_topics, conn, params={"l": tuple(cb_ai_tags)}
        )
        ai_org_ids = ai_orgs_ids_df["org_id"].unique()

        # Find the investors of these organisations
        # Each investor may have funded multiple AI orgs
        self.ai_investors_df = get_ai_investors(ai_org_ids, query_ai_investors, conn)
        ai_investor_ids = self.ai_investors_df["investor_id"].unique()

        # Get all project counts for the AI organisations
        ai_investors_all_orgs_df = pd.read_sql(
            query_ai_investors_all_topics, conn, params={"l": tuple(ai_investor_ids)}
        )

        # Combine investor information
        self.ai_investors_df = self.ai_investors_df.merge(
            ai_investors_all_orgs_df, how="left", on="investor_id"
        )

        # Get organisation location and description data
        self.ai_investors_location_df = pd.read_sql(
            query_ai_investors_locations, conn, params={"l": tuple(ai_investor_ids)}
        )

        # Combine location and description data
        self.ai_investors_df = self.ai_investors_df.merge(
            self.ai_investors_location_df,
            how="left",
            left_on="investor_id",
            right_on="id",
        )

        self.next(self.find_lon_lat)

    @step
    def find_lon_lat(self):

        from ds.utils.nspl_data import (
            chrome_driver,
            find_download_url,
            download_zip,
            read_nspl_data,
        )

        from ds.pipeline.crunchbase.utils import nspl_match_postcodes

        geoportal_url = config["flows"]["utils"]["geoportal_url"]

        with chrome_driver() as driver:
            download_url = find_download_url(driver, geoportal_url)

        with download_zip(download_url) as zipfile:
            # Load main postcode lookup
            nspl_data = read_nspl_data(zipfile)

        (
            self.ai_investors_df["Latitude"],
            self.ai_investors_df["Longitude"],
        ) = nspl_match_postcodes(self.ai_investors_df["Postcode"].tolist(), nspl_data)

        self.next(self.filter_ai_investors)

    @step
    def filter_ai_investors(self):
        """Filter the investors of AI organisations to just include:
        - those with high proportions of funding to AI organisations in
            whole portfolio,
        - with a high total number of organisations in portfolio
        - UK address
        - No personal investors (the two options are organization or person)
        - Has lat/long co-ordinates
        """

        self.ai_investors_df["prop_ai_orgs_funded"] = (
            self.ai_investors_df["num_ai_orgs_funded"]
            / self.ai_investors_df["num_orgs_funded"]
        )
        self.ai_investors_df_filtered = (
            self.ai_investors_df[
                (self.ai_investors_df["prop_ai_orgs_funded"] >= self.min_ai_prop)
                & (
                    self.ai_investors_df["num_ai_orgs_funded"]
                    >= self.min_num_org_funded
                )
                & (self.ai_investors_df["country"] == "United Kingdom")
                & (self.ai_investors_df["type"] != "person")
            ]
            .dropna(subset=["Longitude", "Latitude"])
            .reset_index(drop=True)[
                [
                    "Name",
                    "Link",
                    "Longitude",
                    "Latitude",
                    "City",
                    "Postcode",
                    "Description",
                    "Description_long",
                ]
            ]
        )

        self.next(self.end)

    @step
    def end(self):
        """End flow"""
        pass


if __name__ == "__main__":
    CrunchbaseAI()
