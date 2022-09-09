<script>
	import {_screen, ChevronLeft, ChevronRight, Icon} from '@svizzle/ui';
	import {isNotNil} from '@svizzle/utils';
	import * as _ from 'lamb';

	import Link from '$lib/components/svizzle/Link.svelte';
	import {_currThemeVars} from '$lib/stores/theme';

	const segments = ['survey', 'add_your_org'];
	const titles = {
		add_your_org: 'Add your org',
		survey: 'Survey'
	};

	export let segment;

	$: currentValueIndex = _.findIndex(segments, _.is(segment));
	$: prevSegment = segments[currentValueIndex - 1];
	$: nextSegment = segments[currentValueIndex + 1];
	$: hasPrevSegment = isNotNil(prevSegment);
	$: hasNextSegment = isNotNil(nextSegment);
</script>

<main class='_layout feedback {$_screen?.classes}'>
	<section>
		<h1>Feedback</h1>
		<menu class='tabs'>
			{#if $_screen?.sizes?.medium}
				<ul>
					{#each segments as id}
						<li class:selected={segment === id}>
							<Link
								href='/feedback/{id}'
								theme={{
									color: segment === id
										? $_currThemeVars['--colorMainInverted']
										: $_currThemeVars['--colorLink']
								}}
							>
								<span>
									{titles[id]}
								</span>
							</Link>
						</li>
					{/each}
				</ul>
			{:else}
				<div class='tab-selector'>
					<label for=''>
						{titles[segment]}
					</label>

					<div>
						<Link
							ariaLabel={hasPrevSegment ? 'Previous tab' : null}
							href={hasPrevSegment && `/feedback/${prevSegment}`}
							theme={{
								color: hasPrevSegment
									? $_currThemeVars['--colorLink']
									: $_currThemeVars['--colorDisabled']
							}}
						>
							<Icon glyph={ChevronLeft} />
						</Link>
					</div>
					<div>
						<Link
							ariaLabel={hasNextSegment ? 'Next tab' : null}
							href={hasNextSegment && `/feedback/${nextSegment}`}
							theme={{
								color: hasNextSegment
									? $_currThemeVars['--colorLink']
									: $_currThemeVars['--colorDisabled']
							}}
						>
							<Icon glyph={ChevronRight} />
						</Link>
					</div>
				</div>
			{/if}
		</menu>
		<slot />
	</section>
</main>

<style>
	main {
		background-color: var(--colorBackground);
		display: flex;
		font-weight: 200;
		height: 100%;
		justify-content: space-around;
		width: 100%;
	}

	section {
		background-color: var(--colorBackgroundMain);
		display: grid;
		max-width: 900px;
		overflow-y: auto;
		padding: 2rem;
		width: 100%;
	}

	.small section {
		grid-template-areas: 'header' 'slot' 'menu';
		grid-template-rows: auto 1fr auto;
	}

	.medium section {
		grid-template-areas: 'header' 'menu' 'slot';
		grid-template-rows: auto auto 1fr;
	}

	h1 {
		font-weight: bold;
		grid-area: header;
	}

	ul {
		list-style: initial;
		margin-left: 20px;
	}

	.tabs {
		user-select: none;
		grid-area: menu;
	}

	.small .tabs {
		margin-top: 2rem;
	}
	.medium .tabs {
		margin-top: 0;
	}
	.tabs ul {
		display: flex;
		flex-direction: row;
		justify-content: center;
		list-style-type: none;
		margin: 3rem 0 1rem 0;
	}
	.tab-selector label{
		display: block;
		padding: 0.5em 1em;
	}
	.tab-selector div {
		padding: 0.5em 0.5em;
		border-left: thin solid var(--colorMain);
	}
	.tabs li {
		border-bottom: thin solid var(--colorMain);
		border-top: thin solid var(--colorMain);
		border-right: thin solid var(--colorMain);
	}
	.tabs li:first-child {
		border-left: thin solid var(--colorMain);
	}
	.tabs li.selected {
		background: var(--colorMain);
	}

	.tabs li span {
		display: block;
		padding: 0.5em 1em;
	}

	.tabs .tab-selector {
		border: thin solid var(--colorMain);
		display: grid;
		grid-template-columns: 1fr min-content min-content;
	}
	.spinner {
		display: inline-block !important;
		margin-left: 1em;
		height: 1rem;
		width: 1rem;
	}
</style>
