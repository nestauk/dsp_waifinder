# 0.2.0

- /etl: updated npm scripts
- /fe:
	- Removed feedback forms
	- Added Google Tag Manager
	- Upgraded dependencies (esp. `@svizzle` ones)

# 0.1.1

- Slightly updated the home page content

# 0.1.0

## Data

- Data has been refreshed
- Removed Crunchbase data
- Updated the data pipeline

## UI features

- Homepage: added homepage content
- Updated logos
- Guides:
   - add missing guide about the link to download the dataset
   - add guide about the form to request to remove an org
- Orgs list: invert place name / post code
- Better borders for the MultiviewSelector

## UI fixes

- Fixed error when navigating back to the explorer after filtering
- Fixed some bugs in the a11y statement page
- Fixed some a11y warnings
- Improved keyboard navigation

## UI internal

- Updated dependencies
- Some refactoring
- Removed unused code

# 0.0.3

## UI features

- Added form for orgs to request to be removed from the app
- Added button to switch dark/light theme
- Added filtering by regions
- Added filtering by places
- Added filtering by topics
- Added auto-zoom
- Uniformed how we message the user that current filters output no orgs
- Added multi-org markers for co-located orgs
- Removed scores from pills
- Sorted results list and added an alphabet picker for scrolling
- Added button to download the data corresponding to the current selection
- Guides: fixed persistent scrolling across sections

## UI internal

- Refactored theming css vars
- Added logic to process URLs org domains with missing URL schemas
- Changed the data script to list orgs with no URL
- Ported the site from Sapper to SvelteKit

# 0.0.2

- Internal staging release for external agency to do a11y testing (#222)

# 0.0.1

- Barebone app
