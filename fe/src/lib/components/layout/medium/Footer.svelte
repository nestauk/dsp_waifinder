<script>
	import {A11yPerson, Icon, Droplet, HyperLink, Moon, Sun} from '@svizzle/ui';

	import {changelogUrl, LOGOS} from '$lib/config.js';
	import {isDev} from '$lib/env.js';
	import {
		_a11yIconFillColor,
		_a11yIconStrokeColor,
		_currThemeVars,
		_getNavLinkColor,
		_isThemeEditorActive,
		_linkTheme0,
		_extLinkTheme,
		_themeName,
		toggleTheme,
	} from '$lib/stores/theme.js';
	import {version} from '$lib/utils/version.js';

	export let segment;
	export let showA11yMenu = false;

	const toggleA11yMenu = event => {
		showA11yMenu = !showA11yMenu;
		event.target.setAttribute('aria-expanded', showA11yMenu.toString());
	}
	const toggleThemeEditor = () => {
		if (isDev) {
			$_isThemeEditorActive = !$_isThemeEditorActive;
		}
	}

	$: themeIconGlyph = $_themeName === 'themeLight' ? Moon : Sun;
	$: logos = LOGOS[$_themeName]
</script>

<div class='Footer'>

	<!-- left: sponsors -->

	<span>
		<HyperLink
			href='https://www.nesta.org.uk/'
			target='_blank'
			theme={$_linkTheme0}
		>
			<img
				alt='Nesta'
				src={logos.nesta}
			/>
		</HyperLink>
	</span>

	<!-- center: version -->

	<div
		aria-label='Source code repository'
		role='none'
	>
		<HyperLink
			href={changelogUrl}
			type='external'
			theme={$_extLinkTheme}
		>
			{version}
		</HyperLink>
	</div>

	<!-- right -->

	<nav>
		<ul>

			<!-- theme editor button -->

			{#if isDev}
				<li role='none'>
					<button
						aria-label='Color theme editor'
						class='clickable'
						on:click={toggleThemeEditor}
					>
						<Icon
							glyph={Droplet}
							stroke={$_currThemeVars['--colorIcon']}
							strokeWidth=1
						/>
					</button>
				</li>
			{/if}

			<!-- theme switcher -->

			<li role='none'>
				<button
					aria-label='Color theme'
					class='clickable'
					on:click={toggleTheme}
				>
					<Icon
						fill=''
						glyph={themeIconGlyph}
						stroke={$_currThemeVars['--colorIcon']}
						strokeWidth=1
					/>
				</button>
			</li>

			<!-- a11y -->

			<li role='none'>
				<HyperLink
					href='/accessibility'
					theme={{
						...$_linkTheme0,
						color: $_getNavLinkColor(segment, 'accessibility'),
					}}
				>
					Accessibility
				</HyperLink>
			</li>
			<li role='none'>
				<button
					aria-label='Accessibility settings'
					class='clickable'
					on:click={toggleA11yMenu}
				>
					<Icon
						fill={$_a11yIconFillColor}
						glyph={A11yPerson}
						stroke={$_a11yIconStrokeColor}
						strokeWidth=1
					/>
				</button>
			</li>
		</ul>
	</nav>

</div>

<style>
	.Footer {
		align-content: center;
		display: grid;
		grid-auto-flow: column;
		height: 100%;
	}
	.Footer > span {
		justify-self: start;
	}
	.Footer > div {
		justify-self: center;
	}
	.Footer > nav {
		justify-self: end;
	}
	.Footer img {
		height: 1.5rem;
		padding: 0 0.5rem;
		vertical-align: middle;
	}
	ul {
		align-items: center;
		display: flex;
		flex-direction: row;
		margin: 0;
		padding: 0;
	}
	li {
		display: block;
		padding: 0 0.5em;
		white-space: nowrap;
	}
	button {
		border: none;
		background: transparent;
		color: var(--colorText);
		width: min-content;
		height: min-content;
		z-index: var(--z1000);
	}
	button:focus-visible {
		outline: var(--outline)
	}
</style>
