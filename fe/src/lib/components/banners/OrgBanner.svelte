<script>
	import {_screen} from '@svizzle/ui/src/sensors/screen/ScreenSensor.svelte';

	import OrgDetails from '$lib/components/orgs/OrgDetails.svelte';
	import Banner from '$lib/components/svizzle/Banner.svelte';
	import LayoutHMF from '$lib/components/svizzle/LayoutHMF.svelte';

	import {bannersDefaultFooterText} from '$lib/config';
	import {_hero, _isCursorOnMap, clearHero} from '$lib/stores/interaction';

	$: footerText = $_hero.isPinned
		? $_isCursorOnMap ? 'Click to unpin' : bannersDefaultFooterText
		: 'Click to pin';
</script>

<Banner
	{_screen}
	isNarrow={false}
	on:close={clearHero}
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
