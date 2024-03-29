<script>
	import { onMount, tick } from 'svelte';

	// props
	export let items;
	export let height = '100%';
	export let itemHeight;

	// read-only, but visible to consumers via bind:start
	export let start = 0;
	export let end = 0;

	// local state
	let height_map = [];
	let rows;
	let viewport;
	let contents;
	let viewportHeight = 0;
	let visible;
	let mounted;

	let top = 0;
	let bottom = 0;
	let average_height;

	$: visible = items.slice(start, end).map((data, i) => {
		return { index: i + start, data };
	});

	async function refresh (newItems, viewport_height, item_height) {
		if (newItems.length < start) {
			viewport.scrollTop = 0;
		}

		const {scrollTop} = viewport;

		await tick(); // wait until the DOM is up to date

		let content_height = top - scrollTop;
		let i = start;

		while (content_height < viewport_height && i < newItems.length) {
			let row = rows[i - start];

			if (!row) {
				end = i + 1;
				// eslint-disable-next-line no-await-in-loop
				await tick(); // render the newly visible row
				row = rows[i - start];
			}

			// eslint-disable-next-line no-multi-assign
			const row_height = height_map[i] = item_height || row.offsetHeight;
			content_height += row_height;
			i += 1;
		}

		end = i;

		const remaining = newItems.length - end;
		average_height = (top + content_height) / end;

		bottom = remaining * average_height;
		height_map.length = newItems.length;

	}

	async function handle_scroll () {
		const { scrollTop } = viewport;

		const old_start = start;

		for (let v = 0; v < rows.length; v += 1) {
			height_map[start + v] = itemHeight || rows[v].offsetHeight;
		}

		let i = 0;
		let y = 0;

		while (i < items.length) {
			const row_height = height_map[i] || average_height;
			if (y + row_height > scrollTop) {
				start = i;
				top = y;

				break;
			}

			y += row_height;
			i += 1;
		}

		while (i < items.length) {
			y += height_map[i] || average_height;
			i += 1;

			if (y > scrollTop + viewportHeight) {
				break;
			}
		}

		end = i;

		const remaining = items.length - end;
		average_height = y / end;

		while (i < items.length) {
			height_map[i++] = average_height;
		}
		bottom = remaining * average_height;

		// prevent jumping if we scrolled up into unknown territory
		if (start < old_start) {
			await tick();

			let expected_height = 0;
			let actual_height = 0;

			for (let j = start; j < old_start; j +=1) {
				if (rows[j - start]) {
					expected_height += height_map[j];
					actual_height += itemHeight || rows[j - start].offsetHeight;
				}
			}

			const d = actual_height - expected_height;
			viewport.scrollTo(0, scrollTop + d);
		}

		// TODO if we overestimated the space these
		// rows would occupy we may need to add some
		// more. maybe we can just call handle_scroll again?
	}
	export const refreshAction = () => refresh(items, viewportHeight, itemHeight);
	export const scrollTo = item => {
		let y = 0;
		for (let i = 0; i < items.length; i += 1) {
			if (i === item) {
				viewport.scrollTo(0, y);
				break;
			}

			y += height_map[i] || average_height;
		}
	};

	// trigger initial refresh
	onMount(() => {
		rows = contents.getElementsByTagName('svelte-virtual-list-row');
		mounted = true;
	});

	// whenever `items` changes, invalidate the current heightmap
	$: mounted && refresh(items, viewportHeight, itemHeight);
</script>

<style>
	svelte-virtual-list-viewport {
		position: relative;
		overflow-y: auto;
		-webkit-overflow-scrolling:touch;
		display: block;
	}

	svelte-virtual-list-contents, svelte-virtual-list-row {
		display: block;
	}

	svelte-virtual-list-row {
		overflow: hidden;
	}
</style>

<svelte-virtual-list-viewport
	bind:this={viewport}
	bind:offsetHeight={viewportHeight}
	on:scroll={handle_scroll}
	style='height: {height};'
>
	<svelte-virtual-list-contents
		bind:this={contents}
		style='padding-top: {top}px; padding-bottom: {bottom}px;'
	>
		{#each visible as row (row.index)}
			<svelte-virtual-list-row>
				<slot item={row.data}>Missing template</slot>
			</svelte-virtual-list-row>
		{/each}
	</svelte-virtual-list-contents>
</svelte-virtual-list-viewport>
