import configparser
import os

import pymysql

from sqlalchemy import create_engine

gtr_ai_tags = ["artificial intelligence"]

query_ai_topics = (
    "SELECT gtr_link_table.project_id "
    "FROM gtr_topic, gtr_link_table "
    "WHERE gtr_topic.id=gtr_link_table.id AND gtr_topic.text LIKE %s"
)

query_ai_orgs = (
    "SELECT gtr_organisations.name, gtr_organisations.id, count(gtr_link_table.project_id), "
    "gtr_organisations_locations.latitude, gtr_organisations_locations.longitude "
    "FROM gtr_link_table, gtr_organisations, gtr_organisations_locations "
    "WHERE gtr_organisations.id=gtr_organisations_locations.id "
    "AND gtr_organisations.id=gtr_link_table.id "
    "AND gtr_link_table.project_id IN %(l)s"
    "GROUP BY gtr_organisations.id"
)

query_ai_orgs_all_topics = (
    "SELECT gtr_link_table.id, count(gtr_link_table.project_id) "
    "FROM gtr_link_table "
    "WHERE gtr_link_table.id IN  %(l)s"
    "GROUP BY gtr_link_table.id"
)


def est_conn(dbname="production"):

    SQL_DB_CREDS = os.environ.get("SQL_DB_CREDS")

    config = configparser.ConfigParser()
    try:
        config.read(SQL_DB_CREDS)
    except TypeError:
        print(
            "Try setting SQL_DB_CREDS environmental variable to location of Nesta SQL credentials"
        )

    user = config["client"]["user"]
    password = config["client"]["password"]
    host = config["client"]["host"]

    conn = create_engine(f"mysql+pymysql://{user}:{password}@{host}/{dbname}")
    return conn
