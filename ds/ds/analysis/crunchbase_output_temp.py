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

# %%
cb_output = get_cb_ai_investors()

# %%
# Make sure all columns are in correct form

cb_output.fillna("Not given", inplace=True)  # Not all Links are given
cb_output["Name"] = cb_output["Name"].astype(str)
cb_output["Link"] = cb_output["Link"].astype(str)
cb_output["Latitude"] = cb_output["Latitude"].astype(float)
cb_output["Longitude"] = cb_output["Longitude"].astype(float)

# %%
# Add the 4 extra headers
cb_output["Company"] = [0] * len(cb_output)
cb_output["Funder"] = [1] * len(cb_output)
cb_output["Incubator/accelerator"] = [0] * len(cb_output)
cb_output["University/RTO"] = [0] * len(cb_output)


# %%
# Add the 11 sector options
for i in range(1, 12):
    cb_output[f"Sector {i}"] = [0] * len(cb_output)

# %%
cb_output.to_csv("../../outputs/data/crunchbase.csv", index=False)

# %%
