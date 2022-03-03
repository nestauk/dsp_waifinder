import configparser
import os

from sqlalchemy import create_engine

gtr_ai_tags = [
    "Digital Signal Processing",
    "Systems engineering",
    "Systems neuroscience",
    "ICT and education",
    "Human Communication in ICT",
    "Info. & commun. Technol.",
    "Fundamentals of Computing",
    "Image & Vision Computing",
    "Dev Informatics & Technology",
    "System on Chip",
    "Complexity Science",
    "Intelligent & Expert Systems",
    "Comput./Corpus Linguistics",
    "Computer Sys. & Architecture",
    "Design of Process systems",
    "Modelling & simul. of IT sys.",
    "Accelerator R&D",
    "Statistics & Appl. Probability",
    "Technology and method dev",
    "Computational Studies",
    "eScience",
    "Mobile Computing",
    "Bioinformatics",
    "Computer Graphics & Visual.",
    "Electronic Devices & Subsys.",
    "Technol. for Environ. Appl.",
    "Bionanoscience",
    "Networks & Distributed Systems",
    "Computational Methods & Tools",
    "Intelligent Measurement Sys.",
    "Bioelectronic Devices",
    "Design & Testing Technology",
    "Data Handling & Storage",
    "Software Engineering",
    "Human-Computer Interactions",
    "Robotics & Autonomy",
    "High Performance Computing",
    "Parallel Computing",
    "Artificial Intelligence",
]

query_ai_topics = (
    "SELECT gtr_link_table.project_id "
    "FROM gtr_topic, gtr_link_table "
    "WHERE gtr_topic.id=gtr_link_table.id AND gtr_topic.text IN %(l)s"
)

query_ai_orgs = (
    "SELECT gtr_organisations.name as 'Name', "
    "gtr_organisations.id, "
    "gtr_link_table.project_id as ai_project_id, "
    "gtr_organisations_locations.latitude as 'Latitude', "
    "gtr_organisations_locations.longitude as 'Longitude', "
    "gtr_organisations_locations.country_name "
    "FROM gtr_link_table "
    "INNER JOIN gtr_organisations ON gtr_organisations.id=gtr_link_table.id "
    "INNER JOIN gtr_organisations_locations "
    "ON gtr_organisations.id=gtr_organisations_locations.id "
    "WHERE gtr_link_table.project_id IN %(l)s "
)

query_ai_orgs_all_topics = (
    "SELECT gtr_link_table.id, gtr_link_table.project_id as all_project_id "
    "FROM gtr_link_table "
    "WHERE gtr_link_table.id IN  %(l)s"
)


# Some of the urls can be found in the crunchbase data
query_cb_urls = (
    "SELECT crunchbase_organizations.homepage_url as Link, "
    "crunchbase_organizations.name, "
    "crunchbase_organizations.country "
    "FROM crunchbase_organizations "
    "WHERE LOWER(crunchbase_organizations.name) IN %(l)s"
)


def est_conn(dbname="production"):

    SQL_DB_CREDS = os.environ.get("SQL_DB_CREDS")

    config = configparser.ConfigParser()
    try:
        config.read(SQL_DB_CREDS)
    except TypeError:
        print(
            "Try setting SQL_DB_CREDS environmental variable"
            " to location of Nesta SQL credentials"
        )

    user = config["client"]["user"]
    password = config["client"]["password"]
    host = config["client"]["host"]

    conn = create_engine(f"mysql+pymysql://{user}:{password}@{host}/{dbname}")
    return conn


def get_name_url_dict(org_names_url_df):
    # Get a dictionary of {org_name: url}
    # There can be multiple rows of urls for each organisation
    # if there are multiple: choose first url from the UK
    # if no UK, chose first url from US
    # otherwise just use first one

    org_names_url_df = org_names_url_df[org_names_url_df["Link"].notnull()]
    org_names_url_df["Name lower"] = org_names_url_df["name"].str.lower()

    lower_name2url_dict = {}
    multi_urls = []
    for name, url_info in org_names_url_df.groupby("Name lower"):
        if len(url_info) > 1:
            multi_urls.append(name)
            uk_url_info = url_info[url_info["country"] == "United Kingdom"]
            if len(uk_url_info) != 0:
                lower_name2url_dict[name] = uk_url_info.iloc[0]["Link"]
            else:
                us_url_info = url_info[url_info["country"] == "United States"]
                if len(us_url_info) != 0:
                    lower_name2url_dict[name] = us_url_info.iloc[0]["Link"]
                else:
                    lower_name2url_dict[name] = url_info.iloc[0]["Link"]
        else:
            lower_name2url_dict[name] = url_info.iloc[0]["Link"]
    return lower_name2url_dict, multi_urls
