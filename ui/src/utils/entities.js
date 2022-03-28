import _ from "lamb";

import {areSomeTrue} from "./arrayUtils";
import {applyFnMap2} from "./objUtils";
import {trim} from "./stringUtils";
import {Null} from "./types";
import {sanitizeURLProtocol} from "./urlUtils";

export const ENTITY_TYPE_COMPANY = "Company";

export const ALL_ENTITY_TYPES = [
	ENTITY_TYPE_COMPANY,
	"Funder",
	"Incubator / accelerator",
	"University / RTO",
];

// FIXME to be updated / implemented
export const SECTORS = [
	"Sector 1",
	"Sector 2",
	"Sector 3",
	"Sector 4",
	"Sector 5",
	"Sector 6",
	"Sector 7",
	"Sector 8",
	"Sector 9",
	"Sector 10",
	"Sector 11",
];

/* CSV */

const isBadString = _.anyOf(_.is("FAILED"), _.is(""));

const processCoordValue = _.condition(
	_.isType("String"),
	_.pipe(trim, _.condition(isBadString, Null, Number)),
	Null
);

export const parseDatapoint = applyFnMap2({
	// Organisation details
	"Name": _.identity,
	"Link": sanitizeURLProtocol,
	"Latitude": processCoordValue,
	"Longitude": processCoordValue,

	// entity types
	[ALL_ENTITY_TYPES[0]]: Boolean,
	[ALL_ENTITY_TYPES[1]]: Boolean,
	[ALL_ENTITY_TYPES[2]]: Boolean,
	[ALL_ENTITY_TYPES[3]]: Boolean,

	// sectors
	[SECTORS[0]]: Boolean,
	[SECTORS[1]]: Boolean,
	[SECTORS[2]]: Boolean,
	[SECTORS[3]]: Boolean,
	[SECTORS[4]]: Boolean,
	[SECTORS[5]]: Boolean,
	[SECTORS[6]]: Boolean,
	[SECTORS[7]]: Boolean,
	[SECTORS[8]]: Boolean,
	[SECTORS[9]]: Boolean,
	[SECTORS[10]]: Boolean
});

/* property getters */

export const getLngLat = _.collect(_.getKey("Longitude"), _.getKey("Latitude"));
export const getID = _.getKey("Name");
export const getLink = _.getKey("Link");

// entity types [] -> obj -> entity types getters
const makePropertiesGetters = _.pipe(
	_.mapWith(_.getKey),
	_.apply(_.collect)
);

// const isNotCompany = _.not(_.is(ENTITY_TYPE_COMPANY));

export const filterCompanies = (
	allItems,
	entityTypes,
	// isCompanySelected, // FIXME unused for now
	// sectors // FIXME for now we don't use sectors
) => {
	/* FIXME for now we don't use sectors
	const nonCompanyEntityTypes = _.filter(
		entityTypes,
		isNotCompany
	);

	const areSomeSectorsTrue = _.pipe(
		makePropertiesGetters(sectors),
		areSomeTrue
	);

	const condition = isCompanySelected
		? _.anyOf(
			_.pipe(
				makePropertiesGetters(nonCompanyEntityTypes),
				areSomeTrue
			),
			// areSomeSectorsTrue // FIXME for now we don't use sectors
		)
		: _.pipe(
			makePropertiesGetters(entityTypes),
			areSomeTrue
		);
	*/

	const condition = _.pipe(
	  makePropertiesGetters(entityTypes),
	  areSomeTrue
	);

	return _.filter(allItems, condition)
}
