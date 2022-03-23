# ---
# jupyter:
#   jupytext:
#     cell_metadata_filter: -all
#     comment_magics: true
#     text_representation:
#       extension: .py
#       format_name: percent
#       format_version: '1.3'
#       jupytext_version: 1.13.7
#   kernelspec:
#     display_name: Python 3 (ipykernel)
#     language: python
#     name: python3
# ---

# %% [markdown]
# ## Temporary outputs for Crunchbase data
# In the future there will be a flow to combine the Glass, GtR and Crunchbase data and put them into the Schema output form.
#
# In the interim - this notebook will get the Crunchbase data into the output form.

# %%
from ds.getters.crunchbase import get_cb_ai_investors

import random

# %%
cb_output = get_cb_ai_investors()

# %%
# The column order is important
cb_output = cb_output[["Name", "Link", "Latitude", "Longitude"]]

# %%
# Make sure all columns are in correct form

cb_output["Name"] = cb_output["Name"].astype(str)
cb_output["Link"] = cb_output["Link"].astype(str)
cb_output["Latitude"] = cb_output["Latitude"].astype(float)
cb_output["Longitude"] = cb_output["Longitude"].astype(float)

# %%
# Add noise to the data since in some cities the lat/long are the same
# Only do this for duplicated lat/long

duplicate_lat_lon = cb_output[["Latitude", "Longitude"]].value_counts() > 1
duplicate_lat_lon = duplicate_lat_lon[duplicate_lat_lon].index


def overlap_flag(row):
    return (row["Latitude"], row["Longitude"]) in duplicate_lat_lon


cb_output["Overlap flag"] = cb_output[["Latitude", "Longitude"]].apply(
    overlap_flag, axis=1
)


def add_lat_noise(row):
    if row["Overlap flag"]:
        return row["Latitude"] + random.uniform(-0.05, 0.05)
    else:
        return row["Latitude"]


def add_lon_noise(row):
    if row["Overlap flag"]:
        return row["Longitude"] + random.uniform(-0.07, 0.07)
    else:
        return row["Longitude"]


# %%
cb_output["Latitude"] = cb_output.apply(add_lat_noise, axis=1)
cb_output["Longitude"] = cb_output.apply(add_lon_noise, axis=1)

# %%
# Add the 4 extra headers
cb_output["Company"] = [None] * len(cb_output)
cb_output["Funder"] = [1] * len(cb_output)
cb_output["Incubator / accelerator"] = [None] * len(cb_output)
cb_output["University / RTO"] = [None] * len(cb_output)


# %%
# Add the 11 sector options
for i in range(1, 12):
    cb_output[f"Sector {i}"] = [None] * len(cb_output)

# %%
cb_output.drop(columns="Overlap flag", inplace=True)

# %%
cb_output.to_csv("../../outputs/data/crunchbase.tsv", index=False, sep="\t")

# %%
