import pandas as pd
from geopy.geocoders import Nominatim
import pgeocode
from geopy.extra.rate_limiter import RateLimiter
from tqdm import tqdm


def clean_name(name):
    name = name.lower()
    if name[0:4] == "the ":
        name = name.replace("the ", "")
    return name


def trust_rating(row):
    if pd.notnull(row["Company"]):
        return 1
    elif pd.notnull(row["University / RTO"]):
        return 2
    else:
        return 3


def get_merged_data(merged_data):
    """
    Organisation names can be duplicated (before and after cleaning), so we
    remove duplicate rows and merge together fields for the duplicates.

    Before deduplication, sort the rows by the most trustworthy data source.
    This is useful if there are conflicting Links or Lat/Long values.
    Trust Glass AI first (company) - since several sources were considered
        to find Links and Lat/Long,
    then trust GtR (university) - since Lat/Long is given in this data,
    and lastly trust Crunchbase (funder) - since this had City at its most
        granular location, so the Lat/Long data isn't particularly accurate.
    """

    merged_data["Cleaned name"] = merged_data["Name"].apply(clean_name)

    merged_data["Trust order"] = merged_data.apply(trust_rating, axis=1)
    merged_data_dedupe = merged_data.sort_values(by="Trust order", ascending=True)

    # Merge a few key columns for duplicate names if any Nans were given
    key_columns = [
        "Link",
        "Company",
        "Funder",
        "Incubator / accelerator",
        "University / RTO",
    ]
    merged_key_columns = merged_data_dedupe.groupby("Cleaned name")[key_columns].first()
    # Update merged_data_dedupe for these columns
    for col_name in key_columns:
        merged_data_dedupe[col_name] = merged_data_dedupe["Cleaned name"].map(
            merged_key_columns[col_name]
        )

    merged_data_dedupe.drop_duplicates(subset=["Cleaned name"], inplace=True)
    merged_data_dedupe.drop(columns=["Cleaned name", "Trust order"], inplace=True)

    return merged_data_dedupe


def get_pgeocode_cities(postcode_list):
    """
    Find the city for a list of postcodes using the pgeocode package.
    postcode_list can contain None's

    pgeocode isn't perfect for finding cities (e.g. Dulwich came up as the place_name),
    and there can be multiple place_name fields for the same postcode first parts,
    so only output cities if they come from a predefined list (otherwise output None).
    """
    nomi = pgeocode.Nominatim("gb")
    # UK postcodes have a first part, and a 3 digit last part
    # pgeocode only uses the first part of the postcode
    postcodes = [
        (p.replace(" ", "")[0:-3]).upper() if pd.notnull(p) else None
        for p in postcode_list
    ]
    address_information = nomi.query_postal_code(postcodes)

    city_names = [
        "London",
        "Reading",
        "Coventry",
        "Liverpool",
        "Manchester",
        "Leeds",
        "Glasgow",
        "Aberdeen",
        "Edinburgh",
        "Cardiff",
        "Bristol",
        "Birmingham",
        "Sheffield",
    ]
    pgeocode_cities = [
        q if q in city_names else None
        for q in address_information["place_name"].tolist()
    ]
    return pgeocode_cities


def get_geopy_cities(all_output):

    locator = Nominatim(user_agent="myGeocoder", timeout=10)
    all_output["lat_long"] = (
        all_output["Latitude"].map(str) + "," + all_output["Longitude"].map(str)
    )

    geopy_cities = []
    for i, row in tqdm(all_output.iterrows()):
        if pd.notnull(row["City"]):
            geopy_cities.append(None)
        else:
            geopy_cities.append(locator.reverse(row["lat_long"]))

    def get_city(x):
        address_info = x.raw["address"]
        if address_info.get("city"):
            return address_info.get("city")
        elif address_info.get("town"):
            return address_info.get("town")
        else:
            county = address_info.get("county")
            suburb = address_info.get("suburb")
            village = address_info.get("village")
            if county and ("City" in county):
                # e.g. City of Edinburgh but not Surrey
                return county
            elif suburb:
                return suburb
            elif county:
                return county
            elif village:
                return village
            else:
                return None

    geopy_cities = [get_city(address) if address else None for address in geopy_cities]
    return geopy_cities
