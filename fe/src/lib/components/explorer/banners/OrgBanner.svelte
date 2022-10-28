<script>
	import {_screen} from '@svizzle/ui';

	import OrgDetails from '$lib/components/explorer/orgs/OrgDetails.svelte';
	import Banner from '$lib/components/svizzle/Banner.svelte';
	import LayoutHMF from '$lib/components/svizzle/LayoutHMF.svelte';

	import {bannersDefaultFooterText} from '$lib/config';
	import {_hero, _isCursorOnMap, clearHero} from '$lib/stores/interaction';
	import {_bannersTheme} from '$lib/stores/theme';

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
