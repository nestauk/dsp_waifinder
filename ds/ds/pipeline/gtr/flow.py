"""
Flow to get AI data from Gateway to Research SQL database
"""
from ds import config
from ds.pipeline.gtr.utils import est_conn

from metaflow import FlowSpec, project, step


@project(name="ai_map")
class GtR_AI(FlowSpec):
    """
    We query the Gateway to Research database to find institutions
    which create AI research in decent proportions.
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

        # Combine
        ai_org_ids_df = ai_org_ids_df.merge(
            ai_orgs_all_proj_df,
            how="left",
            on="id"
            )
        ai_org_ids_df.rename(
            columns={
                "id": "org_id",
            },
            inplace=True,
        )

        # There is some duplication in this data where orgs with the same
        # name and lat/long coords are given 2 org IDs.
        # Merge rows where this happens, and count up the distinct project IDs
        self.ai_orgs_grouped = (
            ai_org_ids_df.groupby(
                ["Name", "Latitude", "Longitude", "country_name"],
                dropna=False
            )
            .agg(
                {
                    "ai_project_id": lambda x: x.nunique(),
                    "all_project_id": lambda x: x.nunique(),
                }
            )
            .reset_index()
        )

        self.ai_orgs_grouped.rename(
            columns={
                "ai_project_id": "n_ai_projects",
                "all_project_id": "n_total_projects",
            },
            inplace=True,
        )

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
            query_cb_urls,
            conn,
            params={"l": tuple([s.lower() for s in org_names])}
        )

        # Create dictionary for merging
        name2url_dict, self.multi_urls = get_name_url_dict(org_names_url_df)

        # Merge on lower case name
        self.ai_orgs_grouped["Link"] = self.ai_orgs_grouped["Name"].apply(
            lambda x: name2url_dict.get(x.lower())
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
        self.ai_orgs_grouped_filtered = self.ai_orgs_grouped[
            (self.ai_orgs_grouped["prop_ai_projects"] >= self.min_ai_prop)
            & (self.ai_orgs_grouped["n_total_projects"] >= self.min_num_proj)
            & (self.ai_orgs_grouped["country_name"] == "United Kingdom")
        ].reset_index(drop=True)

        self.next(self.end)

    @step
    def end(self):
        """End flow"""
        pass


if __name__ == "__main__":
    GtR_AI()
