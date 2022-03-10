import configparser
import os
from contextlib import contextmanager
from functools import lru_cache
from typing import Generator, Optional

from metaflow import Flow, Run, get_namespace, namespace
from metaflow.exception import MetaflowNotFound

from sqlalchemy import create_engine


@lru_cache()
def get_run(flow_name: str) -> Run:
    """Gets last successful run executed with `--production`"""
    runs = Flow(flow_name).runs("project_branch:prod")
    try:
        return next(filter(lambda run: run.successful, runs))
    except StopIteration as exc:
        raise MetaflowNotFound("Matching run not found") from exc


@contextmanager
def namespace_context(ns: Optional[str]) -> Generator[Optional[str], None, None]:
    """Context manager to temporarily enter metaflow namespace `ns`."""
    old_ns = get_namespace()
    namespace(ns)
    yield ns
    namespace(old_ns)


def est_conn(dbname="production"):

    SQL_DB_CREDS = os.environ.get("SQL_DB_CREDS")

    config = configparser.ConfigParser()
    try:
        config.read(SQL_DB_CREDS)
    except TypeError:
        print(
            "Try adding 'export SQL_DB_CREDS=$HOME/path/to/mysqldb_team.config'"
            " to your .env file"
        )

    user = config["client"]["user"]
    password = config["client"]["password"]
    host = config["client"]["host"]

    conn = create_engine(f"mysql+pymysql://{user}:{password}@{host}/{dbname}")
    return conn
