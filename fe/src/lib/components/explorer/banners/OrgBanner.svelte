<script>
	import {_screen, Banner, LayoutHMF} from '@svizzle/ui';

	import OrgDetails from '$lib/components/explorer/orgs/OrgDetails.svelte';
	import {bannersDefaultFooterText} from '$lib/config.js';
	import {_hero, _isCursorOnMap, clearHero} from '$lib/stores/interaction.js';
	import {_bannersTheme} from '$lib/stores/theme.js';

	$: footerText = $_hero.isPinned
		? $_isCursorOnMap ? 'Click to unpin' : bannersDefaultFooterText
		: 'Click to pin';
</script>

<Banner
	{_screen}
	isNarrow={false}
	on:close={clearHero}
	theme={$_bannersTheme}
>
	<LayoutHMF>
		<OrgDetails
			item={$_hero.org}
			shouldFocusOrg={false}
			showAsFocused={true}
			slot='main'
		/>
		<p slot='footer'>{footerText}</p>
	</LayoutHMF>
</Banner>
