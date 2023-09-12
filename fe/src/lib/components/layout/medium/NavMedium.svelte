<script>
	import {Download, Icon, Info, Link, Send} from '@svizzle/ui';

	import {jsonUrl, LOGOS} from '$lib/config';
	import {
		_currThemeVars,
		_getNavLinkColor,
		_linkTheme0,
		_themeName,
	} from '$lib/stores/theme';

	export let segment;

	$: logos = LOGOS[$_themeName]
</script>

<nav
	class='NavMedium'
	role='none'
>
	<menu>
		<div role='none'>
			<ul role='none'>
				<li role='none'>
					<Link
						href='/'
						theme={{
							...$_linkTheme0,
							color: $_getNavLinkColor(segment, ''),
						}}
					>
						<img
							alt='UK Research and Innovation'
							src={logos.ukri}
						/>
					</Link>
				</li>
				<li role='none'>
					<Link
						href='/methodology'
						theme={{
							...$_linkTheme0,
							color: $_getNavLinkColor(segment, 'methodology'),
						}}
					>
						Methodology
					</Link>
				</li>
				<li role='none'>
					<Link
						href='/guides'
						theme={{
							...$_linkTheme0,
							color: $_getNavLinkColor(segment, 'guides'),
						}}
					>
						Guides
					</Link>
				</li>
				<li role='none'>
					<Link
						href='/explorer'
						theme={{
							...$_linkTheme0,
							color: $_getNavLinkColor(segment, 'explorer'),
						}}
					>
						Explorer
					</Link>
				</li>
			</ul>
		</div>
		<div role='none'>
			<ul role='none'>
				<li
					aria-label='Download the full dataset'
					role='none'
					title='Download the full dataset'
				>
					<Link
						download
						href={jsonUrl}
						theme={{
							...$_linkTheme0,
							color: $_getNavLinkColor(segment, 'dataset'),
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
				<li role='none'>
					<Link
						href='/feedback'
						rel='prefetch'
						theme={{
							...$_linkTheme0,
							color: $_getNavLinkColor(segment, 'feedback'),
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
				<li role='none'>
					<Link
						href='/info'
						rel='prefetch'
						theme={{
							...$_linkTheme0,
							color: $_getNavLinkColor(segment, 'info'),
						}}
					>
						Info
						<Icon
							glyph={Info}
							size=20
							strokeWidth=1.5
							stroke={$_currThemeVars['--colorIcon']}
						/>
					</Link>
				</li>
			</ul>
		</div>
	</menu>
</nav>

<style>
	nav, menu {
		align-items: center;
		display: flex;
		height: 100%;
		width: 100%;
	}
	nav {
		gap: 12px;
		justify-content: end; /* Align to the right on Firefox */
		justify-content: flex-end; /* Align to the right on Chrome */
		position: relative;
	}
	menu {
		background: var(--colorBackground);
		flex-direction: row;
		height: 100%;
		justify-content: space-between;
		left: 0;
		top: 0;
		width: 100%;
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
	li:first-child {
		padding-left: 0;
	}
	img {
		height: 1.5rem;
		padding: 0 0.5rem;
		vertical-align: middle;
	}

</style>
