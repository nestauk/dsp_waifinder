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
# ## Temporary outputs for GtR data
# In the future there will be a flow to combine the Glass, GtR and Crunchbase data and put them into the Schema output form.
#
# In the interim - this notebook will get the GtR data into the output form.

# %%
from ds.getters.gtr import get_gtr_ai_orgs

# %%
gtr_output = get_gtr_ai_orgs()

# %%
# Make sure all columns are in correct form

gtr_output.fillna("Not given", inplace=True)  # Not all Links are given
gtr_output["Name"] = gtr_output["Name"].astype(str)
gtr_output["Link"] = gtr_output["Link"].astype(str)
gtr_output["Latitude"] = gtr_output["Latitude"].astype(float)
gtr_output["Longitude"] = gtr_output["Longitude"].astype(float)

# %%
# Add the 4 extra headers
gtr_output["Company"] = [0] * len(gtr_output)
gtr_output["Funder"] = [0] * len(gtr_output)
gtr_output["Incubator/accelerator"] = [0] * len(gtr_output)
gtr_output["University/RTO"] = [1] * len(gtr_output)


# %%
gtr_output.to_csv("../../outputs/data/gtr.csv", index=False)

# %%
