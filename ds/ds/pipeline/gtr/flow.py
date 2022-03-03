"""
Flow to get AI data from Gateway to Research SQL database
"""
from metaflow import FlowSpec, project, step

from ds import config
from ds.utils.metaflow import est_conn


@project(name="ai_map")
class GtrAI(FlowSpec):
    """
    We query the Gateway to Research database to find institutions
    which create AI research in decent proportions.

    Attributes:
        ai_orgs_grouped: A dataframe containing information about
            the organisations which ran projects with AI tags.
        multi_urls: A list of organisation names (in lower case) which linked
            to multiple urls in the Crunchbase data.
        ai_orgs_grouped_filtered: A dataframe containing containing a subset
            of ai_orgs_grouped, filtered to only include organisations with
            1. a total number of projects over a threshold of min_num_proj,
            2. the proportion of AI projects over a threshold of min_ai_prop,
            3. an address in the UK, and
            4. Lat/Lon co-ordinates were found
    """

    min_ai_prop = config["flows"]["gtr"]["min_ai_prop"]
    min_num_proj = config["flows"]["gtr"]["min_num_proj"]

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
            combine_org_data,
            group_orgs,
        )
        import pandas as pd

        # Establish the connection to the SQL database
        conn = est_conn()

        # Get all the project ids for AI topic-tagged projects
        ai_project_ids_df = pd.read_sql(
            query_ai_topics, conn, params={"l": tuple(gtr_ai_tags)}
        )
        ai_project_ids = ai_project_ids_df["project_id"].unique().tolist()

        # Get all the organisational info for the AI projects
        ai_org_ids_df = pd.read_sql(
            query_ai_orgs, conn, params={"l": tuple(ai_project_ids)}
        )

        ai_org_ids = ai_org_ids_df["id"].unique().tolist()

        # Get all project counts for the AI organisations
        ai_orgs_all_proj_df = pd.read_sql(
            query_ai_orgs_all_topics, conn, params={"l": tuple(ai_org_ids)}
        )

        ai_org_ids_df = combine_org_data(ai_org_ids_df, ai_orgs_all_proj_df)

        self.ai_orgs_grouped = group_orgs(ai_org_ids_df)

        self.next(self.find_urls)

    @step
    def find_urls(self):
        """
        The GtR dataset doesn't include organisational urls
        but some of these can be found elsewhere
        """

        from ds.pipeline.gtr.utils import query_cb_urls, get_name_url_dict
        import pandas as pd

        # Establish the connection to the SQL database
        conn = est_conn()

        org_names = self.ai_orgs_grouped["Name"].unique().tolist()
        org_names_url_df = pd.read_sql(
            query_cb_urls, conn, params={"l": tuple([s.lower() for s in org_names])}
        )

        # Create dictionary for merging
        name2url_dict, self.multi_urls = get_name_url_dict(org_names_url_df)

        # Merge on lower case name
        self.ai_orgs_grouped["Link"] = (
            self.ai_orgs_grouped["Name"].str.lower().map(name2url_dict)
        )

        self.next(self.filter_ai_orgs)

    @step
    def filter_ai_orgs(self):
        """Filter the AI orgs to just include those with high
        proportions of AI tags, and with a high total number of projects,
        and based in the UK"""

        self.ai_orgs_grouped["prop_ai_projects"] = (
            self.ai_orgs_grouped["n_ai_projects"]
            / self.ai_orgs_grouped["n_total_projects"]
        )
        self.ai_orgs_grouped_filtered = (
            self.ai_orgs_grouped[
                (self.ai_orgs_grouped["prop_ai_projects"] >= self.min_ai_prop)
                & (self.ai_orgs_grouped["n_total_projects"] >= self.min_num_proj)
                & (self.ai_orgs_grouped["country_name"] == "United Kingdom")
            ]
            .dropna(subset=["Longitude", "Latitude"])
            .reset_index(drop=True)[["Name", "Link", "Longitude", "Latitude"]]
        )

        self.next(self.end)

    @step
    def end(self):
        """End flow"""
        pass


if __name__ == "__main__":
    GtrAI()
