"""Data getters for Crunchbase data."""

from typing import Optional

from ds.utils.metaflow import get_run, namespace_context

from metaflow import Run

from pandas import DataFrame


def get_cb_ai_investors(run: Optional[Run] = None) -> DataFrame:
    """get the investors of AI organisations
    Arguments:
        run: what run to get (if None it gets the lastest run)
    Returns:
        DataFrame with columns:
            Name: Name, dtype: str, name of funder
            Name: Link, str, url for the funder
            Name: Latitude, dtype: float, latitude of funder
            Name: Longitude, dtype: float, longitude of funder
    """

    if run is None:
        with namespace_context(None):
            run = get_run("CrunchbaseAI")

    return run.data.ai_investors_df_filtered
