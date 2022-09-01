<script>
	import {capitalize} from '@svizzle/utils';
	import Icon from '@svizzle/ui/src/icons/Icon.svelte';
	import Download from '@svizzle/ui/src/icons/feather/Download.svelte';
	import Info from '@svizzle/ui/src/icons/feather/Info.svelte';
	import Menu from '@svizzle/ui/src/icons/feather/Menu.svelte';
	import Send from '@svizzle/ui/src/icons/feather/Send.svelte';
	import X from '@svizzle/ui/src/icons/feather/X.svelte';
	import A11yPerson from '@svizzle/ui/src/icons/svizzle/A11yPerson.svelte';
	import Link from '@svizzle/ui/src/Link.svelte';
	import {isServerSide} from '@svizzle/ui/src/utils/env';

	import {changelogUrl, jsonUrl} from '$lib/config';
	import {
		_a11yFillColor,
		_a11yStrokeColor,
		_currThemeVars
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

	$: makeColor = id =>
		segment === id ? $_currThemeVars['--colorLink'] : undefined;
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
				<Icon glyph={X} />
			{:else}
				<Icon glyph={Menu} />
			{/if}
		</button>
	{#if showMenu || isServerSide}
		<menu on:click={closeMenu}>
			<div
				class='sponsors'
				role='none'
			>
				<a href='https://www.ukri.org/'>
					<img src='/logos/UKResearchAndInnovation.svg' alt='Nesta' />
				</a>
				<a href='https://www.turing.ac.uk/'>
					<img src='/logos/AlanTuringInstitute.svg' alt='Nesta' />
				</a>
				<a href='https://www.nesta.org.uk/'>
					<img src='/logos/Nesta.svg' alt='Nesta' />
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
							color: $_currThemeVars['--colorMain'],
							iconStroke: $_currThemeVars['--colorMain']
						}}
					>
						{version}
					</Link>
				</li>
				<li
					class:selected='{segment === 'info'}'
					role='none'
				>
					<Link
						href='info'
						rel='prefetch'
						theme={{color: makeColor('info')}}
					>
						Info
						<Icon
							glyph={Info}
							size=20
							strokeWidth=1.5
						/>
					</Link>
				</li>
				<li
					class:selected='{segment === 'feedback'}'
					role='none'
				>
					<Link
						href='feedback'
						rel='prefetch'
						theme={{color: makeColor('feedback')}}
					>
						Feedback
						<Icon
							glyph={Send}
							size=20
							strokeWidth=1.5
						/>
					</Link>
				</li>
				<li role='none'>
					<Link
						download
						href={jsonUrl}
					>
						Download
						<Icon
							glyph={Download}
							size=20
							strokeWidth=1.5
						/>
					</Link>
				</li>
				<li
					class:selected='{segment === 'accessibility'}'
					class='sectionStart'
					role='none'
				>
					<Link
						href='accessibility'
						theme={{color: makeColor('accessibility')}}
					>
						Accessibility
					</Link>
				</li>
				<li
					class:selected='{segment === 'guides'}'
					role='none'
				>
					<Link
						href='guides'
						theme={{color: makeColor('guides')}}
					>
						Guides
					</Link>
				</li>
				<li
					class:selected='{segment === 'methodology'}'
					role='none'
				>
					<Link
						href='methodology'
						theme={{color: makeColor('methodology')}}
					>
						Methodology
					</Link>
				</li>
				<li
					class:selected='{segment === 'explorer'}'
					role='none'
				>
					<Link
						href='explorer'
						theme={{color: makeColor('explorer')}}
					>
						Explorer
					</Link>
				</li>
				<li
					class:selected='{segment === undefined}'
					role='none'
				>
					<Link
						href='/'
						theme={{color: makeColor('.')}}
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
		color: var(--colorLink);
		font-weight: bold;
		margin: 0 auto;
		position: absolute;
		text-align: center;
		width: 100%;
	}
	button {
		border: none;
		background: transparent;
		color: var(--colorMain);
		width: min-content;
		height: min-content;
		z-index: var(--z1000);
	}
	menu {
		background: var(--colorBackgroundMain);
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
