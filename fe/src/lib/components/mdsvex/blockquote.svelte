<blockquote {...$$props}>
	<slot/>
</blockquote>

<style>
	blockquote {
		background-color: var(--colorTagBlockquoteBackground);
		border-left: 4px solid var(--colorTagBlockquoteLeftBorder);
		padding: 0.5rem 1rem;
	}
</style>
