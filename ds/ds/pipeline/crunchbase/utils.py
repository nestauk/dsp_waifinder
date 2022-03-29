import pandas as pd

import random

cb_ai_tags = [
    "3d printing",
    "3d technology",
    "a/b testing",
    "agtech",
    "analytics",
    "android",
    "app discovery",
    "application specific integrated circuit (asic)",
    "apps",
    "artificial intelligence",
    "assistive technology",
    "augmented reality",
    "autonomous vehicles",
    "big data",
    "bioinformatics",
    "biotechnology",
    "bitcoin",
    "blockchain",
    "blogging platforms",
    "browser extensions",
    "business intelligence",
    "cad",
    "cleantech",
    "cloud computing",
    "cloud data services",
    "cloud infrastructure",
    "cloud management",
    "cloud security",
    "cloud storage",
    "cms",
    "communications infrastructure",
    "computer",
    "computer vision",
    "consumer software",
    "crm",
    "crowdfunding",
    "crowdsourcing",
    "cryptocurrency",
    "data center",
    "data center automation",
    "data integration",
    "data mining",
    "data storage",
    "data visualization",
    "database",
    "desktop apps",
    "developer apis",
    "developer platform",
    "developer tools",
    "drone management",
    "drones",
    "dsp",
    "embedded software",
    "embedded systems",
    "ethereum",
    "facebook",
    "field-programmable gate array (fpga)",
    "file sharing",
    "fintech",
    "gaming",
    "google",
    "google glass",
    "govtech",
    "gps",
    "gpu",
    "human computer interaction",
    "image recognition",
    "industrial automation",
    "infrastructure",
    "intelligent systems",
    "internet",
    "internet of things",
    "ios",
    "isp",
    "it infrastructure",
    "legal tech",
    "linux",
    "machine learning",
    "macos",
    "mobile apps",
    "mobile devices",
    "motion capture",
    "nanotechnology",
    "natural language processing",
    "operating systems",
    "photo editing",
    "predictive analytics",
    "qr codes",
    "robotics",
    "sales automation",
    "semantic search",
    "semantic web",
    "simulation",
    "software",
    "software engineering",
    "spam filtering",
    "speech recognition",
    "text analytics",
    "visual search",
    "web apps",
    "web browsers",
    "web design",
    "web development",
    "web hosting",
]

# There can be muliple categories for each org
query_ai_topics = (
    "SELECT crunchbase_organizations_categories.organization_id org_id "
    "FROM crunchbase_organizations_categories "
    "WHERE crunchbase_organizations_categories.category_name IN %(l)s "
)

query_ai_investors = (
    "SELECT count(crunchbase_funding_rounds.org_id) num_ai_orgs_funded, "
    "crunchbase_investors.id investor_id, crunchbase_investors.type, "
    "crunchbase_investors.investor_types, "
    "crunchbase_investors.name Name, crunchbase_investors.investment_count, "
    "crunchbase_investors.country, crunchbase_investors.location_id, "
    "crunchbase_investors.domain Link "
    "FROM crunchbase_funding_rounds "
    "INNER JOIN crunchbase_investments "
    "ON crunchbase_funding_rounds.id=crunchbase_investments.funding_round_id "
    "INNER JOIN crunchbase_investors "
    "ON crunchbase_investments.investor_id = crunchbase_investors.id "
    "WHERE crunchbase_funding_rounds.org_id IN %(l)s "
    "GROUP BY crunchbase_investors.id"
)


query_ai_investors_all_topics = (
    "SELECT crunchbase_investments.investor_id investor_id, "
    "count(crunchbase_funding_rounds.org_id) num_orgs_funded "
    "FROM crunchbase_funding_rounds "
    "INNER JOIN crunchbase_investments "
    "ON crunchbase_investments.funding_round_id=crunchbase_funding_rounds.id "
    "WHERE crunchbase_investments.investor_id IN  %(l)s "
    "GROUP BY crunchbase_investments.investor_id"
)

query_city = (
    "SELECT geographic_data.id, "
    "geographic_data.latitude Latitude, geographic_data.longitude Longitude "
    "FROM geographic_data "
    "WHERE geographic_data.id IN %(l)s "
)


def sql_query_chunks(id_list, sql_query, conn, chunk_size=100000):
    """
    SQL can have problems with querying many ids in a list
    (for queries with 'WHERE id IN %(l)s'),
    so can query in chunks and then merge together.
    """

    output_chunks = []
    for i in range(0, len(id_list), chunk_size):
        id_list_chunk = id_list[i : i + chunk_size]
        output_df_chunk = pd.read_sql(
            sql_query, conn, params={"l": tuple(id_list_chunk)}
        )
        output_chunks.append(output_df_chunk)
    output_df = pd.concat(output_chunks)

    return output_df


def get_ai_investors(ai_org_ids, query_ai_investors, conn):
    """
    Get the investors of AI organisations from a list of organisation IDs and
    find how many AI organisations each of them have funded.
    This needs to be queried in chunks and then combined together, where
    the AI org counts for each of the investors need to be summed for
    each chunk of results.
    """
    ai_investors_df = sql_query_chunks(ai_org_ids, query_ai_investors, conn)

    df_investor_columns = ai_investors_df.columns.tolist()
    df_investor_columns.remove("num_ai_orgs_funded")
    return (
        ai_investors_df.groupby(df_investor_columns)["num_ai_orgs_funded"]
        .sum()
        .reset_index()
    )


def add_lat_lon_noise(ai_investors_df):
    """
    Add noise to the lat/long data since in some cities the lat/long are the same
    Only do this for duplicated lat/long
    """

    duplicate_lat_lon = ai_investors_df[["Latitude", "Longitude"]].value_counts() > 1
    duplicate_lat_lon = duplicate_lat_lon[duplicate_lat_lon].index

    def overlap_flag(row):
        return (row["Latitude"], row["Longitude"]) in duplicate_lat_lon

    ai_investors_df["Overlap flag"] = ai_investors_df[["Latitude", "Longitude"]].apply(
        overlap_flag, axis=1
    )

    def add_lat_noise(row):
        random.seed(42)
        if row["Overlap flag"]:
            return row["Latitude"] + random.uniform(-0.05, 0.05)
        else:
            return row["Latitude"]

    def add_lon_noise(row):
        random.seed(42)
        if row["Overlap flag"]:
            return row["Longitude"] + random.uniform(-0.07, 0.07)
        else:
            return row["Longitude"]

    ai_investors_df["Latitude"] = ai_investors_df.apply(add_lat_noise, axis=1)
    ai_investors_df["Longitude"] = ai_investors_df.apply(add_lon_noise, axis=1)

    ai_investors_df.drop(columns="Overlap flag", inplace=True)

    return ai_investors_df
