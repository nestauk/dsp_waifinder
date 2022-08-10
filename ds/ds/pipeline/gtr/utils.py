import random
import datetime
import ast

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
    "gtr_organisations.addresses, "
    "gtr_organisations.id org_id, "
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
    "SELECT gtr_link_table.id org_id, gtr_link_table.project_id all_project_id "
    "FROM gtr_link_table "
    "WHERE gtr_link_table.id IN  %(l)s"
)

query_all_funding_ids = (
    "SELECT gtr_link_table.project_id, gtr_link_table.id funding_id "
    "FROM gtr_link_table "
    "WHERE gtr_link_table.table_name='gtr_funds' AND gtr_link_table.project_id IN %(l)s"
)

query_all_funding_amounts = (
    "SELECT gtr_funds.id funding_id, gtr_funds.id, gtr_funds.amount, gtr_funds.end, gtr_funds.start "
    "FROM gtr_funds "
    "WHERE gtr_funds.currencyCode='GBP' "
)

# Some of the urls can be found in the crunchbase data
query_cb_urls = (
    "SELECT crunchbase_organizations.homepage_url Link, "
    "crunchbase_organizations.name, "
    "crunchbase_organizations.country, "
    "crunchbase_organizations.long_description Description, "
    "crunchbase_organizations.short_description Description_short "
    "FROM crunchbase_organizations "
    "WHERE LOWER(crunchbase_organizations.name) IN %(l)s"
)


def clean_end_dates(df):
    """
    Sometimes (approx 0.1% of the time) the end date isn't given, in this case replace it with the start date
    """

    df["funding_date"] = df[["end", "start"]].apply(
        lambda x: x["end"] if isinstance(x["end"], datetime.datetime) else x["start"],
        axis=1,
    )
    # Needed so their aren't errors in finding the max date
    df["funding_date"] = pd.to_datetime(
        df["funding_date"], infer_datetime_format=True, errors="coerce"
    )

    return df


def clean_gtr_address(df):
    """
    GtR's address field comes in a dictionary form, so access parts of this to find the postcode
    and the city (which requires a little cleaning)
    """
    df["address"] = df["addresses"].apply(
        lambda x: x if pd.isnull(x) else ast.literal_eval(x).get("address")
    )

    df["Postcode"] = df["address"].apply(
        lambda x: x if pd.isnull(x) else x.get("postCode")
    )
    df["City"] = df["address"].apply(lambda x: x if pd.isnull(x) else x.get("city"))
    df["Region"] = df["address"].apply(lambda x: x if pd.isnull(x) else x.get("region"))

    # The region is too broad for our needs, e.g. 'North East', apart from 'London'
    # Cities are only given for a small proportion of the data and need cleaning,
    # Some are all captialised 'SHEFFIELD' and there is a "PO BOX 532" in there

    def clean_city(name):
        if pd.notnull(name) and "PO BOX" not in name:
            return name.capitalize()
        else:
            return None

    df["City"] = df["City"].apply(clean_city)
    df.loc[pd.isnull(df["City"]) & (df["Region"] == "London"), "City"] = "London"
    return df


def combine_org_data(ai_org_funding_ids, funding_info, ai_org_info, ai_org_project_ids):
    """
    Parameters:
            ai_org_funding_ids (DataFrame):
                    A dataframe of the project id <-> funding id links for all projects from AI organisations only
            funding_info (DataFrame):
                    A dataframe of the funding id <-> funding amounts/start and end dates for all funding
            ai_org_info (DataFrame):
                    A dataframe of the ai project id -> organisational information for AI projects only
            ai_org_project_ids (DataFrame):
                    A dataframe of all project id -> organisation id for AI organisations only

            Where "AI organisations" are those organisations where at least one AI tagged topic project has
            taken place.
    Returns:
            ai_org_info (DataFrame):
                    Aggregated information about each AI organisation.
    """

    # Add the funding info to all the projects from AI organisations
    ai_org_funding_ids = ai_org_funding_ids.merge(
        funding_info, how="left", on="funding_id"
    )
    # For each project, get the total amount of funding, the latest funding date and the number of funding rounds
    total_funds_all_proj = (
        ai_org_funding_ids.groupby("project_id")
        .aggregate({"amount": "sum", "funding_date": "max", "id": "count"})
        .reset_index()
    )
    total_funds_all_proj.rename(
        columns={
            "amount": "total_funding",
            "funding_date": "last_funding_date",
            "id": "n_funding_rounds",
        },
        inplace=True,
    )
    # Add this funding info for each project to the org data
    ai_org_info = ai_org_info.merge(
        total_funds_all_proj, how="left", left_on="ai_project_id", right_on="project_id"
    )

    # Get aggregated information for each organisation.
    # Combine each org with all the project IDs - this is because we need to use
    # the org info (name etc) rather than the org id to count unique num projects
    ai_org_info = ai_org_info.merge(ai_org_project_ids, how="left", on="org_id")

    # There is some duplication in this data where orgs with the same
    # name and lat/long coords are given 2 org IDs.
    # Merge rows where this happens, and count up the distinct project IDs

    ai_org_info = (
        ai_org_info.groupby(
            ["Name", "Latitude", "Longitude", "country_name", "Postcode", "City"],
            dropna=False,
        )
        .agg(
            {
                "ai_project_id": lambda x: x.nunique(),
                "all_project_id": lambda x: x.nunique(),
                "total_funding": lambda x: x.sum(),
                "last_funding_date": lambda x: max(x),
                "n_funding_rounds": lambda x: x.sum(),
            }
        )
        .reset_index()
    ).rename(
        columns={"ai_project_id": "n_ai_projects", "all_project_id": "n_total_projects"}
    )
    ai_org_info["last_funding_year"] = ai_org_info["last_funding_date"].apply(
        lambda x: x.year + x.month / 12
    )

    return ai_org_info


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
        ["Link", "Description", "Description_short"]
    ].to_dict(orient="index")

    return lower_name2org_info


def match_clean(name):
    import re

    name = str(name)
    name = name.replace("&", "and")
    name = name.replace(" ltd", " limited")
    name = re.sub(r"[^A-Za-z0-9 ]+", "", name)
    return name.lower()


def get_org_name_list(org_names_keep):
    """
    Add some modifications to this list to account for different ways of writing things
    "The University of Salford" and "University of Salford" and "Salford University"
    Also there are lots of instances of "The" being at the beginning and sometimes not.
    Not all of these can be added in a rule based manner, so we need to add in some custom university
    names which are spelt slightly differently in the GtR data

    """

    # We will also only match on lower case
    org_names_keep_enhanced = set([name.lower() for name in org_names_keep])
    for org_name in org_names_keep:
        org_name = org_name.lower()
        if "university of" in org_name:
            org_names_keep_enhanced.add(
                org_name.replace("the university of", "university of")
            )
            org_names_keep_enhanced.add(
                org_name.replace("the university of ", "") + " university"
            )
            org_names_keep_enhanced.add(
                org_name.replace("university of ", "") + " university"
            )
        if org_name[0:4] == "the ":
            org_names_keep_enhanced.add(org_name[4:])
        org_names_keep_enhanced.add("the " + org_name)

    # Custom edits (these have only been added if something similar came up in the given list)
    # e.g. GtR has "Brunel University" but this list has 'Brunel University London'
    # Other variations include 'Imperial College of Science, Technology and Medicine'
    # 'London School of Hygiene and Tropical Medicine', 'London School of Economics and Political Science', 'University of Northumbria at Newcastle'
    # 'The Open University', 'Queen Mary London University', "Queen's University Belfast", 'Royal Holloway and Bedford New College'
    # 'University of St. Andrews'
    custom_org_names = {
        "Brunel University",
        "Imperial College London",
        "London Sch of Hygiene and Trop Medicine",
        "London School of Economics & Pol Sci",
        "Northumbria University",
        "Queen Mary, University of London",
        "Queen's University of Belfast",
        "Royal Holloway, University of London",
        "University of St Andrews",
        "City University London",
        "Leeds Metropolitan University",
        "Manchester Metropolitan University",
        "Nottingham Trent University",
        "The Robert Gordon University",
        "University of Abertay Dundee",
        "University of London",
        "University of Teesside",
        "University of Ulster",
        "University of Wales",
        "University of the Arts London",
        "University of the West of England",
        "Royal Veterinary College",
        "University of Wales, Newport",
        "Glyndwr University",
        "Southampton Solent University",
        "Courtauld Institute Of Art",
        "Plymouth College of Art and Design",
        "Writtle College",
    }

    org_names_keep_enhanced.update(custom_org_names)
    org_names_keep_enhanced = {match_clean(name) for name in org_names_keep_enhanced}

    return org_names_keep_enhanced
