from typing import Dict

from metaflow import (
    current,
    FlowSpec,
    Parameter,
    project,
    step,
)

import pandas as pd
import numpy as np

"""
    Read in the data provided from
    (example GlassAI and find lat/lon
    co-ordinates for each postcode.)



    Attributes:
        gtr_output: update


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
                "Company",
                "Funder",
                "Incubator / accelerator",
                "University / RTO",
            ]
        ]

        for i in range(1, 12):
            self.ai_map_data[f"Sector {i}"] = None

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
        from ds.pipeline.ai_map.utils import get_merged_data

        self.ai_map_data = get_merged_data(self.ai_map_data)

        self.next(self.save)

    @step
    def save(self):
        self.ai_map_data.to_csv("outputs/data/ai_map_data.tsv", index=False, sep="\t")

        self.next(self.end)

    @step
    def end(self):
        pass


if __name__ == "__main__":
    merge_map_datasets()
