# UI

## Schema

The data is provided in a [TSV](https://en.wikipedia.org/wiki/Tab-separated_values) file with the headers below.

The first 4 headers are:

- `Name` (`string`): the name of the entity;
- `Link` (`URL string`): the URL of the website of the entity;
- `Latitude` (`float`): latitude of the entity;
- `Longitude` (`float`): longitude of the entity;

The next 4 headers are booleans encoded as either `0` (false) or `1` (true), defining if an entity is of one of the following types:

- `Company`: the entity is a commercial organisation involved in the direct production of AI products, services and processes;
- `Funder`: the entity is an organisation which provides grants for AI ventures or R&D;
- `Incubator/accelerator`: the entity is a body for whom supporting new AI ventures is a core focus;
- `University/RTO` (University and Research and Technology Organisation - RTO): the entity can be an academic institution with a strong AI research or teaching focus, a Catapult centre, etc.

The next 11 headers are again booleans with the same meaning as above, defining if an entity is in one of the following (for now generic) sectors:

- `Sector 1`
- `Sector 2`
- ...
- `Sector 11`

The app suppports entities being of multiple types and in multiple sectors.
