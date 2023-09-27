# Steps in data pipeline

To run steps 1 and 2 you will need to have the Nesta SQL database credentials stored on your computer, and for this location to be saved in an environmental variable:

1. Download the `mysqldb_team.config` file from S3
2. From `dap_uk_ai_map/ds` run `export SQL_DB_CREDS="$HOME/path/to/mysqldb_team.config" > .env`
3. and `export METAFLOW_PROFILE=ds-cookiecutter`
4. Activate with `direnv reload`

## 1. Gateway to Research (GtR) dataset

Run `python ds/pipeline/gtr/flow.py --datastore=s3 --production run` to get the Gateway to Research AI dataset.

## 2. Crunchbase dataset

Run `python ds/pipeline/crunchbase/flow.py --datastore=s3 --production run` to get the Crunchbase AI dataset.

## 3. GlassAI dataset

Run `python ds/pipeline/glassai/flow.py --datastore=s3 --production run` to get the GlassAI dataset.

## 4. Merge datasets

Run `python ds/pipeline/ai_map/flow.py --datastore=s3 --production run` to merge the GtR, Crunchbase and GlassAI datasets.

## Methods

The organisations included in the {toolName} tool come from 2 main sources; organisations researching AI come from [Gateway to Research](https://gtr.ukri.org/), and AI companies and incubators come from a proprietary dataset from [Glass AI](https://www.glass.ai/). We also find organisations that fund AI companies using [Crunchbase](https://www.crunchbase.com/). Due to legal reasons we don't expose the information about these funder organisations directly using the Crunchbase dataset, but rather we find the information using the [Bing search
API](https://docs.microsoft.com/en-us/bing/search-apis/bing-web-search/overview).

### Gateway to Research

The [Gateway to Research](https://gtr.ukri.org/) (GtR) data comes via Nesta's SQL database.

The first step is searching for projects with certain topic tags that we felt were relevant to AI, e.g. "Image & Vision Computing", "Robotics & Autonomy" and "Artificial Intelligence". The organisations these projects took place at were collated together and filtered with the following criteria:

1. The organisation is in a predefined list of organisations - which is a combination of universities listed by [HESA](https://www.hesa.ac.uk/data-and-analysis/students/where-study), the list of research institutes in the [UKRI eligibility list](https://www.ukri.org/apply-for-funding/before-you-apply/check-if-you-are-eligible-for-research-and-innovation-funding/eligible-research-institutes/#contents-list) and a list of research and technology organisations (RTOs) given to us by UKRI.
2. The organisation received any amount of funding in the last 5 years
3. The organisation has at least 400 projects OR it has had a total of at least £50 million in funding
4. The organisation is in the UK
5. The organisation has longitude/latitude data

This leaves us with research organisations that are large, relevant, and recent.

To supplement this data with URLs and organisation descriptions, we use the [Bing search
API](https://docs.microsoft.com/en-us/bing/search-apis/bing-web-search/overview).

### Crunchbase

We query the [Crunchbase](https://www.crunchbase.com/) database via Nesta's SQL server. This data is used to find the investors of AI organisations.

We first find the organisations that are tagged with topics we felt were relevant to AI (e.g. "artificial intelligence", "augmented reality", "autonomous vehicles"). We then find all investors of these organisations, where each investor may have funded multiple AI organisations, and each AI organisation may have been funded by multiple investors. Thus, for each investor we have:

1. The number of AI organisations they have funded
2. The number of total organisations they have funded

We get the longitude/latitude data (which Crunchbase doesn't have) for these investors using the [NSPL postcode look up](https://geoportal.statistics.gov.uk/datasets/7606baba633d4bbca3f2510ab78acf61/about).

We filter this data to only include key AI investors with the following criteria:

1. At least 10% of the organisations they fund are AI organisations
2. They have funded at least 10 organisations
3. The investor's address is in the UK
4. The "type" field for this investor is "organisation" (not "person")
5. The investor has longitude/latitude data

We then create our funders dataset by using the remaining funder organisation names to query the [Bing search
API](https://docs.microsoft.com/en-us/bing/search-apis/bing-web-search/overview) to find their URLs and company descriptions.

### GlassAI

Our data for companies and incubators/accelerators comes from [Glass AI](https://www.glass.ai/). Through a process of scraping companies' websites and searching for AI-related keywords in the company descriptions, Glass AI provided us with a list of organisations.

If a company is also an incubator/accelerator then this is tagged as such in a 'is_incubator' field.

We get the longitude/latitude data (which GlassAI didn't provide us with) for these companies using the [NSPL postcode look up](https://geoportal.statistics.gov.uk/datasets/7606baba633d4bbca3f2510ab78acf61/about).

The only filtering needed for this dataset was:

1. The company has longitude/latitude data

### Merging datasets

The three filtered datasets are concatenated together, then organisation names were cleaned in order to merge together organisations that might have been in more than one of the original datasets. For example the company [CodeBase](https://www.thisiscodebase.com/) is in both the Company and the Funder categories.

If there is duplication we decide which rows to drop to include based on the criteria (useful if there are conflicting Links or latitude/longitude values):

1. Trust Glass AI first - since several sources were considered to find Links and Lat/Long,
2. then trust GtR - since Lat/Long was given in this data,
3. lastly trust Crunchbase

Merged dataset outputs:

|                                  | Number of organisations |
| -------------------------------- | ----------------------- |
| Company category                 | 2785                    |
| Funder category                  | 329                     |
| Incubator / accelerator category | 74                      |
| University / RTO category        | 152                     |
| **Total deduplicated**           | **3319**                |

### Adding place information

We add the 'Place' field to any data points that don't have it by using the postcode or longitude/latitude data. We do this using two methods:

1. Query the postcode to get the city using the [pgeocode python package](https://pypi.org/project/pgeocode/). We found this data source to be quite unreliable (e.g. Dulwich came up as the city) and there can be multiple city names given for the same postcode beginning. Thus, we only used it if the city given was in a list of major cities (London, Manchester etc). We keep this step in since it is quite fast, so can be used to quickly get the low hanging fruit.
2. Query the longitude/latitude coordinates to get the city/town using the [geopy python package](https://geopy.readthedocs.io/en/stable/#module-geopy.geocoders). This takes longer and provides us with city, town and village names.

Then we finalise this 'Place' field for an organisation using the following method:

1. Use the city name found from the original data or the pgeocode package if it's a predefined list of 4276 cities from the UK (from Nesta's "geographic_data" SQL table)
2. If this isn't in the list, use the city from the geopy package (as long as it's in the list). If this isn't possible use the other geopy outputs; see if the town name is in the predefined list of UK cities, then suburb name, village name, county name, and finally neighbourhood name. For example, one data point had the city given as 'Vale of White Horse', but this wasn't in the predefined list of cities, but the suburb field "Botley" was.
3. If no place names from any data sources are found in the predefined city list, then repeat steps 1 and 2 but don't specify the place name needs to be in the predefined list.

Some cleaning of the place name fields is also included (e.g. convert "London Borough of Camden" to "London").

For each unique place name we find we add NUTS data using the [nuts-finder python package](https://pypi.org/project/nuts-finder/) and calculate the average lat/long coordinate from all the organisations from this place.

The 3319 unique organisations in the map are located in 422 unique places, with the most common location being London.

### Additions after September 2023

Due to changes in Nesta's SQL database the above flows will no longer work. Hence, for the GlassAI data refresh we received on 06/09/2023 we opted to create a one-off script that would add (and remove) the new organisations to the existing dataset.

This can be run with:

```python
python ds.pipeline.ai_map.data_refresh.py
```

It will take the existing formatted map data stored in `outputs/data/ai_map_orgs_places.json` and merge it with the new GlassAI dataset stored in S3 `s3://nesta-glass-ai/dap_uk_ai_map/inputs/glass_ai/nesta_ai.orgs.20230905.csv`. The output will be stored in `outputs/data/ai_map_orgs_places_refreshed.json`.

This dataset has the following attributes:

- There are 3319 organisations
- 2785 organisations are in the Company category
- 329 organisations are in the Funder category
- 74 organisations are in the Incubator / accelerator category
- 152 organisations are in the University / RTO category
- There are 422 places
- 1698 organisations are in London, 78 are from Cambridge and 64 are from Edinburgh
- 318 of the organisations do not have place information

After this, another pipeline was run to add postcodes for the funders (since we only had the funder name). Details of this can be found [here](/etl/bin/fillMissingLocations.js). This generated the output file "../etl/data/outputs/ai_map_orgs_places_locations_populated.json". Finally, using this enhanced dataset we added the place information (e.g. the city name) for these funders and updated the output dataset.

This can be done by running:

```python
python ds.pipeline.ai_map.data_refresh_part_2.py
```

Which generates `outputs/data/ai_map_orgs_places_refreshed_part_2.json` with the following attributes:

- There are 3280 organisations
- 2785 organisations are in the Company category
- 290 organisations are in the Funder category
- 74 organisations are in the Incubator / accelerator category
- 152 organisations are in the University / RTO category
- There are 419 places
- 1886 organisations are in London, 84 are from Cambridge and 75 are from Edinburgh
