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

# %%
import pandas as pd

import json
from collections import Counter

# %%
with open("../../outputs/data/ai_map_orgs_places_refreshed.json", "r") as f:
    data = json.load(f)

# %%
data.keys()

# %% [markdown]
# ## Organisations

# %%
orgs = data["orgs"]
print(f"There are {len(orgs)} organisations in the dataset")
org_urls = [org["url"] for org in orgs]
print(
    f"{len([i for i in org_urls if i])*100/len(orgs)}% of the organisations have urls"
)
org_desc = [org["description"] for org in orgs]
print(
    f"{len([i for i in org_desc if i])*100/len(orgs)}% of the organisations have descriptions"
)


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
place_dict = {d["id"]: d["name"] for d in data["places"]}

# %%
print("The most common places:")
Counter(
    [place_dict[org.get("place_id")] for org in orgs if org.get("place_id")]
).most_common(10)

# %%
