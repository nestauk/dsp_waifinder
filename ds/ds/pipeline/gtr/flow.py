"""
Flow to get AI data from Gateway to Research SQL database
"""
from ds import config
from ds.utils.metaflow import est_conn

from metaflow import FlowSpec, project, step


@project(name="ai_map")
class GtrAI(FlowSpec):
    """
    We query the Gateway to Research database to find institutions
    which create AI research in decent proportions.

    Attributes:
        ai_orgs_grouped: A dataframe containing information about
            the organisations which ran projects with AI tags.
        full_url_dict: A dictionary of all the organisation names
            (in lower case) and the full data on countries and links given
            for them in the Crunchbase data.
        ai_orgs_grouped_filtered: A dataframe containing containing a subset
            of ai_orgs_grouped, filtered to only include organisations with
            1. a total number of projects over a threshold of min_num_proj,
            2. the proportion of AI projects over a threshold of min_ai_prop,
            3. an address in the UK, and
            4. Lat/Lon co-ordinates were found
    """

    @step
    def start(self):
        """Start flow"""

        self.next(self.get_ai_orgs_data)

    @step
    def get_ai_orgs_data(self):
        """Get data for the research organisations
        which have AI tagged projects. This includes:
        Org name, id, lat/lon, number of AI projects,
        total number of projects"""

        from ds.pipeline.gtr.utils import (
            gtr_ai_tags,
            query_ai_topics,
            query_ai_orgs,
            query_ai_orgs_all_topics,
            query_all_funding_ids,
            query_all_funding_amounts,
            clean_end_dates,
            combine_org_data,
        )
        import pandas as pd

        # Establish the connection to the SQL database
        conn = est_conn()

        # Get all the project ids for AI topic-tagged projects
        ai_project_ids_df = pd.read_sql(
            query_ai_topics, conn, params={"l": tuple(gtr_ai_tags)}
        )
        ai_project_ids = ai_project_ids_df["project_id"].unique()

        # Get all the organisational info for the AI projects
        ai_org_info = pd.read_sql(
            query_ai_orgs, conn, params={"l": tuple(ai_project_ids)}
        )
        ai_org_ids = ai_org_info["org_id"].unique()

        # Get all project ids for the AI organisations
        ai_org_project_ids = pd.read_sql(
            query_ai_orgs_all_topics, conn, params={"l": tuple(ai_org_ids)}
        )
        all_project_ids = ai_org_project_ids["all_project_id"].unique()

        # Get the funding IDs for all these projects
        ai_org_funding_ids = pd.read_sql(
            query_all_funding_ids, conn, params={"l": tuple(all_project_ids)}
        )
        all_proj_funding_ids = ai_org_funding_ids["funding_id"].unique()

        # Get the summary funding information using these funding IDs
        # It breaks when I try to do gtr_funds.id IN %(l)s
        funding_info = pd.read_sql(query_all_funding_amounts, conn)

        funding_info = clean_end_dates(funding_info)

        # Combine all these datasets to get project/funding information for each organisation
        self.ai_orgs_grouped = combine_org_data(
            ai_org_funding_ids, funding_info, ai_org_info, ai_org_project_ids
        )

        self.next(self.find_cb_org_info)

    @step
    def find_cb_org_info(self):
        """
        The GtR dataset doesn't include organisational urls, cities or descriptions
        but some of these can be found in the crunchbase data.
        Here we create a dict of name: {url, city, description} for each org name.
        """

        from ds.pipeline.gtr.utils import query_cb_urls, get_crunchbase_links
        import pandas as pd

        # Establish the connection to the SQL database
        conn = est_conn()

        org_names = self.ai_orgs_grouped["Name"].unique()
        self.org_names_url_df = pd.read_sql(
            query_cb_urls, conn, params={"l": tuple([s.lower() for s in org_names])}
        )

        self.name2orginfo = get_crunchbase_links(self.org_names_url_df)

        def get_cb_info(col_name):
            return (
                self.ai_orgs_grouped["Name"]
                .str.lower()
                .apply(
                    lambda x: self.name2orginfo[x][col_name]
                    if self.name2orginfo.get(x)
                    else None
                )
            )

        self.ai_orgs_grouped["Link"] = get_cb_info("Link")
        self.ai_orgs_grouped["City"] = get_cb_info("City")
        self.ai_orgs_grouped["Postcode"] = get_cb_info("Postcode")
        self.ai_orgs_grouped["Description"] = get_cb_info("Description")
        # If there is no description, use the short description
        self.ai_orgs_grouped.loc[
            self.ai_orgs_grouped["Description"].isnull(), "Description"
        ] = get_cb_info("Description_short")

        self.next(self.filter_ai_orgs)

    @step
    def filter_ai_orgs(self):
        """Filter the AI orgs according to the metrics:
        1. org name is in a predefined list
        2. org received any amount of funding in the last 5 years
        3. (number projects >= 400) OR (total funding over all time > £50m)
        """
        from ds.pipeline.gtr.utils import get_org_name_list, match_clean

        import pandas as pd

        min_num_proj = config["flows"]["gtr"]["min_num_proj"]
        min_funding = config["flows"]["gtr"]["min_funding"]
        funding_in_last_years = config["flows"]["gtr"]["funding_in_last_years"]
        gtr_universities_filename = config["flows"]["gtr"]["gtr_universities_filename"]
        gtr_rtos_filename = config["flows"]["gtr"]["gtr_rtos_filename"]
        gtr_eris_filename = config["flows"]["gtr"]["gtr_eris_filename"]

        # Hardcode todays year/month for reproducibility
        x_years_ago = 2022 + (7 / 12) - funding_in_last_years

        with open(gtr_universities_filename) as f:
            gtr_universities = set(f.read().splitlines())
        with open(gtr_eris_filename) as f:
            gtr_eris = set(f.read().splitlines())
        gtr_rtos = pd.read_csv(gtr_rtos_filename)
        gtr_rtos = set(gtr_rtos["ParticipantName"].tolist())

        org_names_keep = gtr_rtos.union(gtr_universities).union(gtr_eris)
        org_names_keep_enhanced = get_org_name_list(org_names_keep)

        self.ai_orgs_grouped["name_in_list"] = (
            self.ai_orgs_grouped["Name"]
            .apply(match_clean)
            .isin(org_names_keep_enhanced)
        )

        # Filter
        self.ai_orgs_grouped_filtered = (
            self.ai_orgs_grouped[
                (self.ai_orgs_grouped["last_funding_year"] >= x_years_ago)
                & (self.ai_orgs_grouped["country_name"] == "United Kingdom")
                & (
                    (self.ai_orgs_grouped["n_total_projects"] >= min_num_proj)
                    | (self.ai_orgs_grouped["total_funding"] >= min_funding)
                )
                & (self.ai_orgs_grouped["name_in_list"])
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
                ]
            ]
        )

        self.next(self.end)

    @step
    def end(self):
        """End flow"""
        pass


if __name__ == "__main__":
    GtrAI()
