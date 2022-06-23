<script>
	import {_screen} from '@svizzle/ui/src/sensors/screen/ScreenSensor.svelte';
	import LinkButton from '@svizzle/ui/src/LinkButton.svelte';
	import Methodology from './_content/Methodology.svx';
	import ResponsiveFlex from '@svizzle/ui/src/ResponsiveFlex.svelte';

	import {toolName} from 'app/config';
	import theme from 'app/theme';
</script>

<svelte:head>
	<title>Methodology - {toolName}</title>
	<meta
		content='{toolName}: methodology used to produce these indicators'
		name='description'
	>
</svelte:head>

<main class='methodology {$_screen?.classes}'>
	<div>
		<Methodology/>

		<ResponsiveFlex>
			<LinkButton
				href='/guides'
				text='Read the guides'
				theme={{backgroundColor: theme.colorLink}}
			/>
		</ResponsiveFlex>
	</div>
</main>

<style>
	.methodology {
		background-color: var(--color-background);
		display: flex;
		font-weight: 200;
		height: 100%;
		justify-content: space-around;
		width: 100%;
	}

	div {
		background-color: white;
		box-shadow: var(--box-shadow-y);
		max-width: 900px;
		overflow-y: auto;
		padding: 2rem;
	}
</style>
