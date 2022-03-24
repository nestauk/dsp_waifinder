import pandas as pd


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
