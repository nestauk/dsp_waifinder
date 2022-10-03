<script>
	import {
		_a11ySettings,
		_screen,
		A11yMenu,
		A11yMenuDriver,
		FontsLoader,
		LoadingView,
		NoScript,
		ScreenSensor,
		setupResizeObserver
	} from '@svizzle/ui';
	import Bowser from 'bowser';
	import {beforeUpdate, onMount, tick} from 'svelte';

	import {page as _page} from '$app/stores';
	import Footer from '$lib/components/layout/medium/Footer.svelte';
	import Nav from '$lib/components/layout/Nav.svelte';
	import ThemeEditor from '$lib/components/layout/medium/ThemeEditor.svelte';
	import MultiBanner from '$lib/components/svizzle/MultiBanner.svelte';
	import StyleSensor from '$lib/components/svizzle/StyleSensor.svelte';
	import {
		a11yFontFamilies,
		bannersDefaultFooterText,
		fontsInfo,
	} from '$lib/config';
	import {isDev} from '$lib/env';
	import {_isSmallScreen} from '$lib/stores/layout';
	import {
		_bannersTheme,
		_currThemeVars,
		_isThemeEditorActive,
		_themeName,
		_themeVars
	} from '$lib/stores/theme'

	import Privacy from '$lib/_content/info/Privacy.svx';

	const bannerComponents = [
		Privacy
	];

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
	let ScrollBarStyler

	onMount(async () => {
		scriptingActive = true;
		window.nesta_isLayoutUndefined = () => isLayoutUndefined;

		const agentObj = Bowser.parse(window.navigator.userAgent);
		const environment = `${agentObj?.os?.name}/${agentObj?.browser.name}`;
		if (environment === 'Windows/Chrome') {
			// No need to instance component as CSS is already loaded on the
			// page after this point!
			ScrollBarStyler = await import('$lib/components/svizzle/ScrollbarStyler.svelte');
		}
	});

	beforeUpdate(async () => {
		if (isLayoutUndefined) {
			await tick();
		}
	});

	$: [,segment] = $_page.url.pathname.split('/');
	$: menuHeight = $_headerSize.blockSize + (showA11yMenu ? a11yHeight : 0);
	$: $_screen?.classes && (isLayoutUndefined = false);
	$: withThemeEditor = isDev && !$_isSmallScreen && $_isThemeEditorActive;
	$: a11yMenuTheme = {
		colorBackground: $_currThemeVars['--colorBackground'],
		colorBorder: $_currThemeVars['--colorBorderAux'],
		colorKnob: $_currThemeVars['--colorSwitchKnob'],
		colorDisabled: $_currThemeVars['--colorTextDisabled'],
		colorText: $_currThemeVars['--colorText']
	}
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
		theme={$_bannersTheme}
	/>
{/if}

{#if isLayoutUndefined}
	<!-- FIXME: See: https://github.com/nestauk/eurito_indicators/pull/212#issuecomment-985176516 -->
	<div class='spinnerContainer'>
		<LoadingView stroke={$_currThemeVars['--colorIcon']} />
	</div>
{/if}

<div
	class:hidden={isLayoutUndefined}
	class:withThemeEditor
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
			{segment}
		/>
	</header>
	<main
		aria-label='Website content'
		use:contentSizeObserver
	>
		<slot></slot>
	</main>
	{#if !$_isSmallScreen}
		<footer
			aria-label='Website footer'
		>
			<Footer
				bind:showA11yMenu
				{segment}
			/>
		</footer>
	{/if}
	{#if withThemeEditor}
		<section class='editor'>
			<ThemeEditor />
		</section>
	{/if}

	{#if showA11yMenu}
		<section
			bind:offsetHeight={a11yHeight}
			class='accessibility'
		>
			<A11yMenu
				{_screen}
				theme={a11yMenuTheme}
			/>
		</section>
	{/if}
</div>

<style>
	._layout {
		background: var(--colorBackground) ;
		color: var(--colorText);
		display: grid;
		grid-template-areas:
			'content'
			'header'
			'accessibility';
		grid-template-rows: calc(100% - var(--menu-height)) min-content min-content;
		height: 100%;
		overflow: hidden;
	}
	div.medium {
		grid-template-areas:
			'header'
			'content'
			'footer';
		grid-template-rows: min-content 1fr min-content;
	}
	.medium.withThemeEditor {
		grid-template-areas:
			'header editor'
			'content editor'
			'footer editor';
		grid-template-columns: 3.5fr 1fr;
	}
	header {
		border-top: var(--border);
		grid-area: header;
		height: var(--dimHeaderHeight);
		padding: 0 var(--dimPadding);
		width: 100%;
	}
	.medium header {
		border-bottom: var(--border);
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
		border-top: var(--border);
		grid-area: footer;
		height: var(--dimHeaderHeight);
		padding: 0 var(--dimPadding);
	}
	.editor {
		grid-area: editor;
	}
	.accessibility {
		grid-area: accessibility;
		z-index: var(--z1000);
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
