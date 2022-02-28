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
        """Get data for the research organisations which have AI tagged projects.
        This includes:
        Org name, id, lat/lon, number of AI projects, total number of projects"""

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
        ai_project_ids = list(ai_project_ids_df["project_id"].unique())

        # Get all the organisational info for the AI projects
        ai_org_ids_df = pd.read_sql(
            query_ai_orgs, conn, params={"l": tuple(ai_project_ids)}
        )
        ai_org_ids = ai_org_ids_df["id"].tolist()
        ai_org_ids_df.rename(
            columns={"count(gtr_link_table.project_id)": "n_ai_projects"}, inplace=True
        )

        # Get all project counts for the AI organisations
        ai_orgs_all_proj_df = pd.read_sql(
            query_ai_orgs_all_topics, conn, params={"l": tuple(ai_org_ids)}
        )
        ai_orgs_all_proj_df.rename(
            columns={"count(gtr_link_table.project_id)": "n_total_projects"},
            inplace=True,
        )

        # Combine
        self.ai_org_ids_df = ai_org_ids_df.merge(
            ai_orgs_all_proj_df, how="left", on="id"
        )
        self.ai_org_ids_df.rename(
            columns={
                "name": "Name",
                "id": "org_id",
                "latitude": "Latitude",
                "longitude": "Longitude",
            },
            inplace=True,
        )

        self.next(self.filter_ai_orgs)

    @step
    def filter_ai_orgs(self):
        """Filter the AI orgs to just include those with high
        proportions of AI tags, and with a high total number of projects"""

        self.ai_org_ids_df["prop_ai_projects"] = (
            self.ai_org_ids_df["n_ai_projects"] / self.ai_org_ids_df["n_total_projects"]
        )
        self.ai_org_ids_df_filtered = self.ai_org_ids_df[
            (self.ai_org_ids_df["prop_ai_projects"] >= self.min_ai_prop)
            & (self.ai_org_ids_df["n_total_projects"] >= self.min_num_proj)
        ].reset_index(drop=True)

        self.next(self.end)

    @step
    def end(self):
        """End flow"""
        pass


if __name__ == "__main__":
    GtR_AI()
