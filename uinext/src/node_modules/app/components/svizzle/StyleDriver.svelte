<script>
	import {isClientSide} from '@svizzle/ui/src/utils/env';

	import {
		getAllStylesBySelector,
		getStylesheet,
		setStyleRules
	} from 'app/utils/svizzle/style';
	import {getURL} from 'app/utils/svizzle/url';

	export let href;
	export let styleRules;

	$: hrefURL = isClientSide && href && getURL(href).toString();
	$: allStyleRules = hrefURL
		? [...getStylesheet(hrefURL).cssRules] // convert collection to array
		: [];
	$: styleRulesObj = getAllStylesBySelector(allStyleRules);
	$: setStyleRules(styleRulesObj, styleRules);
</script>
