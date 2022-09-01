<script>
	import {_screen} from '@svizzle/ui/src/sensors/screen/ScreenSensor.svelte';

	import OrgDetails from 'app/components/orgs/OrgDetails.svelte';
	import Banner from 'app/components/svizzle/Banner.svelte';
	import LayoutHMF from 'app/components/svizzle/LayoutHMF.svelte';

	import {bannersDefaultFooterText} from 'app/config';
	import {_hero, _isCursorOnMap, clearHero} from 'app/stores/interaction';

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
