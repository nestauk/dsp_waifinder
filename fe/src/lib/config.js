import {isClientSide} from '@svizzle/ui';
import {objectToKeyValueArray} from '@svizzle/utils';

/* tool */

export const toolName = 'UK WAIfinder';
export const toolLongName = 'UK AI Landscape map';
export const contactEmail = 'waifinder@iuk.ktn-uk.org';
export const changelogUrl = 'https://github.com/nestauk/dap_uk_ai_map/blob/staging/CHANGELOG.md';
export const jsonUrl = '/data/ai_map_annotated_orgs.json';

/* map bounding box (UK) */

export const DEFAULT_BBOX_WS_EN = [[-8.61752, 49.90774], [1.76229, 60.84585]];

/* banners */

export const bannersDefaultFooterText = 'Click on background to dismiss';

/* orgs selection */

export const noOrgsMessage = 'No results with current filters';

/* regions level */

export const nutsLevel = 3;

/* flags */

export const flags = {
	showPOIs: false
};

/* analytics */

export const googleTagManagerId = 'G-3YWWQW4HD4'; // Managed by KTN, not Nesta

/* social */

const origin = isClientSide ? window.location.origin: '';
const description =
	'This interactive map shows entities operating in the AI industry in the UK.';
export const openGraphTags = objectToKeyValueArray({
	description,
	image: '/images/WAIfinder_explorer_orgs.png',
	'image:alt': description,
	'image:type': 'image/png',
	title: 'UK WAIfinder',
	type: 'website',
	url: origin,
});

/* mapbox */

export const MAPBOXGL_STYLEURLs = {
	themeLight: 'mapbox://styles/nesta-uk/cl8olrzo200ci16pim0h4c1pn',
	themeDark: 'mapbox://styles/nesta-uk/cl8ilzuy3001214qyg06jwsoy'
};

/* logos */

export const LOGOS = {
	themeLight: {
		nesta: '/logos/Nesta_light.svg',
		ukri: '/logos/UKRI_logo_light.svg'
	},
	themeDark: {
		nesta: '/logos/Nesta_dark.svg',
		ukri: '/logos/UKRI_logo_dark.svg'
	}
}
// TODO call an API to retrieve the accessToken
// to limit the use of this access token to domains we control
export const MAPBOXGL_ACCESSTOKEN = 'pk.eyJ1IjoibmVzdGEtdWsiLCJhIjoiY2ozbjUzY2drMDAwNzJxbnl6a21uM253cSJ9.3RTMySEVk0LC4gQvGoG-Zw';

/* testing */

export const urlBases = {
	development: 'http://localhost:5173',
	preview: 'https://uk-ai-map-dev.netlify.app',
	production: 'https://uk-ai-map.temp-domain', // TODO netlify
};

export const lighthouseUrls = {
	Home: '/',
	Guides: '/guides/app',
	Explorer: '/explorer'
};

/*
There's a bug in Lighthouse 7.4.0 which causes the audit on the following
pages to fail when running in mobile display emulation. Commenting them
for now as tests are being run in desktop mode only pending the fix.
Ref.: https://github.com/GoogleChrome/lighthouse/issues/12039
*/
export const failingA11yAudit = [
//	'Trends',
//	'Geo'
];

export const fontsInfo = [
	{
		family: 'Avenir Next Variable',
		faces: [
			{
				src: 'url(/font/AvenirNext/Variable.ttf) format("truetype")'
			}
		]
	},
	{
		family: 'Archivo',
		faces: [
			{
				src: 'url(/font/Archivo/VariableFont_wdth,wght.ttf) format("truetype")',
				descriptors: {
					style: 'normal'
				}
			},
			{
				src: 'url(/font/Archivo/Italic-VariableFont_wdth,wght.ttf) format("truetype")',
				descriptors: {
					style: 'italic'
				}
			},
		]
	},
	{
		family: 'Noboto Flex',
		faces: [
			{
				src: 'url(/font/NobotoFlex/Variable.woff2)',
				descriptors: {
					weight: 140
				}
			}
		]
	},
	{
		family: 'Courier New'
	},
	{
		family: 'Open Dyslexia',
		faces: [
			{
				src: 'url(/font/OpenDyslexic/Regular.otf) format("opentype")',
				descriptors: {
					weight: 400,
					style: 'normal'
				}
			},
			{
				src: 'url(/font/OpenDyslexic/Italic.otf) format("opentype")',
				descriptors: {
					weight: 400,
					style: 'italic'
				}
			},
			{
				src: 'url(/font/OpenDyslexic/Bold.otf) format("opentype")',
				descriptors: {
					weight: 700,
					style: 'normal'
				}
			},
			{
				src: 'url(/font/OpenDyslexic/BoldItalic.otf) format("opentype")',
				descriptors: {
					weight: 700,
					style: 'italic'
				}
			}
		]
	}
];
