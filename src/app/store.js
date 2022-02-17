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
    ENTITY_TYPE_TECHNOLOGY_DEVELOPER,
    ALL_ENTITY_TYPES,
    ALL_TECHNOLOGY_TYPES,
    getLngLat,
    makeCompany,
    filterCompanies,
} from "@utils/companies";
import {toGeoPoints} from "@utils/geoUtils";
import {isObjNotEmpty} from "@utils/objUtils";
import {makeRows, stringify} from "@utils/stringUtils";

const initialState = {
    copy: {
        title: "UK Drone Industry Map",
        subtitle: "An interactive map showing UK drone industry technology developers, service providers and research organisations. Data provided by Glass.ai with supplemental data from Gateway to Research.",
        copyright: "Nesta (c) 2018",
    },
    companiesURL: "../data/companies.tsv",
    allCompanies: [],

    // don't start with empty selection at startup the map fits to companies bounds
    // TODO provide default bounds (UK bounds)
    entityTypes: ALL_ENTITY_TYPES,
    allEntityTypes: ALL_ENTITY_TYPES,
    areEntityTypesEditable: false,

    allTechnologyTypes: ALL_TECHNOLOGY_TYPES,
    technologyTypes: ALL_TECHNOLOGY_TYPES,
};

class DronesStore extends Store {
    constructor () {
        super(initialState);

        this.compute(
            "isTechnologyDeveloperSelected",
            ["entityTypes"],
            entityTypes => _.isIn(entityTypes, ENTITY_TYPE_TECHNOLOGY_DEVELOPER)
        );

        this.compute(
            "companies", [
                "allCompanies",
                "entityTypes",
                "isTechnologyDeveloperSelected",
                "technologyTypes"
            ], (
                allCompanies,
                entityTypes,
                isTechnologyDeveloperSelected,
                technologyTypes
            ) =>
                filterCompanies(
                    allCompanies,
                    entityTypes,
                    isTechnologyDeveloperSelected,
                    technologyTypes
                )
        );

        // this.on("state", ({changed, current, previous}) => {
        //     console.log("DronesStore", changed, current, previous);
        // });

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
            const {allTechnologyTypes} = this.get();

            this.set({
                entityTypes: [],
                technologyTypes: allTechnologyTypes
            });
        });

        this.on("entityType:selectAll", () => {
            const {allEntityTypes, allTechnologyTypes} = this.get();

            this.set({
                entityTypes: allEntityTypes,
                technologyTypes: allTechnologyTypes
            });
        });

        /* technology types */

        this.on("technologyType:toggle", technologyType => {
            const {technologyTypes: currentTechnologyTypes} = this.get();
            const technologyTypes = toggleItem(currentTechnologyTypes, technologyType);

            this.set({technologyTypes});
        });

        this.on("technologyType:deselectAll", () => {
            this.set({technologyTypes: []});
        });

        this.on("technologyType:selectAll", () => {
            const {allTechnologyTypes} = this.get();

            this.set({technologyTypes: allTechnologyTypes});
        });
    }

    fetch () {
        const {companiesURL} = this.get();

        if (Modernizr.fetch) {
            d3.tsv(companiesURL, makeCompany).then(allCompanies => {
                this.set({allCompanies});
            });
        } else {
            // IE...
            d3.tsv_request(companiesURL, (error, allRawCompanies) => {
                if (error) throw error;

                this.set({allCompanies: _.map(allRawCompanies, makeCompany)});
            });
        }
    }

    debug () {
        this.debugSameLocation();
        this.debugEmptyNames();
    }

    debugSameLocation () {
        const {allCompanies} = this.get();

        const makeWithSameLocation = _.pipe(
            _.groupBy(_.pipe(
                getLngLat,
                joinWithDash
            )),
            _.skipIf(hasIterableLength1)
        );
        const withSameLocation = makeWithSameLocation(allCompanies);

        if (isObjNotEmpty(withSameLocation)) {
            const loggable = _.mapValuesWith(
                _.mapWith(
                    _.pickKeys([
                        "Longitude",
                        "Latitude",
                        "Name",
                        "Link",
                        "UK postcode"
                    ])
                )
            );
            console.log("-- !!! -- withSameLocation", stringify(loggable(withSameLocation)));
        }
    }

    debugEmptyNames () {
        const {allCompanies} = this.get();

        const withEmptyName = _.filter(allCompanies, _.pipe(
            _.getKey("Name"),
            isIterableEmpty
        ));

        if (isIterableNotEmpty(withEmptyName)) {
            console.log("-- !!! -- withEmptyName", withEmptyName);
        }
    }
}

export default DronesStore;
