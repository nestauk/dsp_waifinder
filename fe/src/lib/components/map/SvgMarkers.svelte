<script>
	import {noop} from '@svizzle/utils';
	import {arc, pie} from 'd3-shape';
	import * as _ from 'lamb';

	import {
		_hero,
		_isHeroInBounds,
		clearHero,
		setHero
	} from '$lib/stores/interaction';
	import {_isSmallScreen} from '$lib/stores/layout';
	import {getClusterExpansionZoom, getClusterLeaves} from '$lib/stores/data';
	import {_orgTypeToColorFn} from '$lib/stores/theme';

	/* props */

	export let getLonLat = _.identity;
	export let items = [];
	export let map;
	export let projectFn = _.identity;

	/* groups */

	$: groups = _.partition(items, _.getPath('properties.cluster'));

	/* markers */

	const onMarkerClick = id => {
		// if incoming id === existing id and already pinned, it should unpin
		if (id === $_hero?.org.id && $_hero.isPinned) {
			clearHero();
		} else {
			setHero({
				id,
				isPinned: true,
				isVisible: true
			});
		}
	};
	const getMarkerPie = pie().value(_.always(1));
	const getMarkerPieSector = arc().innerRadius(0).outerRadius(5);

	$: getMarkerPieSectors = _.pipe([
		getMarkerPie,
		_.mapWith(d => {
			const orgType = d.data;
			const fill = $_orgTypeToColorFn(orgType);

			return {
				...d,
				arc: getMarkerPieSector(d),
				fill,
			}
		})
	]);
	$: makeUnprojectedMarker = item => ({
		...item,
		sectors: getMarkerPieSectors(item.properties.types)
	});
	$: unprojectedMarkers = _.map(groups[1], makeUnprojectedMarker) || [];
	$: projectMarker = item => ({
		...item,
		...projectFn(getLonLat(item.properties)),
	});
	$: markers = _.map(unprojectedMarkers, projectMarker) || [];

	/* clusters */

	const onClusterClick = (coordinates, id) => {
		if (map) {
			map.flyTo({
				center: coordinates,
				zoom: getClusterExpansionZoom(id),
			});
		}
	};
	const clusterOuterRadius = 12;
	const clusterFontSize = 15;
	const clusterBkgStrokeWidth = clusterFontSize / 3;
	const clusterDy = clusterOuterRadius + 4;
	const getClusterPie = pie().value(_.last);
	const getClusterSector =
		arc()
		.innerRadius(0)
		.outerRadius(clusterOuterRadius);

	$: getClusterSectors = _.pipe([
		getClusterPie,
		_.mapWith(d => {
			const [orgType] = d.data; // [orgType, count]
			const fill = $_orgTypeToColorFn(orgType);

			return {
				...d,
				arc: getClusterSector(d),
				fill,
			}
		})
	]);
	const getLeavesTypesCount = _.pipe([
		_.flatMapWith(_.getPath('properties.types')),
		_.countBy(_.identity),
		_.pairs,
		_.sortWith([_.head]),
	]);
	$: makeUnprojectedCluster = cluster => {
		const leaves = getClusterLeaves(cluster.id);
		const typesCount = getLeavesTypesCount(leaves);

		return {
			...cluster,
			...projectFn(cluster.geometry.coordinates),
			sectors: getClusterSectors(typesCount)
		}
	};
	$: unprojectedClusters = _.map(groups[0], makeUnprojectedCluster);
	$: projectCluster = cluster => ({
		...cluster,
		...projectFn(cluster.geometry.coordinates),
	});
	$: clusters = _.map(unprojectedClusters, projectCluster);

	/* hero */

	$: hero =
		$_hero?.org && projectFn && getLonLat &&
		projectFn(getLonLat($_hero?.org));
	$: r = $_isSmallScreen ? 5 : 3;
	$: onMouseEnterMarker = $_isSmallScreen
		? noop
		: id => !$_hero?.isPinned && setHero({
			id,
			isPinned: false,
			isVisible: true
		});
	$: onMouseLeaveMarker = $_isSmallScreen
		? noop
		: () => !$_hero?.isPinned && clearHero();
	$: !$_isHeroInBounds && clearHero();
</script>

<svelte:options namespace='svg' />

<g class='SvgMarkers'>

	<!-- markers -->

	{#each markers as {properties: {id}, sectors, x, y}}
		<g
			class='marker'
			on:click|stopPropagation={() => onMarkerClick(id)}
			on:dblclick|stopPropagation
			on:mouseenter={() => onMouseEnterMarker(id)}
			on:mouseleave={onMouseLeaveMarker}
			transform='translate({x},{y})'
		>
			{#each sectors as {arc, fill}}
				<path
					{fill}
					d={arc}
				/>
			{/each}
		</g>
	{/each}

	<!-- clusters -->

	{#each clusters as {geometry: {coordinates}, id, properties, sectors, x, y}}
		<g
			class='cluster'
			on:click|stopPropagation={() => onClusterClick(coordinates, id)}
			on:dblclick|stopPropagation
			transform='translate({x},{y})'
		>
			{#each sectors as {arc, fill}}
				<path
					{fill}
					d={arc}
				/>
			{/each}
			<text
				class='bkg'
				dy={clusterDy}
				font-size={clusterFontSize}
				stroke-width={clusterBkgStrokeWidth}
			>{properties.point_count}</text>
			<text
				dy={clusterDy}
				font-size={clusterFontSize}
			>{properties.point_count}</text>
		</g>
	{/each}

	<!-- hero -->

	{#if hero}
		<circle
			class='marker focused'
			cx={hero.x}
			cy={hero.y}
			r=6
		/>
	{/if}
</g>

<style>
	.marker, .cluster {
		cursor: pointer;
	}
	.cluster text {
		dominant-baseline: hanging;
		fill: var(--colorMain);
		stroke: none;
		text-anchor: middle;
	}
	.cluster text.bkg {
		fill: none;
		stroke: var(--colorClusterTextBkgStroke);
	}

	.focused {
		fill: red;
		pointer-events: none;
	}
</style>
