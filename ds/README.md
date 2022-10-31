# UK AI Map Data

This folder contains flows for processing and joining the datasets needed for the AI map.

## 📂 Contents

Key parts of this repo folder are as follows:

1. The final dataset used in the AI map can be found [here](ds/outputs/data/ai_map_orgs_places.json)
1. [`pipeline` flows for each step of the data pipeline](https://github.com/nestauk/dap_uk_ai_map/tree/dev/ds/ds/pipeline)
   - Much more detail about running these can be found in the pipeline [README](ds/ds/pipeline/README.md)
1. [`getter` functions for use in the data pipeline](https://github.com/nestauk/dap_uk_ai_map/tree/dev/ds/ds/getters)
1. [`utils` functions](https://github.com/nestauk/dap_uk_ai_map/tree/dev/ds/ds/utils) for:
   - Connecting to the SQL database
   - Downloading the National Statistics Postcode Lookup table
1. A broad level analysis of the final dataset can be found in [this notebook](ds/ds/analysis/Data_Analysis.py).

## 💾 Datasets

Note: none of these datasets need to be downloaded to run any of the scripts. The scripts do the downloading for you (as long as you have S3 and SQL credentials set up properly).

The three main datasets used are:

1. The [Gateway to Research](https://gtr.ukri.org/) (GtR) data is accessed via Nesta's SQL database.
2. The [Crunchbase](https://www.crunchbase.com/) data is accessed via Nesta's SQL server.
3. The [Glass AI](https://www.glass.ai/) data is stored in S3 (`s3://nesta-glass-ai/dap_uk_ai_map/inputs/glass_ai/nesta_ai.orgs.20220318.csv`).

More detail about theses can be found in the pipeline [README](ds/ds/pipeline/README.md).

Three sets of organisation lists are used to filter the GtR data with. These are stored in the repo under `ds/ds/utils/HESA_universities_050722.txt`, `ds/ds/utils/List_of_RTOs_210622.txt` and `ds/ds/utils/ukri_eligible_research_institutes_050722.txt`.

Furthermore, we use the [National Statistics Postcode Lookup (NSPL)](https://geoportal.statistics.gov.uk/datasets/7606baba633d4bbca3f2510ab78acf61/about) to retrieve latitude and longitude coordinates from postcodes.

## Setup

- Meet the data science cookiecutter [requirements](http://nestauk.github.io/ds-cookiecutter/quickstart), in brief:
  - Install: `git-crypt`, `direnv`, and `conda`
  - Have a Nesta AWS account configured with `awscli`

Run:

```bash
cd ds
direnv allow .
eval "$(direnv hook zsh)"
make install
```

to configure the development environment:

- Setup the conda environment
- Configure pre-commit

## Contributor guidelines

[Technical and working style guidelines](https://github.com/nestauk/ds-cookiecutter/blob/master/GUIDELINES.md)

---

<small><p>Project based on <a target="_blank" href="https://github.com/nestauk/ds-cookiecutter">Nesta's data science project template</a>
(<a href="http://nestauk.github.io/ds-cookiecutter">Read the docs here</a>).
</small>
