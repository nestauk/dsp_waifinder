import re
import pandas as pd


def get_cleaned_postcode(ai_companies_df):
    """
    There are two postcode columns in the data.
    source_postcode:
        comes from the website or linkedin is likely to be the trading
        address of the company.
    ch_postcode:
        comes from the matched Companies House record and is the registered
        address of the company.

    If source_postcode isn't given we use ch_postcode,
    we also lower case and remove spaces from the postcode.
    If the data isn't given it is set to a blank string,
    so we need to convert this to None.
    """

    def clean_postcode(pcd):
        if pd.notnull(pcd):
            return pcd.lower().replace(" ", "")
        else:
            return None

    first_pcd = ai_companies_df["source_postcode"].map(clean_postcode).replace("", None)
    second_pcd = ai_companies_df["ch_postcode"].map(clean_postcode).replace("", None)

    return first_pcd.fillna(second_pcd)


def get_lat_long(ai_companies_df, nspl_data):

    # NSPL doesn't have lat/long for all postcodes (e.g. Isle of Man data)
    # NSPL code this with 'lat'=99.999999 & 'long'=0.0
    nspl_data = nspl_data[
        ~((nspl_data["lat"] == 99.999999) & (nspl_data["long"] == 0.0))
    ]
    # Normalise since glassAI postcodes can sometimes be lower case
    nspl_data.index = nspl_data.index.str.lower().str.replace(" ", "")

    return (
        ai_companies_df["cleaned_postcode"].map(nspl_data["lat"]),
        ai_companies_df["cleaned_postcode"].map(nspl_data["long"]),
    )


def clean_description(description):
    """
    There is an edge case for cleaning, one of the GlassAI companies has:
    "[u'Unlisted Ltd. Real-time AI-powered valuations of private companies.. ']"
    """
    if description[0] == "[u'":
        found_match = re.search(r"\[u\'(.*?)\'\]", description)
        if found_match:
            description = found_match.group(1)
    return description


def format_glassai_data(ai_companies_df):
    ai_companies_df.rename(
        columns={
            "organization_name": "Name",
            "organization_website": "Link",
            "cleaned_postcode": "Postcode",
            "organization_description": "Description",
        },
        inplace=True,
    )

    # Removing GlassAI's url queries
    ai_companies_df["Link"] = ai_companies_df["Link"].apply(
        lambda x: x[0 : x.find("?utm_")] if "?utm_" in x else x
    )

    return ai_companies_df.dropna(subset=["Longitude", "Latitude"]).reset_index(
        drop=True
    )[
        [
            "Name",
            "Link",
            "Longitude",
            "Latitude",
            "is_incubator",
            "Postcode",
            "Description",
        ]
    ]
