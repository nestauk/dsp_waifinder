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
# # Data Analysis
#
# Descriptive analysis of the final AI map dataset.
# - How big is it?
# - Which organisations come from the different sources?
# - What is the coverage for the different fields?

# %%
import pandas as pd

import json
from collections import Counter

# %%
with open("../../outputs/data/ai_map_orgs_places.json", "r") as f:
    data = json.load(f)

# %%
data.keys()

# %% [markdown]
# ## Organisations

# %%
orgs = data["orgs"]
print(f"There are {len(orgs)} organisations in the dataset")

# %%
org_urls = [org["url"] for org in orgs]
print(
    f"{len([i for i in org_urls if i])*100/len(orgs)}% of the organisations have urls"
)
org_desc = [org["description"] for org in orgs]
print(
    f"{len([i for i in org_desc if i])*100/len(orgs)}% of the organisations have descriptions"
)


# %%
# Orgs with no url
[org["name"] for org in orgs if not org["url"]]

# %%
# Orgs with no description
[org["name"] for org in orgs if not org["description"]]

# %%
types = [str(org["types"]) for org in orgs]
Counter(types)

# %%
print(
    f"{len([org for org in orgs if '0' in org['types']])} organisations were included from the GlassAI dataset in the {data['org_types']['0']} category"
)
print(
    f"{len([org for org in orgs if '1' in org['types']])} organisations were included from the Crunchbase dataset in the {data['org_types']['1']} category"
)
print(
    f"{len([org for org in orgs if '2' in org['types']])} organisations were included from the GlassAI dataset in the {data['org_types']['2']} category"
)
print(
    f"{len([org for org in orgs if '3' in org['types']])} organisations were included from the GtR dataset in the {data['org_types']['3']} category"
)


# %% [markdown]
# ## Places

# %%
print(f"There are {len(data['places'])} places")
print("The place 'types' are from..")
Counter([d["type"] for d in data["places"]])

# %%
[d["name"] for d in data["places"] if d["type"] == "county"]

# %%
place_dict = {d["id"]: d["name"] for d in data["places"]}

# %%
print("The most common places:")
Counter([place_dict[org["place_id"]] for org in orgs]).most_common(10)

# %% [markdown]
# ## Coverage from each source

# %%
from ds.getters.gtr import get_gtr_ai_orgs
from ds.getters.crunchbase import get_cb_ai_investors
from ds.getters.glassai import get_glassai_companies

gtr_output = get_gtr_ai_orgs()
cb_output = get_cb_ai_investors()
glassai_output = get_glassai_companies()


# %%
def get_coverage(df):
    print(f"{len(df)} data points")
    for col_name in ["Postcode", "Longitude", "Link", "Description", "City"]:
        if col_name in df:
            has_col = df[pd.notnull(df[col_name])]
        else:
            has_col = []
        print(f"{round(len(has_col)*100/len(df),2)}% have the {col_name} field")


# %%
print("For the GtR dataset: ")
get_coverage(gtr_output)

# %%
print("For the Crunchbase dataset: ")
get_coverage(cb_output)

# %%
print("For the GlassAI dataset: ")
get_coverage(glassai_output)

# %%

# %%
