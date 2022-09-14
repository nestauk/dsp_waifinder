import {getFamilies} from '@svizzle/ui';

/* tool */

export const toolName = 'WAIFinder';
export const toolLongName = 'UK AI Landscape map';
export const contactEmail = 'dataanalytics@nesta.org.uk';
export const changelogUrl = 'https://github.com/nestauk/dap_uk_ai_map/blob/staging/CHANGELOG.md';
export const jsonUrl = '/data/ai_map_annotated_orgs.json';

/* banners */

export const bannersDefaultFooterText = 'Click on background to dismiss';

/* orgs selection */

export const noOrgsMessage = 'No organisations selected with current filtering criteria.';

/* feedback forms */

// survey

// source: https://docs.google.com/forms/d/1XuVTl_P6O5XEfRmPs_h7GHd3Ruc_YySxvZ5nDPUa-iM/edit
export const surveyFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSflqKXmPR2eQ-G20L6QV9CAanQ2DLIXIcD_cePr4XfwLefimA/viewform?embedded=true';

// add your org

// source: https://docs.google.com/forms/d/1RfGhH3hEHYsq_hChpZYtIMP9urZVNu53UeIEbL2KaZg/edit
export const addOrgFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLScVgKNvr4-LW1LD9jfXrPaDRO09XMC2PMAVrn_TNk-p1K3Utw/viewform?embedded=true';

/* flags */

export const flags = {
	showPOIs: false
};

/* mapbox */

export const MAPBOXGL_STYLEURL = 'mapbox://styles/nesta-uk/cjja7cb0s0bcw2rmvflhof4io';

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

export const a11yFontFamilies = getFamilies(fontsInfo);
