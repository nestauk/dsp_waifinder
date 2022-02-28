import configparser
import os

import pymysql

from sqlalchemy import create_engine

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
    "SELECT crunchbase_organizations_categories.organization_id as 'org_id' "
    "FROM crunchbase_organizations_categories "
    "WHERE crunchbase_organizations_categories.category_name IN %(l)s "
)

query_ai_investors = (
    "SELECT count(crunchbase_funding_rounds.org_id) as 'num_ai_orgs_funded', "
    "crunchbase_investors.id as 'investor_id', crunchbase_investors.type, crunchbase_investors.investor_types, "
    "crunchbase_investors.name as 'Name', crunchbase_investors.investment_count, "
    "crunchbase_investors.country, crunchbase_investors.location_id, "
    "crunchbase_investors.domain as 'Link' "
    "FROM crunchbase_funding_rounds "
    "INNER JOIN crunchbase_investments ON crunchbase_funding_rounds.id = crunchbase_investments.funding_round_id "
    "INNER JOIN crunchbase_investors ON crunchbase_investments.investor_id = crunchbase_investors.id "
    "WHERE crunchbase_funding_rounds.org_id IN %(l)s "
    "GROUP BY crunchbase_investors.id"
)


query_ai_investors_all_topics = (
    "SELECT crunchbase_investments.investor_id as 'investor_id', "
    "count(crunchbase_funding_rounds.org_id) as 'num_orgs_funded' "
    "FROM crunchbase_funding_rounds "
    "INNER JOIN crunchbase_investments ON crunchbase_investments.funding_round_id = crunchbase_funding_rounds.id "
    "WHERE crunchbase_investments.investor_id IN  %(l)s "
    "GROUP BY crunchbase_investments.investor_id"
)

query_city = (
    "SELECT geographic_data.id, geographic_data.latitude as 'Latitude', geographic_data.longitude as 'Longitude' "
    "FROM geographic_data "
    "WHERE geographic_data.id IN %(l)s "
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
