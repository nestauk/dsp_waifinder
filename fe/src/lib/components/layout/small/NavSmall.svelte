<script>
	import {capitalize} from '@svizzle/utils';
	import {
		A11yPerson,
		Download,
		Icon,
		Info,
		isServerSide,
		Link,
		Menu,
		Moon,
		Send,
		Sun,
		X
	} from '@svizzle/ui';

	import {changelogUrl, jsonUrl, LOGOS} from '$lib/config';
	import {
		_a11yFillColor,
		_a11yStrokeColor,
		_currThemeVars,
		_getNavLinkColor,
		_themeName,
		toggleTheme,
	} from '$lib/stores/theme';
	import {version} from '$lib/utils/version';

	export let contentHeight;
	export let segment;
	export let showA11yMenu = false;

	let showMenu = false;

	const closeMenu = () => {
		showMenu = false;
	}
	const toggleA11yMenu = event => {
		showA11yMenu = !showA11yMenu;
		event.target.setAttribute('aria-expanded', showA11yMenu.toString());
	}
	const toggleMenu = event => {
		showMenu = !showMenu;
		event.target.setAttribute('aria-expanded', showMenu.toString());
	}

	$: themeIconGlyph = $_themeName === 'themeLight' ? Moon : Sun;
	$: logos = LOGOS[$_themeName]
</script>

<nav
	class='NavSmall'
	role='none'
	style='--content-height: {contentHeight}px'
>
	<header>
		{segment ? capitalize(segment) : 'Home'}
	</header>
	<button
		aria-label='Color theme'
		class='clickable'
		on:click={toggleTheme}
	>
		<Icon
			glyph={themeIconGlyph}
			stroke={$_currThemeVars['--colorIcon']}
			strokeWidth=1
			fill=''
		/>
	</button>
	<button
		aria-label='Accessibility settings'
		class='clickable'
		on:click={toggleA11yMenu}
	>
		<Icon
			fill={$_a11yFillColor}
			glyph={A11yPerson}
			stroke={$_a11yStrokeColor}
			strokeWidth=1
		/>
	</button>
	<button
		aria-label='Website links'
		class='clickable'
		on:click={toggleMenu}
	>
		{#if showMenu}
			<Icon
				glyph={X}
				stroke={$_currThemeVars['--colorIcon']}
			/>
		{:else}
			<Icon
				glyph={Menu}
				stroke={$_currThemeVars['--colorIcon']}
			/>
		{/if}
	</button>
	{#if showMenu || isServerSide}
		<menu on:click={closeMenu}>
			<div
				class='sponsors'
				role='none'
			>
				<a href='https://www.ukri.org/'>
					<img src={logos.ukri} alt='UK Research and Innovation' />
				</a>
				<a href='https://www.turing.ac.uk/'>
					<img src={logos.turing} alt='The Alan Turing Institute' />
				</a>
				<a href='https://www.nesta.org.uk/'>
					<img src={logos.nesta} alt='Nesta' />
				</a>
			</div>
			<ul role='none'>
				<li
					aria-label='Source code repository'
					role='none'
				>
					<Link
						href={changelogUrl}
						type='external'
						theme={{
							color: $_currThemeVars['--colorText'],
							iconStroke: $_currThemeVars['--colorIcon']
						}}
					>
						{version}
					</Link>
				</li>
				<li role='none'>
					<Link
						href='/info'
						rel='prefetch'
						theme={{
							color: $_getNavLinkColor(segment, 'info'),
							iconStroke: $_currThemeVars['--colorIcon']
						}}
					>
						Info
						<Icon
							glyph={Info}
							size=20
							stroke={$_currThemeVars['--colorIcon']}
							strokeWidth=1.5
						/>
					</Link>
				</li>
				<li role='none'>
					<Link
						href='/feedback'
						rel='prefetch'
						theme={{
							color: $_getNavLinkColor(segment, 'feedback'),
							iconStroke: $_currThemeVars['--colorIcon']
						}}
					>
						Feedback
						<Icon
							glyph={Send}
							size=20
							stroke={$_currThemeVars['--colorIcon']}
							strokeWidth=1.5
						/>
					</Link>
				</li>
				<li
					aria-label='Download the full dataset'
					role='none'
					title='Download the full dataset'
				>
					<Link
						download
						href={jsonUrl}
						theme={{
							color: $_getNavLinkColor(segment, 'download'),
							iconStroke: $_currThemeVars['--colorIcon']
						}}
					>
						Dataset
						<Icon
							glyph={Download}
							size=20
							stroke={$_currThemeVars['--colorIcon']}
							strokeWidth=1.5
						/>
					</Link>
				</li>
				<li
					class='sectionStart'
					role='none'
				>
					<Link
						href='/accessibility'
						theme={{
							color: $_getNavLinkColor(segment, 'accessibility'),
							iconStroke: $_currThemeVars['--colorIcon']
						}}
					>
						Accessibility
					</Link>
				</li>
				<li role='none'>
					<Link
						href='/guides'
						theme={{
							color: $_getNavLinkColor(segment, 'guides'),
							iconStroke: $_currThemeVars['--colorIcon']
						}}
					>
						Guides
					</Link>
				</li>
				<li role='none'>
					<Link
						href='/methodology'
						theme={{
							color: $_getNavLinkColor(segment, 'methodology'),
							iconStroke: $_currThemeVars['--colorIcon']
						}}
					>
						Methodology
					</Link>
				</li>
				<li role='none'>
					<Link
						href='/explorer'
						theme={{
							color: $_getNavLinkColor(segment, 'explorer'),
							iconStroke: $_currThemeVars['--colorIcon']
						}}
					>
						Explorer
					</Link>
				</li>
				<li role='none'>
					<Link
						href='/'
						theme={{
							color: $_getNavLinkColor(segment, ''),
							iconStroke: $_currThemeVars['--colorIcon']
						}}
					>
						Home
					</Link>
				</li>
			</ul>
		</menu>
	{/if}
</nav>

<style>
	nav, menu {
		align-items: center;
		height: 100%;
		width: 100%;
		z-index: var(--z1000);
	}
	nav {
		display: flex;
		gap: 12px;
		justify-content: end; /* Align to the right on Firefox */
		justify-content: flex-end; /* Align to the right on Chrome */
		position: relative;
	}
	header {
		color: var(--colorNavLinkActive);
		font-weight: bold;
		margin: 0 auto;
		position: absolute;
		text-align: center;
		width: 100%;
	}
	button {
		border: none;
		background: transparent;
		color: var(--colorText);
		width: min-content;
		height: min-content;
		z-index: var(--z1000);
	}
	menu {
		background: var(--colorBackground);
		display: grid;
		grid-template-rows: min-content 1fr;
		height: var(--content-height);
		left: 0;
		position: fixed;
		top: 0;
		width: 100%;
	}
	.sponsors {
		align-items: center;
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		grid-gap: 1em;
		justify-items: center;
		padding: 1em;
		width: 100%;
	}
	ul {
		align-items: center;
		display: grid;
		height: 100%;
		justify-items: center;
		margin: 0;
		overflow: auto;
		padding: 7vh 1em;
	}
	img {
		width: 100%;
		max-width: 8em;
		vertical-align: middle;
	}
	.sectionStart {
		padding-top: 7vh;
	}
	li {
		display: block;
		white-space: nowrap;
	}
</style>
