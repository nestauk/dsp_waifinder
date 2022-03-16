<script>
	import {isNotNil} from '@svizzle/utils';
	import {_screen}
		from '@svizzle/ui/src/sensors/screen/ScreenSensor.svelte';
	import Bowser from 'bowser';
	import * as _ from 'lamb';
	import {onMount} from 'svelte';

	import ChevronLeft from '@svizzle/ui/src/icons/feather/ChevronLeft.svelte';
	import ChevronRight from '@svizzle/ui/src/icons/feather/ChevronRight.svelte';
	import Icon from '@svizzle/ui/src/icons/Icon.svelte';
	import Link from '@svizzle/ui/src/Link.svelte';
	import LoadingView from '@svizzle/ui/src/LoadingView.svelte';

	import H2 from 'app/components/mdsvex/h2.svelte';
	import P from 'app/components/mdsvex/p.svelte';

	import {
		failingA11yAudit,
		lighthouseUrls,
		toolName
	} from 'app/config';
	import theme from 'app/theme';
	import {
		getTest,
		getTestResultsFilename,
		groupTests,
		testResultsBaseURL,
		summarizeResults
	} from 'app/utils/tests';

	import Accessibility from './_content/Accessibility.svx';

	const lighthouseIssueUrl = 'https://github.com/GoogleChrome/lighthouse/issues/12039';

	const reportNames = _.keys(lighthouseUrls)
	const updateCurrentReport = id => currentreport = id;

	const linkTheme = {
		color: theme.colorLink,
		iconStroke: theme.colorLink
	};

	let currentreport = reportNames[0];
	let environment;
	let lighthouseFrame;
	let loadingResults = false;
	let testResults = {
		tested: false,
		passed: false
	};

	async function loadResults (environment) {
		const fileName = getTestResultsFilename(environment);
		if (fileName) {
			const response = await fetch(`${testResultsBaseURL}/${fileName}`);
			const allTests = await response.json();
			const indexedResults = groupTests(allTests);
			const test = getTest(indexedResults, environment)
			testResults = summarizeResults(test);
		}
	}

	function resizeIFrameToFitContent ( iFrame ) {
		loadingResults = false
		iFrame.height = iFrame.contentWindow.document.body.scrollHeight;
	}

	onMount(() => {
		environment = Bowser.parse(window.navigator.userAgent);
		loadResults(environment);
	})

	$: currentreport, loadingResults = true;
	$: currentValueIndex = _.findIndex(
		reportNames,
		_.is(currentreport)
	);
	$: prevValue = reportNames[currentValueIndex - 1];
	$: nextValue = reportNames[currentValueIndex + 1];
	$: hasPrevValue = isNotNil(prevValue);
	$: hasNextValue = isNotNil(nextValue);
	$: clickedPrev =
		() => hasPrevValue && updateCurrentReport(prevValue);
	$: clickedNext =
		() => hasNextValue && updateCurrentReport(nextValue);
	$: reportUrl = `/audits/lighthouse/${currentreport}.html`;
</script>

<svelte:head>
	<title>Accessibility - {toolName}</title>
	<meta
		name='description'
		content='All about accessibility in the {toolName}, including a guide on how to enable the accessibility dialog, accessibility audit and other quality audits, plus some pointers to setup various accessibility tools on your system'
	>
</svelte:head>

<main class={$_screen?.classes}>
	<section>
		<Accessibility/>

		<H2>Detected Browsing Environment</H2>
		<dl>
			<dt>Platform</dt>
			<dd>{environment?.platform?.type}</dd>
			<dt>Operating System</dt>
			<dd>
				{environment?.os?.name}
				{#if environment?.os?.versionName}
					- {environment.os.versionName}
				{/if}
			</dd>
			<dt>Browser</dt>
			<dd>
				{environment?.browser.name}
				{#if environment?.browser?.version}
					- {environment.browser.version}
				{/if}
			</dd>
			<dt>Engine</dt>
			<dd>
				{environment?.engine.name}
				{#if environment?.engine?.version}
					- {environment.engine.version}
				{/if}
			</dd>
		</dl>

		{#if testResults?.tested}
			<P>
				{#if testResults.passed}
					This browsing environment has been tested and is supported.
				{:else}
					This browsing environment has been tested but some tests
					have failed and it may not be fully supported.
				{/if}
			</P>
		{:else}
			<P>
				This browsing environment hasn't been tested and user experience
				may vary.
				{#if environment?.os?.name === 'Linux'}
					Browserstack does not offer testing under Linux operating
					systems
				{/if}
			</P>
		{/if}

		<H2>Quality audits</H2>
		<menu class='tabs'>
			{#if $_screen?.sizes?.medium}
				<ul>
					{#each reportNames as id}
						<li>
							<input
								{id}
								type='radio'
								bind:group={currentreport}
								value={id}
							>
							<label for={id} class='clickable'>
								{id}
							</label>
						</li>
					{/each}
					{#if loadingResults}
						<li class='meta'>
							<div class='spinner'>
								<LoadingView
									size={24}
									stroke={theme.colorMain}
									strokeWidth={1}
								/>
							</div>
						</li>
					{/if}
				</ul>
			{:else}
				<div class='tab-selector'>
					<label for=''>
						{currentreport}
						{#if loadingResults}
							<div class='spinner'>
								<LoadingView
									size={24}
									stroke={theme.colorMain}
									strokeWidth={1}
								/>
							</div>
						{/if}
					</label>

					<button
						class:clickable={hasPrevValue}
						disabled={!hasPrevValue}
						on:click={clickedPrev}
					>
						<Icon glyph={ChevronLeft} />
					</button>
					<button
						class:clickable={hasNextValue}
						disabled={!hasNextValue}
						on:click={clickedNext}
					>
						<Icon glyph={ChevronRight} />
					</button>
				</div>
			{/if}
		</menu>
		{#if failingA11yAudit.includes(currentreport)}
			<figure>
				Unfortunately the accessibility audit for this page fails
				because of an
				<Link
					href={lighthouseIssueUrl}
					isBold={true}
					theme={linkTheme}
					type='external'
				>
					issue
				</Link> in Google Lighthouse.
			</figure>
		{/if}
		<iframe
			bind:this={lighthouseFrame}
			frameborder='0'
			marginheight='0'
			marginwidth='0'
			src={reportUrl}
			title='Accessibility validation results'
			on:load={e => resizeIFrameToFitContent(lighthouseFrame)}
		>
			Loading...
		</iframe>
	</section>
</main>

<style>
	main {
		background-color: var(--color-background);
		display: flex;
		font-weight: 200;
		height: 100%;
		justify-content: space-around;
		width: 100%;
	}

	section {
		background-color: white;
		box-shadow: var(--box-shadow-y);
		max-width: 900px;
		overflow-y: auto;
		padding: 2rem;
	}

	figure {
		background: var(--color-warning-background);
		border: thin solid var(--color-warning-border);
		color: var(--color-warning-text);
		padding: 0.5em 1em;
	}

	iframe {
		width: 100%;
	}

	dl {
		display: grid;
		grid-template-rows: repeat(4, auto);
		grid-template-columns: repeat(2, minmax(min-content, max-content));
	}
	dt {
		padding: 0.5em 1em;
		border-top: thin solid white;
		color: white;
		background: var(--color-main);
		text-align: right;
	}
	dt:first-child {
		border-top: none;
	}
	dd {
		border: thin solid var(--color-main);
		padding: 0.5em 1em;
	}
	dd:not(:last-child) {
		border-bottom: none;
	}
	.tabs ul {
		border-bottom: thin solid var(--color-main);
		display: flex;
		flex-direction: row;
		list-style-type: none;
		margin: 0;
	}
	.tabs input {
		display: none;
	}
	.tabs input[type="radio"] + label, .tabs div label, .tabs li .spinner {
		display: block;
		padding: 0.5em 1em;
	}
	.tabs li:first-child {
		border-left: thin solid var(--color-main);
	}
	.tabs li {
		border-top: thin solid var(--color-main);
		border-right: thin solid var(--color-main);
	}
	.tabs li.meta {
		align-items: center;
		border: none;
		display: flex;
	}
	.tabs input[type="radio"]:checked + label {
		background: var(--color-main);
		color: white;
	}

	.tabs .tab-selector {
		border: thin solid var(--color-main);
		display: grid;
		grid-template-columns: 1fr min-content min-content;
	}
	.tabs button {
		background: white;
		border: none;
		border-left: thin solid var(--color-main);
		height: 2.5rem;
		width: 2.5rem;
	}
	.spinner {
		display: inline-block !important;
		margin-left: 1em;
		height: 1rem;
		width: 1rem;
	}
</style>
