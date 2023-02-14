## AI Map Data

This brief README aims to document how the annotations, aggregations and
populated data fields were computed.

### fillMissingData script

The [fillMissingData.mjs script](fillMissingData.mjs) is
used to populate the missing `url` and `description` fields. Making this script
more generic so it could work on any dataset is future work.

To run this script, you need a valid Bing Search resource and associated API key.

To set up a Bing Search resource you need an Azure account and a subscription
(the subscription can be a free tier one and you can use this script using the
free tier Bing Search service too). Once you have a subscription, navigate
to the subscription resource page and click on "Resource providers". There,
you'll see a list of services. Make sure "Microsoft.Bing" is registered, as if
you don't, no pricing tiers appear when creating the Bing Search service.

Once the service has been registered, you can create a Bing Search service and
obtain the neccessary API keys. Export this key to an environment variable
named AZURE_SUBSCRIPTION_KEY and you should be able to run the script directly.

Once you have configured everything, run using

`npm run fillMissingData`

### Ingestion

Once the script has populated the missing data, we first ingest it to an ES
index using the [ingestion script](https://github.com/nestauk/dap_dv_backends_utils/blob/v0.0.14/bin/jsonToEsIndex.js)
script with the following paramaters (please refer to the commander
documentation for more details about any parameters in the following node
script):

`npx jsonToEsIndex -d <domain> -i ai_map -p data/outputs/ai_map_orgs_places_populated.json --list-key orgs --batch-size 100`

Or run `npm run ingestToEs` if you have access to Nesta's AWS.

### Annotation

We then run the annotation service on the newly created index using the `/es`
endpoint. Details can be found on the [Github README](https://github.com/nestauk/dap_dv_backends/blob/b35fbf799222d6327dd221d96604cad6284bbb61/src/services/annotation/README.md) and also on the [API](https://annotation.dap-tools.uk/static/index.html) itself.

You can also use `npm run annotateData`, which will only work if you
have the required Nesta credentials.

### Entity Data Quality

To produce individual DBpedia entity/resource quality results, we run the
[entitiesDataQuality script:](https://github.com/nestauk/dap_dv_backends_utils/blob/v0.0.5/bin/entitiesDataQuality.js)

`npx entitiesDataQuality --domain <domain> --index ai_map --path data/aggs`

Or run `npm run getEntityDataQuality` if you have access to the Nesta ES domain.

### Annotation Data Quality

To produce data quality measures on the annotation process, we run the
[annotationsDataQuality script](https://github.com/nestauk/dap_dv_backends_utils/blob/v0.0.5/bin/annotationsDataQuality/annotationsDataQuality.js):

`npx annotationsDataQuality --domain <domain> --index ai_map --out data/quality/annotations

Or run `npm run getAnnotationsDataQuality` if you have access to the Nesta ES
domain.

### Prepare the Frontend Data

Once the data has been annotated on the ES index, you need to run

`npm run prepareFrontEndData`

which will copy the required data to a static folder which the FE uses.
