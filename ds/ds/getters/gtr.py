"""Data getters for Gateway to Research data."""

from typing import Optional

from ds.utils.metaflow import get_run, namespace_context

from metaflow import Run

from pandas import DataFrame


def get_gtr_ai_orgs(run: Optional[Run] = None) -> DataFrame:
    """get the AI research organisations with lon/lat
    Arguments:
        run: what run to get (if None it gets the lastest run)
    Returns:
        Dataframe with columns:
            Name: Name, dtype: str, name of organisation
            Name: Link, str, url for the organisation (not all present)
            Name: Latitude, dtype: float, latitude of organisation
            Name: Longitude, dtype: float, longitude of organisation
    """

    if run is None:
        with namespace_context(None):
            return get_run("GtrAI").data.ai_orgs_grouped_filtered
    else:
        return run.data.ai_orgs_grouped_filtered
