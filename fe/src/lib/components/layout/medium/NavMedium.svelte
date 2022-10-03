<script>
	import {Download, Icon, Info, Link, Send} from '@svizzle/ui';

	import {jsonUrl} from '$lib/config';
	import {
		_currThemeVars,
		_getNavLinkColor
	} from '$lib/stores/theme';

	export let segment;

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
							color: $_getNavLinkColor(segment, ''),
							iconStroke: $_currThemeVars['--colorIcon']
						}}
					>
						Home
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
						href='/explorer'
						theme={{
							color: $_getNavLinkColor(segment, 'explorer'),
							iconStroke: $_currThemeVars['--colorIcon']
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
							color: $_getNavLinkColor(segment, 'dataset'),
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
		z-index: var(--z1000);
	}
	nav {
		gap: 12px;
		justify-content: end; /* Align to the right on Firefox */
		justify-content: flex-end; /* Align to the right on Chrome */
		position: relative;
	}
	div {
		z-index: var(--z1000);
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
