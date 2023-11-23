<script>
	import {
		CopyToClipboard,
		HighlightedText,
		HyperLink,
		Icon,
		Link2,
		MinusCircle,
		PlusCircle,
		Scroller,
	} from '@svizzle/ui';
	import * as _ from 'lamb';
	import {createEventDispatcher} from 'svelte';

	import {_hero, setHero, clearHero} from '$lib/stores/interaction';
	import {_isSmallScreen} from '$lib/stores/layout';
	import {_orgSearchRegex} from '$lib/stores/selection';
	import {
		_currThemeVars,
		_linkTheme2,
		_orgTypeToColorFn,
		_orgTypeToTextColorFn,
	} from '$lib/stores/theme';
	import {
		asyncUpdateTopicDetails,
		clearActiveTopic
	} from '$lib/stores/topics';
	import {getTopicLabel} from '$lib/utils/dataUtils';
	import {getWikipediaURL} from '$lib/utils/dbpedia';

	import Pill from './Pill.svelte';

	export let item = null;
	export let shouldFocusOrg = true;
	export let showAsFocused = false;

	let isDescriptionUIVisible = $_isSmallScreen;
	let isEllipsisActive = false;
	let isFocused = false;
	let isFolded = true;

	const dispatch = createEventDispatcher();

	const onMouseEnter = () => {
		if (!$_isSmallScreen) {
			isDescriptionUIVisible = true;
			shouldFocusOrg && setHero({
				id: item.id,
				isPinned: false,
				isVisible: false
			});
		}
	};
	const onMouseLeave = () => {
		if (!$_isSmallScreen) {
			isDescriptionUIVisible = false;
			shouldFocusOrg && clearHero();
		}
	};

	const toggleFolded = () => {
		isFolded = !isFolded;
		dispatch('foldingToggled');
	};

	const ellipsisDetector = node => {
		isEllipsisActive = node.offsetHeight < node.scrollHeight;
	};

	$: postCode = item.location?.postcode || '';
	$: place = item.place?.name || '';
	$: sep = postCode && place ? ' - ' : '';
	$: address = `${place}${sep}${postCode}`;
	$: topics = item.topics || [];
	$: types = _.map(
		item.types || [],
		type => ({
			color: $_orgTypeToColorFn(type),
			textColor: $_orgTypeToTextColorFn(type),
			type,
		})
	);
	$: shouldFocusOrg && (isFocused = item.id === $_hero?.org.id);
	$: highlightedTheme = {
		colorHighlightedBackground: $_currThemeVars['--colorHighlightedTextBackground'],
		colorHighlightedText: $_currThemeVars['--colorHighlightedText'],
	};

	const makeOnKeyDown = id => event => {
		if (['Enter', ' '].includes(event.key)) {
			event.preventDefault();
			asyncUpdateTopicDetails(id);
		}
	}
</script>

<div
	class='OrgDetails'
	class:highlighted={isFocused}
	on:mouseenter={onMouseEnter}
	on:mouseleave={onMouseLeave}
>

	<!-- row 1 -->

	<div class='flex between'>
		<div class='flex'>
			{#if item.url}
				<span class='name' id='title-{item.id}'>
					<HighlightedText
						regex={$_orgSearchRegex}
						string={item.name}
						theme={highlightedTheme}
					/>
				</span>
				<HyperLink
					ariaDescribedBy='title-{item.id}'
					ariaLabel='Website for {item.name}'
					href={item.url}
					target='_blank'
					theme={$_linkTheme2}
				>
					<Icon
						glyph={Link2}
						size={20}
						stroke={$_currThemeVars['--colorLink']}
					/>
				</HyperLink>
			{/if}
		</div>
		{#if isFocused || showAsFocused}
			<div class='dot' />
		{/if}
	</div>

	<Scroller>
		<div class='scrollable'>

			<!-- row 2 -->

			<div>
				{#if isDescriptionUIVisible}
					<div class='descriptionUI'>
						<CopyToClipboard
							getText={() => item.description}
							theme={$_linkTheme2}
						/>
						{#if isEllipsisActive}
							<button on:click={toggleFolded}>
								<Icon glyph={isFolded ? PlusCircle : MinusCircle} />
							</button>
						{/if}
					</div>
				{/if}

				<p
					class:folded={isFolded}
					class='description'
					use:ellipsisDetector
				>
					<HighlightedText
						regex={$_orgSearchRegex}
						string={item.description}
						theme={highlightedTheme}
					/>
				</p>
			</div>

			<!-- row 3 -->

			<div class='flex wrap'>
				{#if address !== ''}
					<div class='tag address'>
						<span>{address}</span>
					</div>
				{/if}
				{#each types as {color, textColor, type}}
					<div
						class='tag'
						style='background-color:{color};color:{textColor};'
					>
						<span>{type}</span>
					</div>
				{/each}
			</div>

			<!-- row 4 -->

			<div class='flex wrap topics'>
				{#if $_isSmallScreen}
					{#each topics as {id}}
						<div
							class='topic'
							on:click={() => asyncUpdateTopicDetails(id)}
							on:keydown={makeOnKeyDown(id)}
						>
							<Pill label={getTopicLabel(id)} />
						</div>
					{/each}
				{:else}
					{#each topics as {id}}
						<div class='topic'>
							<HyperLink
								href={getWikipediaURL(id)}
								target='_blank'
								theme={$_linkTheme2}
							>
								<div
									on:mouseenter={() => asyncUpdateTopicDetails(id)}
									on:mouseleave={clearActiveTopic}
								>
									<Pill label={getTopicLabel(id)} />
								</div>
							</HyperLink>
						</div>
					{/each}
				{/if}
			</div>

		</div>
	</Scroller>
</div>

<style>
	.OrgDetails {
		display: grid;
		gap: 0.8em;
		grid-template-rows: min-content 1fr;
		max-height: 100%;
		padding: 1em;
		overflow: hidden;
	}
	.highlighted {
		background-color: var(--colorOrgHighlighted);
	}

	.flex {
		align-items: center;
		display: flex;
		gap: 0.4rem;
		overflow-x: hidden;
	}
	.wrap {
		flex-wrap: wrap;
	}
	.between {
		justify-content: space-between;
	}

	.scrollable {
		display: grid;
		grid-template-rows: repeat(3, min-content);
		gap: 0.8em;
		overflow: auto;
	}

	/* row 1 */

	.flex {
		align-items: center;
		display: flex;
		gap: 0.4rem;
		overflow: hidden;
	}
	.wrap {
		flex-wrap: wrap;
	}

	.name {
		font-size: 1.2em;
	}

	.dot {
		-moz-border-radius: 50%;
		-webkit-border-radius: 50%;
		background: red;
		border-radius: 50%;
		height: 12px;
		margin: 0 6px;
		width: 12px;
		min-width: 12px;
	}

	/* row 2 */

	.description {
		hyphens: auto;
	}
	.description.folded {
		/* These `-webkit` properties work in Firefox and Edge and Safari 15.4. */
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		display: -webkit-box;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.descriptionUI {
		cursor: pointer;
		float: right;
		padding-left: 0.5em;
	}
	.descriptionUI > *:not(:last-child) {
		padding-bottom: 0.5em;
	}
	button {
		background: none;
		border: none;
		color: var(--colorText);
		cursor: pointer;
		display: block;
	}
	button:focus {
		outline: var(--outline);
		outline-offset: calc( -1 * var(--outlineWidth));
	}

	/* row 3 */

	.tag span {
		font-style: italic;
		padding: 0.2em 0.5em;
	}
	.address span {
		background-color: var(--colorOrgAddress);
	}

	/* row 4 */

	.topic {
		max-width: 100%;
	}
	.topic:has(:focus-visible) { /* for Pill on Chrome */
		outline: var(--outline);
		outline-offset: calc( -1 * var(--outlineWidth));
	}
</style>
