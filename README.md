# WAIfinder

## About the tool

This tool was created as a collaboration between Nesta and Innovate UK,
to explore the future of AI in UK cities.

This interactive map shows entities operating in the AI industry in the UK.

These are:
- `Company`: commercial organisations involved in the direct production of AI products, services and processes
- `Incubator/accelerator`: bodies for whom supporting new AI ventures is a core focus
- `University and Research and Technology Organisation (RTO)`: academic institutions with a strong AI research or teaching focus, Catapult centres, etc
- `Funder`: organisations which provide grants for AI ventures or R&D

Entities are represented on the map by coloured dots.
Dots of multiple colours indicate entities that fall into multiple categories.

To learn how to use the tool, please check the guides in the app.

### Features

#### Lists

By default, the app shows a map and a list of organisations:

![Organisations](./doc/WAIfinder_explorer_orgs.png 'Organisations')

You can view a list of topics:

![Topics](./doc/WAIfinder_explorer_topics.png 'Topics')

Or a list of places:

![Places](./doc/WAIfinder_explorer_places.png 'Places')

Or a list of regions:

![Regions](./doc/WAIfinder_explorer_regions.png 'Regions')

#### Searching and filtering

You can search a text and/or a location:

![Search](./doc/WAIfinder_explorer_search.png 'Search')

Or filter by topics, places, regions:

![Filtering](./doc/WAIfinder_explorer_filter_places.png 'Filtering')

#### Auto-zooming

By default ***auto-zoom*** is enabled so whatever search you do the map will follow.
You can pan/zoom where you prefer: in that case the auto-zoom disables and
you can filter by area. By re-enabling auto-zoom you'll remove location filtering
and the map will zoom to the according data.

#### Groups

When you zoom enough and in the selected area there are organisations located
at the same post code, they are shown together as wheel radii.
You can pin each individual radius.

![Coworking](./doc/WAIfinder_explorer_coworking.png 'Coworking')

#### Pinning and exploring an organisation

At any moment you can click on an organisation to pin it, so that you can:
- navigate to its website, or
- hover topics and read what they mean

![Pinning](./doc/WAIfinder_explorer_pin.png 'Pinning')

#### Responsiveness

The app is responsive, so it tries to adapt to your screen.
For example, on a mobile phone you can use the toolbar and the menu to navigate.

![Responsive](./doc/WAIfinder_explorer_responsive.png 'Responsive')

### Source code

This tool is published as open source on [Github](https://github.com/nestauk/dsp_waifinder).

### License

[MIT](./LICENSE)
