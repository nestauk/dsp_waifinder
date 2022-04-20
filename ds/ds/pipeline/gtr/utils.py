import random

import pandas as pd

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
    "SELECT gtr_organisations.name Name, "
    "gtr_organisations.id, "
    "gtr_link_table.project_id ai_project_id, "
    "gtr_organisations_locations.latitude Latitude, "
    "gtr_organisations_locations.longitude Longitude, "
    "gtr_organisations_locations.country_name "
    "FROM gtr_link_table "
    "INNER JOIN gtr_organisations ON gtr_organisations.id=gtr_link_table.id "
    "INNER JOIN gtr_organisations_locations "
    "ON gtr_organisations.id=gtr_organisations_locations.id "
    "WHERE gtr_link_table.project_id IN %(l)s "
)

query_ai_orgs_all_topics = (
    "SELECT gtr_link_table.id, gtr_link_table.project_id all_project_id "
    "FROM gtr_link_table "
    "WHERE gtr_link_table.id IN  %(l)s"
)


# Some of the urls can be found in the crunchbase data
query_cb_urls = (
    "SELECT crunchbase_organizations.homepage_url Link, "
    "crunchbase_organizations.name, "
    "crunchbase_organizations.country, "
    "crunchbase_organizations.city City, "
    "crunchbase_organizations.long_description Description_long, "
    "crunchbase_organizations.short_description Description, "
    "crunchbase_organizations.postal_code Postcode "
    "FROM crunchbase_organizations "
    "WHERE LOWER(crunchbase_organizations.name) IN %(l)s"
)


def group_orgs(ai_org_ids_df):
    """There is some duplication in this data where orgs with the same
    name and lat/long coords are given 2 org IDs.
    Merge rows where this happens, and count up the distinct project IDs
    """
    return (
        ai_org_ids_df.groupby(
            ["Name", "Latitude", "Longitude", "country_name"], dropna=False
        )
        .agg(
            {
                "ai_project_id": lambda x: x.nunique(),
                "all_project_id": lambda x: x.nunique(),
            }
        )
        .reset_index()
    ).rename(
        columns={
            "ai_project_id": "n_ai_projects",
            "all_project_id": "n_total_projects",
        }
    )


def combine_org_data(df_1, df_2):
    """Merge two dataframes on 'id' column and rename
    this column to org_id
    """
    return df_1.merge(df_2, how="left", on="id").rename(
        columns={
            "id": "org_id",
        }
    )


def get_crunchbase_links(cb_org_info):
    """Get extra information for each organisation

    Parameters:
        cb_org_info (DataFrame): Organisation names,
            and extra information from crunchbase. There can be multiple rows
            of different urls/countries for each organisation.
    Returns:
        lower_name2org_info (dict): A dictionary of lower case name
            to organisation information found from crunchbase

    """
    cb_org_info["Name lower"] = cb_org_info["name"].str.lower()
    cb_org_info["Country order"] = cb_org_info["country"].apply(
        lambda x: 0 if x == "United Kingdom" else (1 if x == "United States" else 2)
    )
    cb_org_info["Link order"] = cb_org_info["Link"].apply(lambda x: 0 if x else 1)

    # Randomise order, then sort by country order, then delete duplicates
    # UK data with links is our priority to include.
    cb_org_info.sample(frac=1)
    cb_org_info.sort_values(
        by=["Country order", "Link order"], ascending=True, inplace=True
    )
    cb_org_info.drop_duplicates(["Name lower"], inplace=True)

    lower_name2org_info = cb_org_info.set_index("Name lower")[
        ["Link", "City", "Description", "Description_long", "Postcode"]
    ].to_dict(orient="index")

    return lower_name2org_info
