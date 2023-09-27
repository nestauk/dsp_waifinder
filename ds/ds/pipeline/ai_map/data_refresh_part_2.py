"""
This script was created in September 2023 to add extra location information for the Funders.
"""

import json
import pandas as pd
from ds.pipeline.ai_map.utils import (
    add_nuts,
    format_places,
    flow_add_places,
    clean_places,
    get_final_places,
)

if __name__ == "__main__":
    print("Import the dataset")
    with open(
        "../etl/data/outputs/ai_map_orgs_places_locations_populated.json", "r"
    ) as outfile:
        ai_map_orgs_places_locations_populated = json.load(outfile)

    place_id_2_name = {
        p["id"]: p["name"] for p in ai_map_orgs_places_locations_populated["places"]
    }

    prev_ai_map_data = pd.DataFrame(ai_map_orgs_places_locations_populated["orgs"])
    prev_ai_map_data["Latitude"] = prev_ai_map_data["location"].apply(
        lambda x: x["lat"]
    )
    prev_ai_map_data["Longitude"] = prev_ai_map_data["location"].apply(
        lambda x: x["lon"]
    )
    prev_ai_map_data["Postcode"] = prev_ai_map_data["location"].apply(
        lambda x: x.get("postcode")
    )
    prev_ai_map_data["Place"] = prev_ai_map_data["place_id"].map(place_id_2_name)

    print("1. Find place names for data with no place_id using postcode")

    find_locs_df = prev_ai_map_data[pd.isnull(prev_ai_map_data["place_id"])]
    find_locs_df["City"] = None  # Needed to use flow_add_places

    _, find_locs_df = flow_add_places(find_locs_df)
    find_locs_df = clean_places(find_locs_df)
    find_locs_df["Place"], find_locs_df["Place type"] = get_final_places(find_locs_df)

    print(
        "2. Combine previously found with new places, and get average lat/lon and place IDs"
    )

    have_locs_df = prev_ai_map_data[pd.notnull(prev_ai_map_data["place_id"])]
    new_ai_map_data = pd.concat([have_locs_df, find_locs_df]).reset_index()

    all_places_with_place = new_ai_map_data.dropna(
        subset=["Place", "Latitude", "Longitude"]
    )
    # Get average lat/long for each place
    places = (
        all_places_with_place.groupby("Place")[["Latitude", "Longitude"]]
        .mean()
        .reset_index()
    )

    # Find types for each place (use previously found types too)
    place_type_dict = {
        p["name"]: p["type"] for p in ai_map_orgs_places_locations_populated["places"]
    }

    new_place_type_dict = {
        k: v[0]
        for k, v in dict(find_locs_df.groupby("Place")["Place type"].unique()).items()
        if k not in place_type_dict
    }
    place_type_dict.update(new_place_type_dict)

    places["place_type"] = places["Place"].map(place_type_dict)

    print(f"3. Get NUTS info for {len(places)} places")

    # This is a hangover from the previous method where we could use the geography SQL dataset
    places["Latitude geo_data"] = places["Latitude"]
    places["Longitude geo_data"] = places["Longitude"]

    places = add_nuts(places)

    print("4. Recreate places dict and add place id to orgs")

    new_ai_map_data.drop(
        columns="place_id", inplace=True
    )  # remove any old place IDs as these will be recalculated
    new_ai_map_data = pd.merge(
        new_ai_map_data, places[["Place", "place_id"]], how="left", on="Place"
    ).reset_index(drop=True)

    # Get into the output format
    new_ai_map_data["location"] = new_ai_map_data.apply(
        lambda x: {
            "lat": x["Latitude"],
            "lon": x["Longitude"],
            "postcode": x["Postcode"],
        },
        axis=1,
    )
    new_orgs = new_ai_map_data[
        ["description", "location", "name", "name_extra", "place_id", "types", "url"]
    ].to_dict(orient="records")

    new_places = format_places(places)

    print("Output")
    new_output_dict = {
        "orgs": new_orgs,
        "places": new_places,
        "org_types": ai_map_orgs_places_locations_populated["org_types"],
    }
    with open("outputs/data/ai_map_orgs_places_refreshed_part_2.json", "w") as outfile:
        json.dump(new_output_dict, outfile)
