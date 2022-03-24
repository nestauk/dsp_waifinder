"""Data getters for Glass AI data."""

from typing import Optional

from ds.utils.metaflow import get_run, namespace_context

from metaflow import Run

from pandas import DataFrame


def get_glassai_companies(run: Optional[Run] = None) -> DataFrame:
    """get AI companies
    Arguments:
        run: what run to get (if None it gets the lastest run)
    Returns:
        DataFrame with columns:
            Name: Name, dtype: str, name of funder
            Name: Link, str, url for the funder
            Name: Latitude, dtype: float, latitude of funder
            Name: Longitude, dtype: float, longitude of funder
            Name: is_incubator, dtype: str, if the company is an incubator (Y)
                or not (blank)
    """

    if run is None:
        with namespace_context(None):
            return get_run("GlassAICompanies").data.ai_companies_df_filtered
    else:
        return run.data.ai_companies_df_filtered
