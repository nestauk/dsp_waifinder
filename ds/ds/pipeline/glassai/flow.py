"""
Flow to format the AI company and incubator data
that GlassAI provided us with.

Also involved is converting postcodes to lat/lon
co-ordinates.
"""
import pandas as pd

from ds import config
from metaflow import FlowSpec, project, step


@project(name="ai_map")
class GlassAICompanies(FlowSpec):
    """
    Read in the data provided from GlassAI and find lat/lon
    co-ordinates for each postcode.

    Attributes:
        ai_companies_df: Dataframe of AI companies from Glass AI
            with added lat/lon coordinates
        ai_companies_df_filtered: ai_companies_df filtered
            to only include those with lat/lon coordinates,
            and only key columns are included
    """

    @step
    def start(self):
        """Start flow"""

        self.next(self.read_glass_data)

    @step
    def read_glass_data(self):
        """Read in the GlassAI data from S3"""

        import codecs
        import csv

        import boto3

        from ds.pipeline.glassai.utils import clean_description

        client = boto3.client("s3")

        bucket_name = config["flows"]["glassai"]["bucket_name"]
        glassai_filename = config["flows"]["glassai"]["glassai_filename"]

        s3_data = client.get_object(Bucket=bucket_name, Key=glassai_filename)
        self.ai_companies_df = pd.DataFrame(
            csv.DictReader(codecs.getreader("utf-8-sig")(s3_data["Body"]))
        )
        self.ai_companies_df["organization_description"] = self.ai_companies_df[
            "organization_description"
        ].map(clean_description)

        self.next(self.find_lon_lat)

    @step
    def find_lon_lat(self):
        """Find and append lat/lon coordinates from postcodes using NSPL"""

        from ds.pipeline.glassai.utils import get_cleaned_postcode, get_lat_long

        from ds.utils.nspl_data import (
            chrome_driver,
            find_download_url,
            download_zip,
            read_nspl_data,
        )

        geoportal_url = config["flows"]["utils"]["geoportal_url"]

        with chrome_driver() as driver:
            download_url = find_download_url(driver, geoportal_url)

        with download_zip(download_url) as zipfile:
            # Load main postcode lookups
            nspl_data = read_nspl_data(zipfile)

        self.ai_companies_df["cleaned_postcode"] = get_cleaned_postcode(
            self.ai_companies_df
        )

        (
            self.ai_companies_df["Latitude"],
            self.ai_companies_df["Longitude"],
        ) = get_lat_long(self.ai_companies_df, nspl_data)

        self.next(self.format_output)

    @step
    def format_output(self):
        """
        Rename columns to fit with schema and only output companies
        with long/lat coordinates, with only relevant columns included
        in filtered output
        """

        from ds.pipeline.glassai.utils import format_glassai_data

        self.ai_companies_df_filtered = format_glassai_data(self.ai_companies_df)

        self.next(self.end)

    @step
    def end(self):
        """End flow"""
        pass


if __name__ == "__main__":
    GlassAICompanies()
