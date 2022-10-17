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
#
# ### Data size
#
# - There are 3362 organisations in the dataset
#
# ### Which organisations come from the different sources?
#
# - 2826 organisations were included from the GlassAI dataset in the Company category
# - 329 organisations were included from the Crunchbase dataset in the Funder category
# - 68 organisations were included from the GlassAI dataset in the Incubator / accelerator category
# - 152 organisations were included from the GtR dataset in the University / RTO category
#
# Number of organisations from the different sources:
#
# |Company|Funder|Incubator / accelerator|University / RTO|n|
# |--|--|--|--|--|
# |x||||2822|
# |x||x||2|
# |x|x|x||0|
# |x|x|||2|
# |||x||58|
# ||||x|151|
# ||x||x|1|
# ||x|||318|
#
#
# ### What is the coverage for the different fields?
#
# - 99.9% of the organisations have urls
# - 99.7% of the organisations have descriptions
#
# - Orgs with no url: ['Food & Environment Research Agency', 'STFC']
#
# - Orgs with no description: ['MRC London Institute of Medical Sciences',
#  'High Value Manufacturing Catapult',
#  'Offshore Renewable Energy Catapult',
#  'Food & Environment Research Agency',
#  'Culham Centre for Fusion Energy',
#  'Aircraft Research Association Limited',
#  'The Pirbright Institute',
#  'UK Astronomy Technology Centre',
#  'STFC']
#
#
#
# |Dataset |GtR | Crunchbase | GlassAI |
# |---|---|---|---|
# |Number of data points|158|329|2921|
# |% with the Postcode field|100%|100%|100%|
# |% with the Longitude/Latitude fields|100%|100%|100%|
# |% with the Link field|98.73%|100%|100%|
# |% with the Description field|94.3%|100%|100%|
# |% with the City field|29.11%|100%|0%|
#
#
# ### Places
#
# - There are 397 places
# - The place 'types' are from.. Counter({'village': 58, 'city': 122, 'town': 161, 'suburb': 50, 'county': 6})
# - The most common places:
#  [('London', 1964),
#  ('Cambridgeshire', 138),
#  ('Edinburgh', 72),
#  ('Manchester', 64),
#  ('Oxford', 50),
#  ('Bristol', 45),
#  ('Glasgow', 37),
#  ('Leeds', 34),
#  ('Birmingham', 29),
#  ('Guildford', 25)]
#
#

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
print("\nFor the GtR dataset: ")
get_coverage(gtr_output)

print("\nFor the Crunchbase dataset: ")
get_coverage(cb_output)

print("\nFor the GlassAI dataset: ")
get_coverage(glassai_output)

# %%
