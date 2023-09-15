"""
This script was created in September 2023 to refresh parts of the dataset.
This is due to the fact that the SQL database is no long active, so several of the flows, including `ds/pipeline/ai_map/flow.py` will no longer work.
"""

from tqdm import tqdm
import pandas as pd

from ds import config
from ds.pipeline.glassai.utils import (
    get_cleaned_postcode,
    get_lat_long,
    format_glassai_data,
)

from ds.pipeline.ai_map.utils import (
    get_geo_data,
    clean_places,
    get_final_places,
    clean_place_names,
    flow_add_places,
    get_postcode_field,
    convert_unicode,
    add_nuts,
    format_places,
    format_organisations,
)

import json
import requests

bucket_name = config["flows"]["glassai"]["bucket_name"]


def read_datasets():

    # Read the original dataset created using Metaflow
    with open("outputs/data/ai_map_orgs_places.json", "r") as outfile:
        original_output_dict = json.load(outfile)

    # Read the new refreshed GlassAI dataset
    glass_ai = pd.read_csv(
        f"s3://{bucket_name}/dap_uk_ai_map/inputs/glass_ai/nesta_ai.orgs.20230905.csv"
    )

    return original_output_dict, glass_ai


def clean_glass_ai_data(glass_ai):

    # Read NSPL (postcode) dataset
    nspl_data = pd.read_csv(
        f"s3://{bucket_name}/dap_uk_ai_map/inputs/NSPL_FEB_2021_UK.csv",
        usecols={"pcds", "lat", "long"},
        index_col="pcds",
    )

    glass_ai["cleaned_postcode"] = get_cleaned_postcode(glass_ai)

    (
        glass_ai["Latitude"],
        glass_ai["Longitude"],
    ) = get_lat_long(glass_ai, nspl_data)

    glass_ai = format_glassai_data(glass_ai)

    glass_ai["Name_extra"] = ""  # pd.Series(dtype='str')

    glass_ai["Company"] = True
    glass_ai["Funder"] = False
    glass_ai["University / RTO"] = False
    glass_ai["Incubator / accelerator"] = [
        True if v == "Y" else False for v in glass_ai["is_incubator"]
    ]

    return glass_ai


def format_new_glass_ai(new_glass_ai):
    """
    Add the place, postcode information and clean up the description text
    """

    new_glass_ai["City"] = pd.Series(dtype="str")
    _, new_glass_ai = flow_add_places(new_glass_ai)

    new_glass_ai = clean_places(new_glass_ai)
    new_glass_ai["Place"], new_glass_ai["Place type"] = get_final_places(new_glass_ai)

    # If there was no postcode given, then use the geopy package
    new_glass_ai["Postcode"] = new_glass_ai.apply(
        lambda x: get_postcode_field(x["Postcode"], x["geopy_postcode"], x["lat_long"]),
        axis=1,
    )

    new_glass_ai["Postcode"] = new_glass_ai["Postcode"].apply(
        lambda x: x.upper().replace(" ", "") if x else None
    )

    new_glass_ai["Description"] = new_glass_ai["Description"].map(convert_unicode)

    return new_glass_ai


def get_place_info(data):
    """
    Get NUTS codes for the data with the place name and lat/long
    """

    new_places = set(data["Place"].tolist())

    # Trust average lat/long primarily
    places = data.groupby("Place")[["Latitude", "Longitude"]].mean().reset_index()
    # This is a hangover from the previous method where we could use the geography SQL dataset
    places["Latitude geo_data"] = places["Latitude"]
    places["Longitude geo_data"] = places["Longitude"]

    places = add_nuts(places)

    place_type_dict = {
        k: v[0] for k, v in dict(data.groupby("Place")["Place type"].unique()).items()
    }
    places["place_type"] = places["Place"].map(place_type_dict)

    new_places = format_places(places)

    return new_places


def is_url_ok(url):
    # From https://pytutorial.com/check-url-is-reachable
    try:
        get = requests.get(url, timeout=5)
        if get.status_code == 200:
            return True
        else:
            return False
    except:
        return False


def format_url(url):
    """
    url: raw url from the dataset
    """
    if url:
        if url[0:5] == "https":
            return url
        elif url[0:5] == "http:":
            https_version = url.replace("http", "https")
            if is_url_ok(https_version):
                return https_version
            else:
                return url
        else:
            https_version = "https://" + url
            if is_url_ok(https_version):
                return https_version
            else:
                return "http://" + url
    else:
        return None


if __name__ == "__main__":

    original_output_dict, glass_ai = read_datasets()

    glass_ai_types = [
        k
        for k, v in original_output_dict["org_types"].items()
        if v in ["Company", "Incubator / accelerator"]
    ]

    glass_ai = clean_glass_ai_data(glass_ai)

    original_orgs = [org["name"] for org in original_output_dict["orgs"]]
    new_orgs = set(glass_ai["Name"].tolist()).difference(set(original_orgs))

    # Select the original organisations which are in the new GlassAI dataset
    # or that were found from Crunchbase or GtR
    keep_orgs = []
    remove_orgs = []
    for org in original_output_dict["orgs"]:
        if org["name"] in glass_ai["Name"].tolist():
            keep_orgs.append(org)
        else:
            if any([g not in glass_ai_types for g in org["types"]]):
                # These came from crunchbase or GtR
                amended_org = org.copy()
                # Remove the Company or Incubator tags (if they had them)
                amended_org["types"] = [
                    t for t in amended_org["types"] if t not in glass_ai_types
                ]
                keep_orgs.append(amended_org)
            else:
                remove_orgs.append(org)

    print(
        f"There were {len(original_orgs)} organisations in the original dataset, {len(keep_orgs)} of these will be kept as they are. {len(new_orgs)} new organisations will be added and {len(remove_orgs)} will be removed"
    )

    # Get information for the new orgs
    new_glass_ai = glass_ai[glass_ai["Name"].isin(new_orgs)].reset_index()
    new_glass_ai = format_new_glass_ai(new_glass_ai)

    # This takes a long time
    url_format_dict = {}
    for url in tqdm(new_glass_ai["Link"].tolist()):
        url_format_dict[url] = format_url(url)

    new_glass_ai["Link"] = new_glass_ai["Link"].map(url_format_dict)

    # Get the place info for new places not seen before
    original_place_names = [p["name"] for p in original_output_dict["places"]]
    new_places_glass_ai = new_glass_ai[
        ~new_glass_ai["Place"].isin(original_place_names)
    ]
    new_places = get_place_info(new_places_glass_ai)

    # Add everything back together
    all_places = original_output_dict["places"] + new_places

    place_ids_dict = {p["name"]: p["id"] for p in all_places}
    new_glass_ai["place_id"] = new_glass_ai["Place"].apply(
        lambda x: place_ids_dict.get(x)
    )

    new_orgs = format_organisations(
        new_glass_ai, {v: k for k, v in original_output_dict["org_types"].items()}
    )
    all_orgs = keep_orgs + new_orgs

    # Output dict
    new_output_dict = {
        "orgs": all_orgs,
        "places": all_places,
        "org_types": original_output_dict["org_types"],
    }
    with open("outputs/data/ai_map_orgs_places_refreshed.json", "w") as outfile:
        json.dump(new_output_dict, outfile)
