<script>
	import {onMount} from 'svelte';


	const { page } = stores();

	// FIXME rework eventType logic
	let eventType = 'PAGE_READY';
	onMount(async () => {

		const updateRoute = () => {
			routeMachine.send(eventType);
			eventType = 'ROUTE_CHANGED';

			const urlParams = new URL(document.location.toString()).searchParams;
			const params = _.fromPairs(Array.from(urlParams.entries()));
			const query = params.q && rison.decode(params.q);
			processSelection(routeMachine, query);
		};

		addEventListener('popstate', updateRoute);
		const unsubscribe = page.subscribe(updateRoute);

		return () => {
			removeEventListener('popstate', updateRoute);
			unsubscribe?.();
		};
	});
</script>
