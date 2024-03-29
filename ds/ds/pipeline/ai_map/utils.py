import pandas as pd
import numpy as np
import pgeocode
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter

from tqdm import tqdm
import re
import unicodedata

from ds.utils.metaflow import est_conn


def clean_dash_names(name):
    """
    Clean out names with dashed in like by removing text to the right of the dash
    "lifesdna - wellness wellbeing healthcare data blockchain, AI powered search engine marketplace"
    but not where the dashes don't have spaces on either side, like 'Hyper-Group'
    """
    name_clean = name
    name_extra = ""
    if (" -" in name) or ("- " in name):
        found = re.search(r"(.*?)(\s\-|\-\s)", name)
        name_clean = found.group(1).strip()  # Left of the dash
        name_extra = name[found.span()[1] :].strip()  # Right of the dash

    return name_clean, name_extra


def clean_name_for_dedup(name):
    """
    This is temporary cleaning for the matching process
    e.g. so "The University of Salford" can be merged with "univeristy of salford"
    Ultimately the original version of the name is used (so we have it nicely capitalised)
    """
    name = name.lower()
    if name[0:4] == "the ":
        name = name.replace("the ", "")
    return name


def convert_unicode(text):
    if text:
        # Special conversions
        replace_char_dict = {"‘": "'", "’": "'", "“": '"', "”": '"', "™": "", "®": ""}
        for find_char, rep_char in replace_char_dict.items():
            text = text.replace(find_char, rep_char)
        text = (
            unicodedata.normalize("NFKD", text)
            .encode("utf-8", "ignore")
            .decode("utf-8")
        )
    return text


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

    merged_data["Cleaned name"] = merged_data["Name"].apply(clean_name_for_dedup)

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
        "York",
    ]
    pgeocode_cities = [
        q if q in city_names else None
        for q in address_information["place_name"].tolist()
    ]
    return pgeocode_cities


def get_geopy_addresses(all_output):

    locator = Nominatim(user_agent="myGeocoder", timeout=10)

    def lat_lon_str(lat, lon):
        if pd.notnull(lat) and pd.notnull(lon):
            return f"{lat},{lon}"
        else:
            return None

    all_output["lat_long"] = all_output.apply(
        lambda x: lat_lon_str(x["Latitude"], x["Longitude"]), axis=1
    )

    geopy_addresses = []
    for i, row in tqdm(all_output.iterrows()):
        if pd.notnull(row["City"]):
            geopy_addresses.append(None)
        elif pd.isnull(row["lat_long"]):
            geopy_addresses.append(None)
        else:
            geopy_addresses.append(locator.reverse(row["lat_long"]))

    return pd.DataFrame(
        [x.raw["address"] if x else {"city": None} for x in geopy_addresses]
    )


def get_postcode_field(postcode, geopy_postcode, lat_long):
    if postcode:
        return postcode
    elif geopy_postcode:
        return geopy_postcode
    elif lat_long:
        locator = Nominatim(user_agent="myGeocoder", timeout=10)
        address = locator.reverse(lat_long)
        return address.raw["address"]["postcode"]
    else:
        return None


def clean_place_names(name):
    """
    Very specific place name cleaning
    """
    if "Upon" in name:
        name = name.replace("Upon", "upon")
    return name


def get_geo_data():
    query_geodata = (
        "SELECT geographic_data.city, geographic_data.latitude, geographic_data.longitude "
        "FROM geographic_data "
        "WHERE geographic_data.country='United Kingdom'"
    )
    conn = est_conn()
    geo_data = pd.read_sql(query_geodata, conn)
    geo_data["city"] = geo_data["city"].map(clean_place_names)
    return geo_data


def clean_places(ai_map_data):

    ai_map_data.replace(to_replace=[np.nan], value=None, inplace=True)

    # There are some anomylies, sometimes city is empty but the city
    # district or state district is clearly London/Manchester

    if "geopy_state_district" in ai_map_data:
        ai_map_data.loc[
            (ai_map_data["geopy_city"].isnull())
            & (ai_map_data["geopy_state_district"].str.contains("Greater Manchester")),
            "geopy_city",
        ] = "Manchester"
        ai_map_data.loc[
            (ai_map_data["geopy_city"].isnull())
            & (ai_map_data["geopy_state_district"].str.contains("Greater London")),
            "geopy_city",
        ] = "London"

    if "geopy_city_district" in ai_map_data:
        ai_map_data.loc[
            (ai_map_data["geopy_city"].isnull())
            & (ai_map_data["geopy_city_district"].str.contains("London Borough of")),
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


def get_final_places(ai_map_data, city_names=None):
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

    trust_order = [
        col_name for col_name in trust_order if col_name in ai_map_data.columns
    ]

    # First pass - try to find these locations in the geographic_data
    # e.g. geopy_city_clean='Vale of White Horse' (not in geographic data)
    # but geopy_suburb='Botley' (is in geographic data)

    # geographic_data isn't perfect - "Bury" and "Bury St Edmunds"
    # have the same lat/lon (which is st edmunds one)

    first_pass_places = []
    first_pass_place_types = []

    for place_options in ai_map_data[trust_order].to_dict(orient="records"):
        place_found = False
        for place_type, place_name in place_options.items():
            if city_names:
                if place_name and (place_name != "Bury") and (place_name in city_names):
                    first_pass_places.append(place_name)
                    first_pass_place_types.append(place_type)
                    place_found = True
                    break
            else:
                if place_name and (place_name != "Bury"):
                    first_pass_places.append(place_name)
                    first_pass_place_types.append(place_type)
                    place_found = True
                    break
        if not place_found:
            first_pass_places.append(None)
            first_pass_place_types.append(None)

    # Second pass - fill in gaps with first that comes up (even though its not in geographic data)

    second_pass_places = [
        [(n, t) for n, t in zip(names, types) if n][0] if any(names) else (None, None)
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

    cleaned_final_place = []
    for x in final_place:
        if x:
            if "City of" in str(x):
                x = x.replace("City of ", "")
            x = clean_place_names(str(x))
            cleaned_final_place.append(x)
        else:
            cleaned_final_place.append(None)

    place_types = [
        p.lower().replace("_clean", "").replace("geopy_", "") if p else None
        for p in place_types
    ]

    cities = set([a for a, b in zip(cleaned_final_place, place_types) if b == "city"])
    place_types = [
        "city" if a in cities else b for a, b in zip(cleaned_final_place, place_types)
    ]

    return cleaned_final_place, place_types


def merge_place_data(ai_map_data, geo_data):

    ai_map_data_with_place = ai_map_data.dropna(
        subset=["Place", "Latitude", "Longitude"]
    )
    all_places = set(ai_map_data_with_place["Place"])

    # Trust average lat/long primarily
    places = (
        ai_map_data_with_place.groupby("Place")[["Latitude", "Longitude"]]
        .mean()
        .reset_index()
    )

    geo_data_places = geo_data[geo_data["city"].isin(all_places)].reset_index(drop=True)
    geo_data_places.rename(
        columns={
            "city": "Place",
            "latitude": "Latitude geo_data",
            "longitude": "Longitude geo_data",
        },
        inplace=True,
    )
    places = pd.merge(places, geo_data_places, how="left", on="Place").reset_index(
        drop=True
    )

    return places


def add_nuts(places):
    import hashlib

    from nuts_finder import NutsFinder

    nf = NutsFinder(year=2021, scale=1)

    def get_nuts_info(lat, lon):
        nuts_levels = {1: (None, None), 2: (None, None), 3: (None, None)}
        if lat:
            for nuts_info in nf.find(lat=lat, lon=lon):
                if nuts_info["LEVL_CODE"] != 0:
                    nuts_levels[nuts_info["LEVL_CODE"]] = (
                        nuts_info["NUTS_ID"],
                        nuts_info["NUTS_NAME"],
                    )

        return nuts_levels[1] + nuts_levels[2] + nuts_levels[3]

    def get_nuts_code(places, lat_col, lon_col):
        nuts_info = places.apply(
            lambda x: get_nuts_info(x[lat_col], x[lon_col]), axis=1
        ).tolist()
        return [[x[i] for x in nuts_info] for i in range(6)]

    # The NUTS when using the geo data lat/long
    (
        places.loc[:, "NUTS1_ID geo_data"],
        places.loc[:, "NUTS1_NAME geo_data"],
        places.loc[:, "NUTS2_ID geo_data"],
        places.loc[:, "NUTS2_NAME geo_data"],
        places.loc[:, "NUTS3_ID geo_data"],
        places.loc[:, "NUTS3_NAME geo_data"],
    ) = get_nuts_code(places, "Latitude geo_data", "Longitude geo_data")

    # The NUTS when using the average lat/long
    (
        places.loc[:, "NUTS1_ID centroid"],
        places.loc[:, "NUTS1_NAME centroid"],
        places.loc[:, "NUTS2_ID centroid"],
        places.loc[:, "NUTS2_NAME centroid"],
        places.loc[:, "NUTS3_ID centroid"],
        places.loc[:, "NUTS3_NAME centroid"],
    ) = get_nuts_code(places, "Latitude", "Longitude")

    # For the final output, use the average lat/long unless its not found
    # in which case use the NUTS found using the geodata lat/long

    for i in [1, 2, 3]:
        places[f"NUTS{i}_ID"] = places[f"NUTS{i}_ID centroid"]
        places[f"NUTS{i}_NAME"] = places[f"NUTS{i}_NAME centroid"]
        places.loc[places[f"NUTS{i}_ID"].isnull(), f"NUTS{i}_ID"] = places[
            f"NUTS{i}_ID geo_data"
        ]
        places.loc[places[f"NUTS{i}_NAME"].isnull(), f"NUTS{i}_NAME"] = places[
            f"NUTS{i}_NAME geo_data"
        ]

    places["place_id"] = places.apply(
        lambda x: hashlib.sha1(
            (str(x["Latitude"]) + str(x["Longitude"])).encode("utf-8")
        ).hexdigest(),
        axis=1,
    )

    return places


def format_organisations(ai_map_data, types_dict):

    orgs_list = []
    for i, organisation in ai_map_data.iterrows():
        orgs_list.append(
            {
                "description": organisation["Description"],
                "location": {
                    "lat": organisation["Latitude"],
                    "lon": organisation["Longitude"],
                    "postcode": organisation["Postcode"],
                },
                "name": organisation["Name"],
                "name_extra": organisation["Name_extra"],
                "place_id": organisation["place_id"],
                "types": [
                    type_number
                    for type_name, type_number in types_dict.items()
                    if organisation[type_name]
                ],
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
                    "lat": place["Latitude"],
                    "lon": place["Longitude"],
                },
                "id": place["place_id"],
                "name": place["Place"],
                "region": {
                    "3": {"id": place["NUTS3_ID"], "name": place["NUTS3_NAME"]},
                    "2": {"id": place["NUTS2_ID"], "name": place["NUTS2_NAME"]},
                    "1": {"id": place["NUTS1_ID"], "name": place["NUTS1_NAME"]},
                },
                "type": place["place_type"],
            }
        )
    return places_list


def manual_edits(ai_map_data, incubator_companies_list, orgs_to_remove_list):
    """
    Manually curated edits to the data (delete organisations, change codings)

    incubator_companies_list is a set or list of organisation names that should be
    both in the "Incubator / accelerator" AND the "Company" category.

    orgs_to_remove_list is a set or list of organisation names that need to be removed
    from the data entirely.
    """

    # 1. All incubators shouldn't also be companies
    ai_map_data.loc[ai_map_data["Incubator / accelerator"] == 1, "Company"] = None

    # 2. Some incubators should also be companies
    ai_map_data.loc[ai_map_data["Name"].isin(incubator_companies_list), "Company"] = 1

    # 3. Remove some organisations entirely - Import this list from a txt
    ai_map_data = ai_map_data[
        ~ai_map_data["Name"].isin(orgs_to_remove_list)
    ].reset_index(drop=True)

    return ai_map_data


def flow_add_places(ai_map_data):

    ai_map_data.reset_index(inplace=True)

    # Try to find cities using the pgeocode package (quick but incomplete)
    ai_map_data["pgeocode_city"] = get_pgeocode_cities(ai_map_data["Postcode"].tolist())

    # Fill in the City field with pgeocode_city if Null
    ai_map_data.loc[ai_map_data["City"].isnull(), "City"] = ai_map_data["pgeocode_city"]

    # Find places using the geopy package (slow)
    geopy_addresses = get_geopy_addresses(ai_map_data)
    ai_map_data = pd.concat([ai_map_data, geopy_addresses.add_prefix("geopy_")], axis=1)

    return geopy_addresses, ai_map_data
