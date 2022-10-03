<script>
	import {A11yPerson, Icon, Droplet, Link, Moon, Sun} from '@svizzle/ui';

	import {changelogUrl, LOGOS} from '$lib/config';
	import {isDev} from '$lib/env';
	import {
		_a11yFillColor,
		_a11yStrokeColor,
		_currThemeVars,
		_getLinkColor,
		_isThemeEditorActive,
		_themeName,
		toggleTheme,
	} from '$lib/stores/theme';
	import {version} from '$lib/utils/version';

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
		<a href='https://www.ukri.org/'>
			<img
				alt='UK Research and Innovation'
				src={logos.ukri}
			/>
		</a>
		<a href='https://www.turing.ac.uk/'>
			<img
				alt='The Alan Turing Institute'
				src={logos.turing}
			/>
		</a>
		<a href='https://www.nesta.org.uk/'>
			<img
				alt='Nesta'
				src={logos.nesta}
			/>
		</a>
	</span>

	<!-- center: version -->

	<div
		aria-label='Source code repository'
		role='none'
	>
		<Link
			href={changelogUrl}
			type='external'
			theme={{
				color: $_currThemeVars['--colorMain'],
				iconStroke: $_currThemeVars['--colorMain']
			}}
		>
			{version}
		</Link>
	</div>

	<!-- right -->

	<nav>
		<ul>

			<!-- theme editor button -->

			{#if isDev}
				<li role='none'>
					<button
						aria-label='Color theme editor'
						on:click={toggleThemeEditor}
						class='clickable'
					>
						<Icon
							glyph={Droplet}
							stroke={$_currThemeVars['--colorMain)']}
							strokeWidth=1
						/>
					</button>
				</li>
			{/if}

			<!-- theme switcher -->

			<li role='none'>
				<button
					aria-label='Color theme'
					on:click={toggleTheme}
					class='clickable'
				>
					<Icon
						glyph={themeIconGlyph}
						stroke={$_currThemeVars['--colorMain)']}
						strokeWidth=1
						fill=''
					/>
				</button>
			</li>

			<!-- a11y -->

			<li
				class:selected='{segment === 'accessibility'}'
				role='none'
			>
				<Link
					href='/accessibility'
					theme={{color: $_getLinkColor('accessibility')}}
				>
					Accessibility
				</Link>
			</li>
			<li role='none'>
				<button
					aria-label='Accessibility settings'
					on:click={toggleA11yMenu}
					class='clickable'
				>
					<Icon
						glyph={A11yPerson}
						stroke={$_a11yStrokeColor}
						strokeWidth=1
						fill={$_a11yFillColor}
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
	li.selected {
		color: var(--colorLink);
		display: inline-block;
		position: relative;
	}

	button {
		border: none;
		background: transparent;
		color: var(--colorMain);
		width: min-content;
		height: min-content;
		z-index: var(--z1000);
	}
</style>
