<script>
	import {Download, Icon, Info, Link, Send} from '@svizzle/ui';

	import {jsonUrl} from '$lib/config';
	import {
		_currThemeVars,
		_getNavLinkColor
	} from '$lib/stores/theme';

	export let segment;

	$: linkTheme = {
		color: $_currThemeVars['--colorNavLink'],
		iconStroke: $_currThemeVars['--colorIcon'],
		outlineColor: $_currThemeVars['--colorOutline'],
		outlineStyle: $_currThemeVars['--focusLineStyle'],
		outlineWidth: $_currThemeVars['--focusLineWidth'],
	};
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
							...linkTheme,
							color: $_getNavLinkColor(segment, ''),
						}}
					>
						Home
					</Link>
				</li>
				<li role='none'>
					<Link
						href='/methodology'
						theme={{
							...linkTheme,
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
							...linkTheme,
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
							...linkTheme,
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
							...linkTheme,
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
							...linkTheme,
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
							...linkTheme,
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
</style>
