<script>
	import {
		_screen,
		ChevronLeft,
		ChevronRight,
		Icon,
		isClientSide,
		Link,
	} from '@svizzle/ui';
	import {isNotNil} from '@svizzle/utils';
	import * as _ from 'lamb';

	import {page as _page} from '$app/stores';
	import {_currThemeVars} from '$lib/stores/theme';

	const segments = ['orgs', 'topics'];
	const titles = {
		orgs:'Organisations',
		topics: 'Topics',
	};

	let contentElement;

	$: [,,segment] = $_page.url.pathname.split('/');
	$: currentValueIndex = _.findIndex(segments, _.is(segment));
	$: prevSegment = segments[currentValueIndex - 1];
	$: nextSegment = segments[currentValueIndex + 1];
	$: hasPrevSegment = isNotNil(prevSegment);
	$: hasNextSegment = isNotNil(nextSegment);

	$: {
		// eslint-disable-next-line no-unused-expressions
		$_page;
		isClientSide && contentElement?.scrollTo(0, 0);
	}

	$: linkTheme = {
		outlineColor: $_currThemeVars['--colorOutline'],
		outlineStyle: $_currThemeVars['--focusLineStyle'],
		outlineWidth: $_currThemeVars['--focusLineWidth'],
	}
</script>

<main class='_layout methodology {$_screen?.classes}'>
	<section>
		<h1>Methodology</h1>
		<menu class='tabs'>
			{#if $_screen?.sizes?.medium}
				<ul>
					{#each segments as id}
						<li
							class:selected={segment === id}
						>
							<Link
								href='/methodology/{id}'
								theme={{
									...linkTheme,
									color: segment === id
										? $_currThemeVars['--colorTextInverted']
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
							ariaLabel={hasPrevSegment ? 'Previous document' : null}
							href={hasPrevSegment && `/methodology/${prevSegment}`}
							theme={{
								...linkTheme,
								color: hasPrevSegment
									? $_currThemeVars['--colorLink']
									: $_currThemeVars['--colorTextDisabled']
							}}
						>
							<Icon glyph={ChevronLeft} />
						</Link>
					</div>
					<div>
						<Link
							ariaLabel={hasNextSegment ? 'Next document' : null}
							href={hasNextSegment && `/methodology/${nextSegment}`}
							theme={{
								...linkTheme,
								color: hasNextSegment
									? $_currThemeVars['--colorLink']
									: $_currThemeVars['--colorTextDisabled']
							}}
						>
							<Icon glyph={ChevronRight} />
						</Link>
					</div>
				</div>
			{/if}
		</menu>
		<div bind:this={contentElement}>
			<slot />
		</div>
	</section>
</main>

<style>
	main {
		background-color: var(--colorPageBackground);
		display: flex;
		font-weight: 200;
		height: 100%;
		justify-content: space-around;
		width: 100%;
	}

	section {
		background-color: var(--colorBackground);
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

	div {
		background-color: var(--colorBackground);
		max-width: 900px;
		overflow-y: auto;
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
		border-left: var(--border);
	}
	.tabs li {
		border-bottom: var(--border);
		border-top: var(--border);
		border-right: var(--border);
	}
	.tabs li:first-child {
		border-left: var(--border);
	}
	.tabs li.selected {
		background: var(--colorActiveBackground);
	}

	.tabs li span {
		display: block;
		padding: 0.5em 1em;
	}

	.tabs .tab-selector {
		border: var(--border);
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
