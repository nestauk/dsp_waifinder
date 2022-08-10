<script>
	import {setupResizeObserver} from '@svizzle/ui/src/actions/resizeObserver';
	import A11yMenu
		from '@svizzle/ui/src/a11y/menu/A11yMenu.svelte';
	import A11yMenuDriver
		from '@svizzle/ui/src/a11y/menu/A11yMenuDriver.svelte';
	import {
		_a11ySettings,
		_isA11yDirty
	} from '@svizzle/ui/src/a11y/menu/settings';
	import FontsLoader from '@svizzle/ui/src/drivers/fonts/FontsLoader.svelte';
	import LoadingView from '@svizzle/ui/src/LoadingView.svelte';
	import NoScript from '@svizzle/ui/src/NoScript.svelte';
	import ScreenSensor, {_screen}
		from '@svizzle/ui/src/sensors/screen/ScreenSensor.svelte';
	import {beforeUpdate, onMount, tick} from 'svelte';

	import Footer from 'app/components/layout/medium/Footer.svelte';
	import Nav from 'app/components/layout/Nav.svelte';
	import ThemeEditor from 'app/components/layout/medium/ThemeEditor.svelte';
	import MultiBanner from 'app/components/svizzle/MultiBanner.svelte';
	import StyleSensor from 'app/components/svizzle/StyleSensor.svelte';
	import {
		a11yFontFamilies,
		bannersDefaultFooterText,
		fontsInfo,
		isDev
	} from 'app/config';
	import {_isSmallScreen} from 'app/stores/layout';
	import {
		_showThemeEditor,
		_themeName,
		_themeVars
	} from 'app/stores/theme'
	import theme from 'app/theme';

	import Privacy from './_content/info/Privacy.svx';

	const bannerComponents = [
		Privacy
	];

	export let segment;

	// actions
	const {
		_writable: _headerSize,
		resizeObserver: headerSizeObserver
	} = setupResizeObserver();
	const {
		_writable: _contentSize,
		resizeObserver: contentSizeObserver
	} = setupResizeObserver();

	let a11yHeight;
	let fontLoadStatus;
	let isLayoutUndefined = true;
	let scriptingActive = false;
	let showA11yMenu;

	onMount(() => {
		scriptingActive = true;
		window.nesta_isLayoutUndefined = () => isLayoutUndefined;
	});

	beforeUpdate(async () => {
		if (isLayoutUndefined) {
			await tick();
		}
	});

	$: menuHeight = $_headerSize.blockSize + (showA11yMenu ? a11yHeight : 0);
	$: $_screen?.classes && (isLayoutUndefined = false);
</script>

<StyleSensor
	href='/css/global.css'
	selectorRegex={/\.theme.*/u}
	bind:styleRules={$_themeVars}
/>

<A11yMenuDriver
	defaults={{
		typeface: {
			defaultValue: a11yFontFamilies[0],
			values: a11yFontFamilies,
		}
	}}
/>

<FontsLoader
	bind:status={fontLoadStatus}
	firstFamilyToLoad={$_a11ySettings.typeface.value}
	{fontsInfo}
/>
<NoScript />

{#if scriptingActive && fontLoadStatus.isFirstLoaded}
	<ScreenSensor />
	<MultiBanner
		{_screen}
		components={bannerComponents}
		footerText={bannersDefaultFooterText}
	/>
{/if}

{#if isLayoutUndefined}
	<!-- FIXME: See: https://github.com/nestauk/eurito_indicators/pull/212#issuecomment-985176516 -->
	<div class='spinnerContainer'>
		<LoadingView stroke={theme.colorMain} />
	</div>
{/if}

<div
	class:hidden={isLayoutUndefined}
	class:withThemeEditor={$_showThemeEditor}
	class='_layout root {$_screen?.classes} {$_themeName}'
	role='none'
	style='--menu-height: {menuHeight}px;'
>
	<header
		aria-label='Website header'
		use:headerSizeObserver
	>
		<Nav
			contentHeight={$_contentSize.blockSize}
			bind:showA11yMenu
			isA11yDirty={$_isA11yDirty}
			{segment}
		/>
	</header>
	<main
		aria-label='Website content'
		use:contentSizeObserver
	>
		<slot></slot>
	</main>
	{#if isDev && $_showThemeEditor}
		<ThemeEditor />
	{/if}
	{#if !$_isSmallScreen}
		<footer
			aria-label='Website footer'
		>
			<Footer
				bind:showA11yMenu
				isA11yDirty={$_isA11yDirty}
				{segment}
			/>
		</footer>
	{/if}
	{#if showA11yMenu}
		<section
			bind:offsetHeight={a11yHeight}
			class='accessibility'
		>
			<A11yMenu {_screen} />
		</section>
	{/if}
</div>

<style>
	._layout {
		background: var(--color-background-main) ;
		color: var(--color-main);
		display: grid;
		grid-template-areas:
			'content'
			'nav'
			'accessibility';
		grid-template-rows: calc(100% - var(--menu-height)) min-content min-content;
		height: 100%;
		overflow: hidden;
	}
	div.medium {
		grid-template-areas:
			'nav'
			'content'
			'sponsors'
			'accessibility';
		grid-template-rows: min-content 1fr min-content min-content;
	}
	.medium.withThemeEditor {
		grid-template-areas:
			'nav nav'
			'content editor'
			'sponsors sponsors'
			'accessibility accessibility';
		grid-template-columns: 3.5fr 1fr;
	}
	header {
		border-top: 1px solid var(--color-main-lighter);
		grid-area: nav;
		height: var(--dim-header-height);
		padding: 0 var(--dim-padding);
		width: 100%;
	}
	.medium header {
		border-bottom: 1px solid var(--color-main-lighter);
		border-top: none;
	}
	main {
		grid-area: content;
		height: 100%;
		overflow: hidden;
		position: relative;
		width: 100%;
	}
	footer {
		grid-area: sponsors;
		border-top: thin solid var(--color-main-lighter);
		padding: 0 var(--dim-padding);
	}
	.accessibility {
		grid-area: accessibility;
		z-index: var(--z-1000);
	}
	.medium .accessibility {
		bottom: 150px;
		left: 50%;
		margin-left: -240px;
		position: fixed;
		width: 480px;
	}
	.hidden {
		visibility: hidden;
	}

	.spinnerContainer {
		top: 0;
		left: 0;
		display: flex;
		height: 100%;
		position: fixed;
		width: 100%;
	}
</style>
