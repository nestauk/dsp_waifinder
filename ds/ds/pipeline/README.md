# Steps in data pipeline

To run steps 1 and 2 you will need to have the Nesta SQL database credentials stored on your computer, and for this location to be saved in an environmental variable:

1. Download the `mysqldb_team.config` file from S3
2. Run `echo export SQL_DB_CREDS="$HOME/path/to/mysqldb_team.config" > .env` from `dap_uk_ai_map/ds`
3. Activate with `direnv reload`

## 1. Gateway to Research (GtR) dataset

Run `python ds/pipeline/gtr/flow.py --datastore=s3 --production run` to get the Gateway to Research AI dataset.
