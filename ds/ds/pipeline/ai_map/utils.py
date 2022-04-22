import pandas as pd
import numpy as np
from geopy.geocoders import Nominatim
import pgeocode
from geopy.extra.rate_limiter import RateLimiter
from tqdm import tqdm

from ds.utils.metaflow import est_conn


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


def get_geopy_addresses(all_output):

    locator = Nominatim(user_agent="myGeocoder", timeout=10)
    all_output["lat_long"] = (
        all_output["Latitude"].map(str) + "," + all_output["Longitude"].map(str)
    )

    geopy_addresses = []
    for i, row in tqdm(all_output.iterrows()):
        if pd.notnull(row["City"]):
            geopy_addresses.append(None)
        else:
            geopy_addresses.append(locator.reverse(row["lat_long"]))

    return pd.DataFrame(
        [x.raw["address"] if x else {"city": None} for x in geopy_addresses]
    )


def get_geo_data():
    query_geodata = (
        "SELECT geographic_data.city, geographic_data.latitude, geographic_data.longitude "
        "FROM geographic_data "
        "WHERE geographic_data.country='United Kingdom'"
    )
    conn = est_conn()
    return pd.read_sql(query_geodata, conn)


def clean_places(ai_map_data):

    ai_map_data.replace(to_replace=[np.nan], value=None, inplace=True)

    # London is an anomyly, sometimes city is empty but the city district or state district is clearly London
    ai_map_data.loc[
        (ai_map_data["geopy_city"].isnull())
        & (ai_map_data["geopy_city_district"].str.contains("London Borough of"))
        & (ai_map_data["geopy_state_district"].str.contains("Greater London")),
        "geopy_city",
    ] = "London"

    def clean_city_names(city_name):
        if city_name:
            city_name_clean_map = {
                "Aberdeen City": "Aberdeen",
                "City of Westminster": "London",
            }
            city_name = city_name_clean_map.get(city_name, city_name)
            city_name = city_name.replace("City of ", "")
            return city_name
        else:
            return None

    ai_map_data["geopy_city_clean"] = ai_map_data["geopy_city"].map(clean_city_names)
    ai_map_data["City_clean"] = ai_map_data["City"].map(clean_city_names)

    return ai_map_data


def get_final_places(ai_map_data, city_names):
    # In order of preference to look in
    # Only add if the value is in the list of 'city' names

    trust_order = [
        "City_clean",
        "geopy_city_clean",
        "geopy_town",
        "geopy_suburb",
        "geopy_village",
        "geopy_county",
        "geopy_neighbourhood",
    ]

    # First pass - try to find these locations in the geographic_data
    # e.g. geopy_city_clean='Vale of White Horse' (not in geographic data)
    # but geopy_suburb='Botley' (is in geographic data)

    first_pass_places = []
    first_pass_place_types = []

    for place_options in ai_map_data[trust_order].to_dict(orient="records"):
        place_found = False
        for place_type, place_name in place_options.items():
            if place_name and (place_name in city_names):
                first_pass_places.append(place_name)
                first_pass_place_types.append(place_type)
                place_found = True
                break
        if not place_found:
            first_pass_places.append(None)
            first_pass_place_types.append(None)

    # Second pass - fill in gaps with first that comes up (even though its not in geographic data)

    second_pass_places = [
        [(n, t) for n, t in zip(names, types) if n][0]
        for names, types in zip(
            ai_map_data[trust_order].values.tolist(), [trust_order] * len(ai_map_data)
        )
    ]

    final_place = [
        n1 if n1 else n2 for n1, (n2, _) in zip(first_pass_places, second_pass_places)
    ]
    place_types = [
        t1 if t1 else t2
        for t1, (_, t2) in zip(first_pass_place_types, second_pass_places)
    ]

    final_place = [
        x.replace("City of ", "") if "City of" in str(x) else x for x in final_place
    ]
    place_types = [
        p.lower().replace("_clean", "").replace("geopy_", "") for p in place_types
    ]

    cities = set([a for a, b in zip(final_place, place_types) if b == "city"])
    place_types = [
        "city" if a in cities else b for a, b in zip(final_place, place_types)
    ]

    return final_place, place_types


def merge_place_data(ai_map_data, geo_data):
    all_places = set(ai_map_data["Place"])

    places = geo_data[geo_data["city"].isin(all_places)].reset_index(drop=True)
    places.rename(
        columns={"city": "Place", "latitude": "Latitude", "longitude": "Longitude"},
        inplace=True,
    )

    average_latlong_places = (
        ai_map_data.groupby("Place")[["Latitude", "Longitude"]].mean().reset_index()
    )
    average_latlong_places.rename(
        columns={"Latitude": "Latitude_centroid", "Longitude": "Longitude_centroid"},
        inplace=True,
    )
    places = pd.merge(
        places, average_latlong_places, how="left", on="Place"
    ).reset_index(drop=True)

    return places


def add_nuts(places):
    from nuts_finder import NutsFinder

    nf = NutsFinder(year=2021)

    def get_nuts_info(lat, lon):
        if lat:
            for nuts_info in nf.find(lat=lat, lon=lon):
                if nuts_info["LEVL_CODE"] == 3:
                    return (nuts_info["NUTS_ID"], nuts_info["NUTS_NAME"])
        return (None, None)

    def get_nuts_code(places, lat_col, lon_col):
        nuts_info = places.apply(
            lambda x: get_nuts_info(x[lat_col], x[lon_col]), axis=1
        ).tolist()
        return [x[0] for x in nuts_info], [x[1] for x in nuts_info]

    # The NUTS when using the geo data lat/long
    (
        places.loc[:, "NUTS3_ID geo_data"],
        places.loc[:, "NUTS3_NAME geo_data"],
    ) = get_nuts_code(places, "Latitude", "Longitude")

    # The NUTS when using the average lat/long
    (
        places.loc[:, "NUTS3_ID centroid"],
        places.loc[:, "NUTS3_NAME centroid"],
    ) = get_nuts_code(places, "Latitude_centroid", "Longitude_centroid")

    # For the final output, use the geodata unless its not found
    places["NUTS3_ID"] = places["NUTS3_ID geo_data"]
    places["NUTS3_NAME"] = places["NUTS3_NAME geo_data"]
    places.loc[places["NUTS3_ID"].isnull(), "NUTS3_ID"] = places["NUTS3_ID centroid"]
    places.loc[places["NUTS3_NAME"].isnull(), "NUTS3_NAME"] = places[
        "NUTS3_NAME centroid"
    ]

    places["place_id"] = places.apply(
        lambda x: hash(x["Place"] + (x["NUTS3_ID"] if x["NUTS3_ID"] else "X")), axis=1
    )

    return places


def format_organisations(ai_map_data):

    orgs_list = []
    for i, organisation in ai_map_data.iterrows():
        orgs_list.append(
            {
                "address": {
                    "postcode": organisation["Postcode"],
                    "place": organisation["Place"],
                },
                "description": organisation["Description"],
                "location": {
                    "latitude": organisation["Latitude"],
                    "longitude": organisation["Longitude"],
                },
                "name": organisation["Name"],
                "place_id": organisation["place_id"],
                "sector_label": None,
                "sector_sic_code": None,
                "topics": None,
                "type": {
                    "Company": organisation["Company"],
                    "Funder": organisation["Funder"],
                    "Incubator / accelerator": organisation["Incubator / accelerator"],
                    "University / RTO": organisation["University / RTO"],
                },
                "url": organisation["Link"],
            }
        )

    return orgs_list


def format_places(places):
    places_list = []
    for i, place in places.iterrows():
        places_list.append(
            {
                "centroid": {
                    "latitude": place["Latitude"],
                    "longitude": place["Longitude"],
                },
                "id": place["place_id"],
                "name": place["Place"],
                "region_id": place["NUTS3_ID"],
                "region_name": place["NUTS3_NAME"],
                "type": place["place_type"],
            }
        )
    return places_list
