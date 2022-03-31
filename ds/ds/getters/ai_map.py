"""Data getters for Glass AI data."""

from typing import Optional

from ds.utils.metaflow import get_run, namespace_context

from metaflow import Run

from pandas import DataFrame


def get_ai_map(run: Optional[Run] = None) -> DataFrame:
    """get merged ai_map dataset
    Arguments:
        run: what run to get (if None it gets the lastest run)
    Returns:
        DataFrame with columns:
            Name: Name, dtype: str, name of organisation
            Name: Link, str, url for the organisation
            Name: Latitude, dtype: float, latitude of organisation
            Name: Longitude, dtype: float, longitude of organisation
    """

    if run is None:
        with namespace_context(None):
            return get_run("merge_map_datasets").data.ai_map_data
    else:
        return run.data.ai_map_data
