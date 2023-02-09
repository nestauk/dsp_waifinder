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

| Dataset             | Tag in final output                      | Has long/lat                   | Has city | Has postcode | Has description         | Has link                | Number of organisations |
| ------------------- | ---------------------------------------- | ------------------------------ | -------- | ------------ | ----------------------- | ----------------------- | ----------------------- |
| Gateway to Research | University / RTO                         | Yes                            | 30% do   | Yes          | 94% do (via Crunchbase) | 99% do (via Crunchbase) | 158                     |
| Crunchbase          | Funder                                   | Yes (via NSPL postcode lookup) | Yes      | Yes          | Yes                     | Yes                     | 329                     |
| GlassAI             | 'Company' and 'Incubator / accelerators' | Yes (via NSPL postcode lookup) | None     | Yes          | Yes                     | Yes                     | 2558                    |

### Gateway to Research

The [Gateway to Research](https://gtr.ukri.org/) (GtR) data comes via Nesta's SQL database. Where possible, it is also supplemented by urls and organisation descriptions from the Crunchbase dataset (fields which are not available through GtR).

The first step is searching for projects with certain topic tags which we felt were relevant to AI, e.g "Image & Vision Computing", "Robotics & Autonomy" and "Artificial Intelligence". The complete set of organisations these projects happened at are then found. We then filter these organisations with the following criteria:

1. The organisation is in a predefined list of organisations - which is a combination of universities listed by [HESA](https://www.hesa.ac.uk/data-and-analysis/students/where-study), the list of research institutes in the [UKRI eligibility list](https://www.ukri.org/apply-for-funding/before-you-apply/check-if-you-are-eligible-for-research-and-innovation-funding/eligible-research-institutes/#contents-list) and a list of research and technology organisations (RTOs) given to us from the UKRI. These lists are included in this repo in the `ds/utils` folder - `HESA_universities_050722.txt`, `List_of_RTOs_210622.txt`, `ukri_eligible_research_institutes_050722.txt`
2. The organisation received any amount of funding in the last 5 years
3. The organisation has at least 400 projects OR it has had a total of at least £50 million in funding
4. The organisation is in the UK
5. The organisation has longitude/latitude data

This leaves us with research organisations which are large, relevant, and recent.

To supplement this data with urls and organisation descriptions, we query the Crunchbase dataset. If a Crunchbase organisation name is within a GtR organisation name, then we will add some of the Crunchbase data - namely the organisation description and the url. We also manually curated a lookup table of organisations that have different names between the GtR and the Crunchbase datasets, but we know to be the same organisation - for example the correct organisational url and description for "Leeds Metropolitan University" is given by searching for "Leeds Beckett University" in the Crunchbase data (since the University changed its name).

### Crunchbase

We query the [Crunchbase](https://www.crunchbase.com/) database via Nesta's SQL server. This data is used to find the investors of AI organisations.

We first find the organisations which are tagged with topics we felt were relevant to AI (e.g. "artificial intelligence", "augmented reality", "autonomous vehicles"). We then find all investors of these organisations, where each investor may have funded multiple AI organisations, and each AI organisation may have been funded by multiple invetsors. Thus, for each investor we have:

1. The number of AI organisations they have funded
2. The number of total organisations they have funded

We get the lat/long data (which Crunchbase doesn't have) for these investors using the [NSPL postcode look up](https://geoportal.statistics.gov.uk/datasets/7606baba633d4bbca3f2510ab78acf61/about).

We filter this data to only include key AI investors with the following criteria:

1. At least 10% of the organisations they fund are AI organisations
2. They have funded at least 10 organisations
3. The investors address is in the UK
4. The "type" field for this investor is "organisation" (not "person")
5. The investor has longitude/latitude data

### GlassAI

Our data for companies and incubator / accelerators comes from [Glass AI](https://www.glass.ai/). Through a process of scraping companies websites and searching for AI related keywords in the company descriptions, Glass AI provided us with a list of organisations.

If a company is also an incubator / accelerators then this is tagged as such in a 'is_incubator' field.

We get the lat/long data (which GlassAI didn't provide us with) for these companies using the [NSPL postcode look up](https://geoportal.statistics.gov.uk/datasets/7606baba633d4bbca3f2510ab78acf61/about).

The only filtering needed for this dataset was:

1. The company has longitude/latitude data

### Merging datasets

The three filtered datasets are concatenated together, then organisation names were cleaned in order to merge together organisations that might have been in more than one of the original datasets. For example the company [CodeBase](https://www.thisiscodebase.com/) is in both the GlassAI and Crunchbase datasets.

If there is duplication we decide which rows to drop to include based of the criteria (useful if there are conflicting Links or Lat/Long values):

1. Trust Glass AI first - since several sources were considered to find Links and Lat/Long,
2. then trust GtR - since Lat/Long was given in this data,
3. lastly trust Crunchbase

For legal reasons we needed to remove information from Crunchbase in the final map. Thus, we removed the Link and Description fields from the GtR-found universities data (which were found using Crunchbase) and all the metadata from the Crunchbase-found funders.

### Adding place information

We add the 'Place' field to any data points that don't have it (which is 70% of GtR data and all of the GlassAI data) by using the postcode or lat/long data. We do this using a two methods:

1. Query the postcode to get the city using the [pgeocode python package](https://pypi.org/project/pgeocode/). We found this datasource to be quite unreliable (e.g. Dulwich came up as the city) and there can be multiple city names given for the same postcode beginning. Thus, we only used it if the city given was in a list of major cities (London, Manchester etc). We keep this step in since it is quite fast, so can be used to quickly get the low hanging fruit.
2. Query the lat/long coordinates to get the city/town using the [geopy python package](https://geopy.readthedocs.io/en/stable/#module-geopy.geocoders). This takes longer and provides us with city, town and village names.

Then we finalise this 'Place' field for an organisation using the following method:

1. Use the city name found from the original data or the pgeocode package if it's a predefined list of 4276 cities from the UK (from Nesta's "geographic_data" SQL table)
2. If this isn't in the list, use the city from the geopy package (as long as it's in the list). If this isn't possible use the other geopy outputs; see if the town name is in the predefined list of UK cities, then suburb name, village name, county name, and finally neighbourhood name. For example, one data point had the city given as 'Vale of White Horse', but this wasn't in the predefined list of cities, but the suburb field "Botley" was.
3. If no place names from any data sources are found in the predefined city list, then repeat steps 1 and 2 but don't specify the place name needs to be in the predefined list.

Some cleaning of the place name fields is also included (e.g. convert "London Borough of Camden" to "London").

For each unique place name we find we add NUTS data using the [nuts-finder python package](https://pypi.org/project/nuts-finder/) and calculate the average lat/long coordinate from all the organisations from this place.
