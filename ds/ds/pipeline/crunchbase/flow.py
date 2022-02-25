"""
Flow to get AI data from Crunchbase SQL database

Need who funded companies that are tagged with AI topics
Shouldn't include persoanl venture capitals
"""
from ds import config
from ds.pipeline.crunchbase.utils import est_conn

from metaflow import FlowSpec, project, step


@project(name="ai_map")
class Crunchbase_AI(FlowSpec):
    """
    We query the Crunchbase database to find companies 
    which create AI research in decent proportions.
    """

    min_ai_prop = config["flows"]["crunchbase"]["min_ai_prop"]
    min_num_proj = config["flows"]["crunchbase"]["min_num_proj"]

    @step
    def start(self):
        """Start flow"""

        self.next(self.get_ai_orgs_data)

    @step
    def get_ai_orgs_data(self):
        """Get data for the companies which have AI tags.
        This includes:
        Org name, id, lat/lon, number of AI projects, total number of projects"""

        from ds.pipeline.crunchbase.utils import (
            cb_ai_tags,
            query_ai_topics,
            query_ai_funders,
            query_ai_funders_all_topics,
        )
        import pandas as pd

        # Establish the connection to the SQL database
        conn = est_conn()

        # Get all the organisation ids for AI topic-tagged organisations
        self.ai_orgs_ids_df = pd.read_sql(
            query_ai_topics, conn, params={"l": tuple(cb_ai_tags)}
        )
        ai_org_ids = list(self.ai_orgs_ids_df["org_id"].unique())

        # Find the funders of these organisations
        # SQL can't deal with querying them all in one go
        # so need to query in chunks and then merge
        chunk_size = 100000
        ai_funders_df = pd.DataFrame()
        for i in range(0, len(ai_org_ids), chunk_size):
            ai_org_ids_chunk = ai_org_ids[i:i + chunk_size]
            ai_funders_df_chunk = pd.read_sql(
                query_ai_funders, conn, params={"l": tuple(ai_org_ids_chunk)}
            )
            ai_funders_df = pd.concat([ai_funders_df, ai_funders_df_chunk])
        
        # Sum up the AI org counts for each of the funders
        df_funder_columns = ai_funders_df.columns.tolist()
        df_funder_columns.remove('num_ai_orgs_funded')
        ai_funders_df.groupby(df_funder_columns)['num_ai_orgs_funded'].sum().reset_index()
        ai_funder_ids = list(ai_funders_df['investor_id'].unique())
        
        # Get all project counts for the AI organisations
        ai_funders_all_orgs_df = pd.read_sql(
            query_ai_funders_all_topics, conn, params={"l": tuple(ai_funder_ids)}
        )

        # Combine
        self.ai_funders_df = ai_funders_df.merge(
            ai_funders_all_orgs_df, how="left", on="investor_id"
        )

        self.next(self.filter_ai_funders)

    @step
    def filter_ai_funders(self):
        """Filter the funders of AI organisations to just include:
        - those with high proportions of funding to AI organisations in whole portfolio, 
        - with a high total number of organisations in portfolio
        - UK address
        - No personal funders (the two options are organization or person)
        """

        self.ai_funders_df["prop_ai_orgs_funded"] = (
            self.ai_funders_df["num_ai_orgs_funded"] / self.ai_funders_df["num_orgs_funded"]
        )
        self.ai_funders_df_filtered = self.ai_funders_df[
            (self.ai_funders_df["prop_ai_orgs_funded"] >= self.min_ai_prop)
            & (self.ai_funders_df["num_ai_orgs_funded"] >= self.min_num_proj)
            & (self.ai_funders_df['country'] == 'United Kingdom')
            & (self.ai_funders_df['type'] != 'person')
        ].reset_index(drop=True)

        self.next(self.end)

    @step
    def end(self):
        """End flow"""
        pass


if __name__ == "__main__":
    Crunchbase_AI()
