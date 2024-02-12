<main class='_layout'>
	<section>
		<h1>Feedback</h1>
		<slot />
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
		max-width: 900px;
		overflow-y: auto;
		padding: 2rem;
		width: 100%;
	}

	h1 {
		font-weight: bold;
		grid-area: header;
	}
</style>
