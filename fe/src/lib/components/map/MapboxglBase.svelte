<script>
	import geoViewport from '@mapbox/geo-viewport';
	import {setupResizeObserver} from '@svizzle/ui';
	import mapboxgl from 'mapbox-gl';
	import {beforeUpdate, onMount} from 'svelte';

	import {_bbox_WS_EN, _bbox_WSEN, _zoom} from '$lib/stores/selection';
	import {clearHero} from '$lib/stores/interaction';

	import {
		FIT_PADDING,
		MAPBOXGL_MAX_ZOOM,
		MAPBOXGL_MIN_ZOOM,
		MAPBOXGL_TILE_SIZE
	} from './consts';
    import { isIn } from 'lamb';

	export let accessToken = null;
	export let CustomLayers = null;
	export let getLonLat;
	export let items = [];
	export let styleURL;
	export let withScaleControl = true;
	export let withZoomControl = true;
	export let bounds;
	export let isMoveEnabled = true;

	/* props */

	let doesMapExist;
	let height = 0;
	let isInteractive = true; // has to be true initially
	let map;
	let mapcontainer;
	let projectFn;
	let width = 0;

	/* bbox */

	$: viewport = geoViewport.viewport(
		$_bbox_WSEN,
		[width, height],
		MAPBOXGL_MIN_ZOOM,
		MAPBOXGL_MAX_ZOOM,
		MAPBOXGL_TILE_SIZE
	);

	/* layers */

	let customLayers;

	$: projectFn && customLayers && customLayers.$set({projectFn});
	$: getLonLat && height && items && width && customLayers &&
		customLayers.$set({
			getLonLat,
			height,
			items,
			width,
		});

	/* controls */
	const addAttributionControl = () => {
		map.addControl(
			new mapboxgl.AttributionControl({
				compact: true
			})
		)
	};

	const addScaleControl = () => {
		map.addControl(
			new mapboxgl.ScaleControl({
				maxWidth: 80,
				unit: 'metric'
			}),
			'bottom-right'
		);
	};

	const zoomControl = new mapboxgl.NavigationControl({showCompass: false});

	const addZoomControl = () => {
		map?.addControl(zoomControl, 'bottom-left');
	};

	/*
	const removeZoomControl = () => {
		map?.removeControl(zoomControl);
	};
	*/

	const addControls = () => {
		addAttributionControl();

		if (withScaleControl) {
			addScaleControl();
		}

		if (withZoomControl) {
			addZoomControl();
		}
	};

	/* bbox */

	const fitToBbox = () => {
		map.fitBounds($_bbox_WSEN, {
			linear: true,
			padding: {
				bottom: FIT_PADDING,
				left: FIT_PADDING,
				right: FIT_PADDING,
				top: FIT_PADDING,
			}
		});
	};

	/* custom layers */

	const addCustomLayers = () => {
		if (CustomLayers) {
			const canvasContainer = map.getCanvasContainer();

			customLayers = new CustomLayers({
				target: canvasContainer,
				props: {
					getLonLat,
					height,
					items,
					map,
					projectFn: x => map.project(x),
					width,
				}
			});
		}
	};

	/* events */

	const updateBbox = () => {
		if (map) {
			const bounds = map.getBounds().toArray();
			_bbox_WS_EN.set(bounds);
		}
	}

	const updateProjection = () => {
		if (map) {
			projectFn = x => map.project(x);
		}
	};
	const updateZoom = () => {
		if (map) {
			const zoom = map.getZoom();
			_zoom.set(zoom);
		}
	}

	const setMapEvents = () => {
		map.on('move', () => {
			updateProjection();
			updateBbox();
		});
		map.on('zoom', () => {
			updateZoom();
		});
	}

	const enableMoving = () => {
		map?.dragPan.enable();
		map?.scrollZoom.enable();
		map?.touchZoomRotate.enable();
		map?.doubleClickZoom.enable();
	}
	const disableMoving = () => {
		map?.dragPan.disable();
		map?.scrollZoom.disable();
		map?.touchZoomRotate.disable();
		map?.doubleClickZoom.disable();
	}

	const {
		_writable: _size,
		resizeObserver
	} = setupResizeObserver();

	/* methods */

	// FIXME TBD: bind instead?
	const setGeometry = () => {
		if (!mapcontainer) {
			return
		}

		const elementGeometry = getComputedStyle(mapcontainer);
		width = parseFloat(elementGeometry.width);
		height = parseFloat(elementGeometry.height);
	};

	const createMap = () => {
		const {center, zoom} = viewport;

		mapboxgl.accessToken = accessToken;

		map = new mapboxgl.Map({
			container: mapcontainer,
			center,
			// projection: 'equalEarth',
			renderWorldCopies: false,
			style: styleURL,
			zoom,

			// interactions
			attributionControl: false, // we add this later to have it compact
			doubleClickZoom: isMoveEnabled && isInteractive,
			dragPan: isMoveEnabled && isInteractive,
			dragRotate: false,
			pitchWithRotate: false, // don't render dots in perspective
			scrollZoom: isMoveEnabled && isInteractive,
			touchPitch: false,
			touchZoomRotate: isMoveEnabled && isInteractive,
		})
		.on('load', () => {
			addCustomLayers();
			setMapEvents();
			fitToBbox();

			setGeometry(); // ipad FIXME: initial svg is 100x100
		})
		.on('click', () => {
			clearHero();
		});

		map.touchZoomRotate.disableRotation();

		// controls

		addControls();
	};

	/* lifecycle */

	beforeUpdate(() => {
		if (viewport && height > 0 && !doesMapExist) {
			doesMapExist = true;
			createMap();
		}
	})

	onMount(() => {
		setGeometry();
	});

	// eslint-disable-next-line no-unused-expressions, no-sequences
	$: $_size, map?.resize()

	$: bounds && map?.fitBounds(bounds);
	$: isMoveEnabled && withZoomControl && isInteractive
		? map?.addControl(zoomControl, 'bottom-left')
		: map?.removeControl(zoomControl);
	$: isMoveEnabled && isInteractive
		? enableMoving()
		: disableMoving();
</script>

<svelte:head>
	<link
		href='/css/mapbox-gl.css'
		rel='stylesheet'
		type='text/css'
	>
</svelte:head>

<svelte:window on:resize={setGeometry} />

<div class='MapboxglBase'>
	<div
		bind:this={mapcontainer}
		class='mapcontainer'
		use:resizeObserver
	></div>
</div>

<style>
	.MapboxglBase {
		height: 100%;
		position: relative;
		width: 100%;
	}

	.mapcontainer {
		height: 100%;
		width: 100%;
	}
</style>
