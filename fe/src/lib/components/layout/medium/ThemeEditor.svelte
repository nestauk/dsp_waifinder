<script>
	import {CopyToClipboard, StyleDriver} from '@svizzle/ui';
	import {containsOneOf} from '@svizzle/utils';
	import * as _ from 'lamb';

	import {
		_currThemeVars,
		_themeName,
		_themeNames,
		_themeVars
	} from '$lib/stores/theme.js';
	import {
		getHexColor,
		getThemeClassDefsText
	} from '$lib/utils/svizzle/style.js';

	const getVarNames = _.pipe([
		_.keys,
		_.filterWith(containsOneOf(['color']))
	]);
	const setColor = (prop, value) => {
		$_themeVars[`.${$_themeName}`][prop] = value
	};

	$: varNames = $_currThemeVars ? getVarNames($_currThemeVars) : [];

	const makeOnKeyDown = themeName => event => {
		if (['Enter', ' '].includes(event.key)) {
			event.preventDefault();
			$_themeName = themeName;
		}
	}
</script>

<StyleDriver
	href='/css/global.css'
	styleRules={$_themeVars}
/>

<section class='ThemeEditor'>

	<!-- header -->

	<header>
		<h3>
			Current Style: <span>{$_themeName}</span>
		</h3>
		<CopyToClipboard getText={() => getThemeClassDefsText($_themeVars)} />
	</header>

	<!-- themes -->

	<ul class='themeList'>
		{#each $_themeNames as name}
			<li
				class:selected={name === $_themeName}
				on:click={() => {$_themeName = name}}
				on:keydown={makeOnKeyDown(name)}
			>
				{name}
			</li>
		{/each}
	</ul>

	<!-- vars -->

	<ul class='varList'>
		{#each varNames as varName}
			<div class='themeVar'>
				<span>{varName}</span>
				<span>
					<input
						on:input={({target: {value}}) => setColor(varName, value)}
						type='color'
						value={getHexColor($_currThemeVars[varName])}
					/>
				</span>
			</div>
		{/each}
	</ul>

</section>

<style>
	.ThemeEditor {
		padding: 1em;
		border-left: var(--border);
		display: grid;
		grid-template-rows: min-content min-content 1fr;
		height: 100%;
	}

	header {
		display: grid;
		grid-template-columns: 1fr min-content;
	}
	header span {
		color: var(--colorText);
	}

	ul {
		list-style: none;
	}

	.themeList {
		border: var(--border);
		margin-bottom: 0.5em;
	}
	.themeList .selected {
		background: var(--colorSelectedBackground);
		color: var(--colorSelectedText);
	}

	.varList {
		overflow: auto;
	}

	.themeVar {
		display: flex;
		justify-content: space-between;
	}
</style>
