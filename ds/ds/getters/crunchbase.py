"""Data getters for Crunchbase data."""

from functools import lru_cache
from typing import Optional

from metaflow import Flow, Run
from metaflow.exception import MetaflowNotFound

from pandas import DataFrame


@lru_cache()
def get_run(flow_name: str) -> Run:
    """Gets last successful run executed with `--production`"""
    runs = Flow(flow_name).runs("project_branch:prod")
    try:
        return next(filter(lambda run: run.successful, runs))
    except StopIteration as exc:
        raise MetaflowNotFound("Matching run not found") from exc


def get_local_run(flow_name: str) -> Run:
    """Gets last successful run executed with `--production`"""
    runs = Flow(flow_name).runs()
    try:
        return next(filter(lambda run: run.successful, runs))
    except StopIteration as exc:
        raise MetaflowNotFound("Matching run not found") from exc


def get_cb_ai_funders(
    run: Optional[Run] = None, local: Optional[bool] = False
) -> DataFrame:
    """get the funders of AI organisations
    Arguments:
        run: what run to get (if None it gets the lastest run)
        local: if False will get latest production run only
    Returns:
        Columns:
            Name: Name, dtype: str, name of funder
            Name: Latitude, dtype: float, latitude of organisation
            Name: Longitude, dtype: float, longitude of organisation
    """

    if run is None:
        if local:
            run = get_local_run("Crunchbase_AI")
        else:
            run = get_run("Crunchbase_AI")

    return run.data.ai_funders_df_filtered.dropna(
        subset=["city"]
    ).reset_index(drop=True).rename(
            columns={"name": "Name", "domain": "Link"}, inplace=True
        )[["Name", "Link", "city"]]
