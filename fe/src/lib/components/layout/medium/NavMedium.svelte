<script>
	import {Download, Icon, Info, Link, Send} from '@svizzle/ui';

	import {jsonUrl} from '$lib/config';
	import {_getLinkColor} from '$lib/stores/theme';

	export let segment;

</script>

<nav
	class='NavMedium'
	role='none'
>
	<menu>
		<div role='none'>
			<ul role='none'>
				<li
					class:selected='{segment === undefined}'
					role='none'
				>
					<Link
						href='/'
						theme={{color: $_getLinkColor('')}}
					>
						Home
					</Link>
				</li>
				<li
					class:selected='{segment === 'methodology'}'
					role='none'
				>
					<Link
						href='/methodology'
						theme={{color: $_getLinkColor('methodology')}}
					>
						Methodology
					</Link>
				</li>
				<li
					class:selected='{segment === 'guides'}'
					role='none'
				>
					<Link
						href='/guides'
						theme={{color: $_getLinkColor('guides')}}
					>
						Guides
					</Link>
				</li>
				<li
					class:selected='{segment === 'explorer'}'
					role='none'
				>
					<Link
						href='/explorer'
						theme={{color: $_getLinkColor('explorer')}}
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
					>
						Dataset
						<Icon
							glyph={Download}
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
						href='/feedback'
						rel='prefetch'
						theme={{color: $_getLinkColor('feedback')}}
					>
						Feedback
						<Icon
							glyph={Send}
							size=20
							strokeWidth=1.5
						/>
					</Link>
				</li>
				<li
					class:selected='{segment === 'info'}'
					role='none'
				>
					<Link
						href='/info'
						rel='prefetch'
						theme={{color: $_getLinkColor('info')}}
					>
						Info
						<Icon
							glyph={Info}
							size=20
							strokeWidth=1.5
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
		background: var(--colorBackgroundMain);
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
	li.selected {
		color: var(--colorLink);
		display: inline-block;
		position: relative;
	}
</style>
