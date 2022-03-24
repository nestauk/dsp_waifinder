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
# ## Temporary outputs for GlassAI data
# In the future there will be a flow to combine the Glass, GtR and Crunchbase data and put them into the Schema output form.
#
# In the interim - this notebook will get the GlassAI data into the output form.

# %%
from ds.getters.glassai import get_glassai_companies

# %%
glass_output = get_glassai_companies()

# %%
# The column order is important
glass_output = glass_output[["Name", "Link", "Latitude", "Longitude", "is_incubator"]]

# %%
# Make sure all columns are in correct form

glass_output["Name"] = glass_output["Name"].astype(str)
glass_output["Link"] = glass_output["Link"].astype(str)
glass_output["Latitude"] = glass_output["Latitude"].astype(float)
glass_output["Longitude"] = glass_output["Longitude"].astype(float)

# %%
glass_output["is_incubator"].unique()

# %%
# Add the 4 extra headers
glass_output["Company"] = [1] * len(glass_output)
glass_output["Funder"] = [None] * len(glass_output)

# Make sure the 'Y' is still the rule here
glass_output["Incubator / accelerator"] = [
    1 if v == "Y" else None for v in glass_output["is_incubator"]
]

glass_output["University / RTO"] = [None] * len(glass_output)


glass_output.drop(columns="is_incubator", inplace=True)

# %%
# Add the 11 sector options
for i in range(1, 12):
    glass_output[f"Sector {i}"] = [None] * len(glass_output)

# %%
glass_output.to_csv("../../outputs/data/glassai.tsv", index=False, sep="\t")

# %%
