# Steps in data pipeline

To run steps 1 and 2 you will need to have the Nesta SQL database credentials stored on your computer, and for this location to be saved in an environmental variable:

1. Download the `mysqldb_team.config` file from S3 - `s3://nesta-production-config/mysqldb_team.config`
2. Add the location to where you saved it to your environmental variables: `$ export SQL_DB_CREDS="$HOME/path/to/mysqldb_team.config"`, e.g. `export SQL_DB_CREDS="$HOME/Code/config_keys/mysqldb_team.config`).


## 1. Gateway to Research (GtR) dataset

Run `python ds/ds/pipeline/gtr/flow.py --production run` to get the Gateway to Research AI dataset.