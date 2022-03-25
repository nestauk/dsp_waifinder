import { Store } from "svelte/store.js";
import _ from "lamb";

import * as d3 from "@vendor/d3";

import {
	joinWithDash,
	toggleItem
} from "@utils/arrayUtils";
import {
	hasIterableLength1,
	isIterableEmpty,
	isIterableNotEmpty
} from "@utils/iterableUtils";
import {
	ENTITY_TYPE_COMPANY,
	ALL_ENTITY_TYPES,
	SECTORS,
	getLngLat,
	parseDatapoint,
	filterCompanies,
} from "@utils/companies";
import {isObjNotEmpty} from "@utils/objUtils";
import {stringify} from "@utils/stringUtils";

const initialState = {
	copy: {
		title: "UK AI Map",
		subtitle: "An interactive map showing UK AI industry entities. Data provided by Glass.ai with supplemental data from Gateway to Research and Crunchbase.",
		copyright: "Nesta (c) 2022",
	},
	dataURL: "../data/entities.tsv",
	allItems: [],

	// don't start with empty selection at startup the map fits to companies bounds
	// TODO provide default bounds (UK bounds)
	entityTypes: ALL_ENTITY_TYPES,
	allEntityTypes: ALL_ENTITY_TYPES,
	areEntityTypesEditable: false,

	allSectors: SECTORS,
	sectors: SECTORS,
};

class AppStore extends Store {
	constructor () {
		super(initialState);

		this.compute(
			"isCompanySelected",
			["entityTypes"],
			entityTypes => _.isIn(entityTypes, ENTITY_TYPE_COMPANY)
		);

		this.compute(
			"companies", [
				"allItems",
				"entityTypes",
				"isCompanySelected",
				"sectors"
			], (
				allItems,
				entityTypes,
				isCompanySelected,
				sectors
			) =>
				filterCompanies(
					allItems,
					entityTypes,
					isCompanySelected,
					sectors
				)
		);

		this.setEvents();
		this.fetch();
	}

	setEvents () {
		/* entity types */

		this.on("entityType:enableEditing", entityType => {
			this.set({areEntityTypesEditable: true});
		});

		this.on("entityType:toggle", entityType => {
			const {entityTypes: currentEntityTypes} = this.get();
			const entityTypes = toggleItem(currentEntityTypes, entityType);

			this.set({entityTypes});
		});

		this.on("entityType:deselectAll", () => {
			const {allSectors} = this.get();

			this.set({
				entityTypes: [],
				sectors: allSectors
			});
		});

		this.on("entityType:selectAll", () => {
			const {allEntityTypes, allSectors} = this.get();

			this.set({
				entityTypes: allEntityTypes,
				sectors: allSectors
			});
		});

		/* sectors */

		this.on("sector:toggle", sector => {
			const {sectors: currentSectors} = this.get();
			const sectors = toggleItem(currentSectors, sector);

			this.set({sectors});
		});

		this.on("sector:deselectAll", () => {
			this.set({sectors: []});
		});

		this.on("sector:selectAll", () => {
			const {allSectors} = this.get();

			this.set({sectors: allSectors});
		});
	}

	fetch () {
		const {dataURL} = this.get();

		if (Modernizr.fetch) {
			d3.tsv(dataURL, parseDatapoint).then(allItems => {
				this.set({allItems});
			});
		} else {
			// IE...
			d3.tsv_request(dataURL, (error, allRawCompanies) => {
				if (error) throw error;

				this.set({allItems: _.map(allRawCompanies, parseDatapoint)});
			});
		}
	}

	debug () {
		this.debugSameLocation();
		this.debugEmptyNames();
	}

	debugSameLocation () {
		const {allItems} = this.get();

		const makeWithSameLocation = _.pipe(
			_.groupBy(_.pipe(
				getLngLat,
				joinWithDash
			)),
			_.skipIf(hasIterableLength1)
		);
		const withSameLocation = makeWithSameLocation(allItems);

		if (isObjNotEmpty(withSameLocation)) {
			const loggable = _.mapValuesWith(
				_.mapWith(
					_.pickKeys([
						"Longitude",
						"Latitude",
						"Name",
						"Link",
						"UK postcode" // FIXME seems unneeded
					])
				)
			);
			console.log("-- !!! -- withSameLocation", stringify(loggable(withSameLocation)));
		}
	}

	debugEmptyNames () {
		const {allItems} = this.get();

		const withEmptyName = _.filter(allItems, _.pipe(
			_.getKey("Name"),
			isIterableEmpty
		));

		if (isIterableNotEmpty(withEmptyName)) {
			console.log("-- !!! -- withEmptyName", withEmptyName);
		}
	}
}

export default AppStore;
