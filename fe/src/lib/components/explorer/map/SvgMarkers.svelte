<script>
	import {isIterableLongerThan1, noop} from '@svizzle/utils';
	import {arc, pie} from 'd3-shape';
	import * as _ from 'lamb';
	import {getContext} from 'svelte';

	import {getClusterExpansionZoom, getClusterLeaves} from '$lib/stores/data';
	import {
		_hero,
		_isHeroInBounds,
		clearHero,
		setHero
	} from '$lib/stores/interaction';
	import {_isSmallScreen} from '$lib/stores/layout';
	import {_orgTypeToColorFn} from '$lib/stores/theme';
	import {radToDeg} from '$lib/utils/svizzle/geometry';

	/* props */

	export let getLonLat = _.identity;
	export let items = [];
	export let map;

	/* context */

	const {_projectFn} = getContext('mapBox');

	/* groups */

	const makeGroups = _.pipe([
		_.partitionWith(_.getPath('properties.cluster')),
		_.collect([
			_.head,
			_.pipe([
				_.last,
				_.groupBy(x => x.geometry.coordinates.toString()),
				_.pairs,
				_.partitionWith(_.pipe([_.last, isIterableLongerThan1])),
				_.collect([
					_.pipe([
						_.head,
						_.mapWith(([, features]) => ({
							coordinates: features[0].geometry.coordinates,
							count: features.length,
							features,
						}))
					]),
					_.pipe([_.last, _.mapWith(_.getPath('1.0'))])
				])
			])
		]),
		([cluster, [multi, single]]) => [cluster, multi, single]
	]);

	$: groups = makeGroups(items);

	/* multi */

	const multiCenterRadius = 4;
	const rayHeight = 6;
	$: rayWidth = $_isSmallScreen ? 15 : 12;
	$: getRays = ({count, features}) => {
		const stepAngle = 2 * Math.PI / count;
		const radius = 0.5 * rayHeight / Math.sin(Math.PI / count);
		const rays = _.map(features, ({properties}, index) => {
			const {types} = properties;
			const originAngle = index * stepAngle;
			const angleDeg = radToDeg(originAngle + stepAngle / 2);
			const X = radius * Math.cos(originAngle);
			const Y = radius * Math.sin(originAngle);
			const typeRectWidth = rayWidth / types.length;

			return {
				angleDeg,
				properties,
				typeRects: _.map(types, (orgType, idx) => ({
					dx: idx * typeRectWidth,
					fill: $_orgTypeToColorFn(orgType),
					width: typeRectWidth,
				})),
				X,
				Y,
			}
		});

		return rays;
	};
	$: unprojectedMultis = _.map(groups[1], item => ({
		...item,
		rays: getRays(item)
	}));
	$: projectMulti = item => ({
		...item,
		...$_projectFn(item.coordinates),
	});
	$: multiMarkers = _.map(unprojectedMultis, projectMulti);

	/* single */

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
	$: unprojectedMarkers = _.map(groups[2], makeUnprojectedMarker);
	$: projectMarker = item => ({
		...item,
		...$_projectFn(getLonLat(item.properties)),
	});
	$: markers = _.map(unprojectedMarkers, projectMarker);

	/* cluster */

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
			...$_projectFn(cluster.geometry.coordinates),
			sectors: getClusterSectors(typesCount)
		}
	};
	$: unprojectedClusters = _.map(groups[0], makeUnprojectedCluster);
	$: projectCluster = cluster => ({
		...cluster,
		...$_projectFn(cluster.geometry.coordinates),
	});
	$: clusters = _.map(unprojectedClusters, projectCluster);

	/* hero */

	const heroRadius = 6;
	$: hero =
		$_hero?.org && $_projectFn && getLonLat &&
		$_projectFn(getLonLat($_hero?.org));
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

	<!-- multi-markers -->

	{#each multiMarkers as {rays, x, y}}
		<g
			class='multiMarker'
			transform='translate({x},{y})'
		>
			{#each rays as {angleDeg, properties: {id}, typeRects, X, Y}}
				<g
					class='ray'
					on:click|stopPropagation={() => onMarkerClick(id)}
					on:dblclick|stopPropagation
					on:keydown|stopPropagation={null}
					on:mouseenter={() => onMouseEnterMarker(id)}
					on:mouseleave={onMouseLeaveMarker}
					transform='translate({X},{Y}) rotate({angleDeg})'
				>
					{#each typeRects as {dx, fill, width}}
						<rect
							{fill}
							{width}
							height={rayHeight}
							x={dx}
						/>
					{/each}
					{#if $_hero && id === $_hero.org.id}
						<rect
							class='hero'
							height={rayHeight}
							width={rayWidth}
						/>
					{/if}
				</g>
			{/each}
			<circle
				class='center'
				r={multiCenterRadius}
			/>
		</g>
	{/each}

	<!-- markers -->

	{#each markers as {properties: {id}, sectors, x, y}}
		<g
			class='marker'
			on:click|stopPropagation={() => onMarkerClick(id)}
			on:dblclick|stopPropagation
			on:keydown|stopPropagation={null}
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
			on:keydown|stopPropagation={null}
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
			r={heroRadius}
		/>
	{/if}
</g>

<style>
	.cluster, .marker, .ray {
		cursor: pointer;
		pointer-events: fill;
	}
	.cluster text {
		dominant-baseline: hanging;
		fill: var(--colorText);
		stroke: none;
		text-anchor: middle;
	}
	.cluster text.bkg {
		fill: none;
		stroke: var(--colorClusterTextBkgStroke);
	}

	.focused {
		fill: var(--colorMarkerFocused);
		pointer-events: none;
	}

	.multiMarker .center {
		fill: var(--colorClusterTextBkgStroke);
		stroke: var(--colorMultiMarkerCenter);
	}
	.ray .hero {
		fill: var(--colorMarkerFocused);
	}
</style>
