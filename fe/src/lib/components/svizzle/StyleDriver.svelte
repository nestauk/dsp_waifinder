<script>
	import {isClientSide} from '@svizzle/ui';

	import {
		getAllStylesBySelector,
		getStylesheet,
		setStyleRules
	} from '$lib/utils/svizzle/style';
	import {getURL} from '$lib/utils/svizzle/url';

	export let href;
	export let styleRules;

	$: hrefURL = isClientSide && href && getURL(href).toString();
	$: allStyleRules = hrefURL
		? [...getStylesheet(hrefURL).cssRules] // convert collection to array
		: [];
	$: styleRulesObj = getAllStylesBySelector(allStyleRules);
	$: setStyleRules(styleRulesObj, styleRules);
</script>
