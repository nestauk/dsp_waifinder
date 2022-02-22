"""Data getters for Gateway to Research data."""

from functools import lru_cache

from metaflow import Flow, Run, Step
from metaflow.exception import MetaflowNotFound
from typing import Optional

try:  # Hack for type-hints on attributes
    import pandas as pd
except ImportError:
    pass


@lru_cache()
def get_run(flow_name: str) -> Run:
    """Gets last successful run executed with `--production`"""
    runs = Flow(flow_name).runs("project_branch:prod")
    try:
        return next(filter(lambda run: run.successful, runs))
    except StopIteration as exc:
        raise MetaflowNotFound("Matching run not found") from exc



Step('GtR_AI/1645464822243733/get_ai_orgs').task.data


# def get_gtr_ai_orgs(run: Optional[Run] = None):
#     """get the GVA in a local authority
#     Arguments:
#         run: what run to get (if None it gets the lastest production run)
#     Returns:
#         Columns:
#             Name: nuts1_name, dtype: str, NUTS1 region (e.g. Scotland, South East etc)
#             Name: la_code, dtype: str, local authority code
#             Name: la_name, dtype: str, local authority name
#             Name: year dtype: int, year (ranges between 1998 and 2019
#             Name: gva dtype: float, £M Gross value added
#     """

#     if run is None:
#         run = get_run("GtR_AI")

#     return (
#         pd.DataFrame(run.data.gva)
#         .melt(
#             id_vars=["itl1_region", "la_code", "la_name"],
#             var_name="year",
#             value_name="gva",
#         )
#         .rename(columns={"itl1_region": "nuts1_name"})
#     )
