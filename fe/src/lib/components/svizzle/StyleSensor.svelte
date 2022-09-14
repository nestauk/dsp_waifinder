<script>
	import {isClientSide} from '@svizzle/ui';

	import {getStylesheet, makeGetStyleRulesObj} from '$lib/utils/svizzle/style';
	import {getURL} from '$lib/utils/svizzle/url';

	export let href;
	export let selectorRegex;
	export let styleRules;

	$: hrefURL = isClientSide && href && getURL(href).toString();
	$: allStyleRules = hrefURL
		? [...getStylesheet(hrefURL).cssRules] // convert collection to array
		: [];
	$: getStyleRulesObj = makeGetStyleRulesObj(selectorRegex);
	$: styleRules = getStyleRulesObj(allStyleRules);
</script>
