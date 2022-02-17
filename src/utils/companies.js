import _ from "lamb";

import {areAllTrue, areSomeTrue} from "./arrayUtils";
import {isIterableNotEmpty} from "./iterableUtils";
import {applyFnMap2} from "./objUtils";
import {trim} from "./stringUtils";
import {Null} from "./types";
import {sanitizeURLProtocol} from "./urlUtils";

export const ENTITY_TYPE_TECHNOLOGY_DEVELOPER = "Technology developer";

export const ALL_ENTITY_TYPES = [
    ENTITY_TYPE_TECHNOLOGY_DEVELOPER,
    "Drone-powered service provider",
    "Service provider to the drone industry",
    "Academic / research institution",
    "Other drone-related entity"
];

export const ALL_TECHNOLOGY_TYPES = [
    "Platforms",
    "UTM",
    "Comms",
    "Subsystems",
    "Navigation & autonomy",
    "Drone-data processing",
    "Systems integration / consultancy",
    "Delivery drones",
    "People carrying drones",
    "Counter-drone",
    "Other drone-related technologies"
];

/* CSV */

const isBadString = _.anyOf(_.is("FAILED"), _.is(""));

const processCoordValue = _.condition(
    _.isType("String"),
    _.pipe(trim, _.condition(isBadString, Null, Number)),
    Null
);

export const makeCompany = applyFnMap2({
    // Organisation details
    "Name": _.identity,
    "Project / product name": _.identity,
    "Link": sanitizeURLProtocol,
    "Latitude": processCoordValue,
    "Longitude": processCoordValue,

    // entity types
    [ENTITY_TYPE_TECHNOLOGY_DEVELOPER]: Boolean,
    "Drone-powered service provider": Boolean,
    "Service provider to the drone industry": Boolean,
    "Academic / research institution": Boolean,
    "Other drone-related entity": Boolean,

    // technology types
    "Platforms": Boolean,
    "UTM": Boolean,
    "Comms": Boolean,
    "Subsystems": Boolean,
    "Navigation & autonomy": Boolean,
    "Drone-data processing": Boolean,
    "Systems integration / consultancy": Boolean,
    "Delivery drones": Boolean,
    "People carrying drones": Boolean,
    "Counter-drone": Boolean,
    "Other drone-related technologies": Boolean
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

const isNotTechDev = _.not(_.is(ENTITY_TYPE_TECHNOLOGY_DEVELOPER));

export const filterCompanies = (
    allCompanies,
    entityTypes,
    isTechnologyDeveloperSelected,
    technologyTypes
) => {
    const nonTechDevEntityTypes = _.filter(
        entityTypes,
        isNotTechDev
    );
    const areSomeTechnologyTypesTrue = _.pipe(
        makePropertiesGetters(technologyTypes),
        areSomeTrue
    );

    const condition = isTechnologyDeveloperSelected
        ? _.anyOf(
            _.pipe(
                makePropertiesGetters(nonTechDevEntityTypes),
                areSomeTrue
            ),
            areSomeTechnologyTypesTrue
        )
        : _.pipe(
            makePropertiesGetters(entityTypes),
            areSomeTrue
        );

    return _.filter(allCompanies, condition)
}

// export const makeCompany3 = applyFnGroups([
//     ["Organisation details", [
//         ["Source", _.identity],
//         ["Name", _.identity],
//         ["Project / product name", _.identity],
//         ["Link", _.identity],
//         ["Type (Large Co, SME, Academic, Research and Technology Organisation)", _.identity],
//         ["Global HQ Inc Postcode where possible. ", _.identity],
//         ["Postcode (extra)", _.identity],
//         ["UK postcode", _.identity],
//         ["Latitude", processCoordValue],
//         ["Longitude", processCoordValue],
//         ["Short description", _.identity],
//         ["Industry (find a way to keep these uniform and not too similar to each other)", _.identity],
//         ["Normalised Industry", _.identity],
//         ["End user industry", _.identity],
//         ["R&D / At market", _.identity],
//         ["USP", _.identity],
//         ["To review based on changed to criteria start of march.", _.identity],
//     ]],
//     ["Entity type", [
//         ["Technology Developer", Boolean],
//         ["Drone-powered services", Boolean],
//         ["Services to drone operators / industry", Boolean],
//         ["Academic / Research Institution", Boolean],
//         ["Other drone-related entity", Boolean],
//     ]],
//     ["Drone-powered Serivce Type", [
//         ["Media", Boolean],
//         ["Construction / infrastruction", Boolean],
//         ["Real estate", Boolean],
//         ["Agriculture", Boolean],
//         ["Mapping", Boolean],
//         ["Other", Boolean],
//     ]],
//     ["Service to drone industry type", [
//         ["Training", Boolean],
//         ["Maintenance / repair", Boolean],
//         ["Engineering consultancy", Boolean],
//         ["Verification, Validation, Testing & Certification (of the drone?)", Boolean],
//         ["Insurance", Boolean],
//         ["Data services", Boolean],
//         ["Other", Boolean],
//     ]],
//     ["Technology Type", [
//         ["Platforms", Boolean],
//         ["UTM ", Boolean],
//         ["Comms (comunications between drones)", Boolean],
//         ["Subsystems (payloads/sensors?)", Boolean],
//         ["Autonomy/navigation software/tech", Boolean],
//         ["AI / Software / algorithm (drone data processing/analytics)", Boolean],
//         ["Security / encryption", Boolean],
//         ["System Integration/engineering/consultancy", Boolean],
//         ["Other drone-related technologies", Boolean],
//         ["Delivery Drones", Boolean],
//         ["People carrying drones", Boolean],
//         ["Counter Drones", Boolean],
//     ]],
//     ["rest", [
//         ["Other", _.identity],
//         ["Drone strategy and consuting", _.identity],
//         ["Other service with a drone twist", _.identity],
//         ["Sum", Number]
//     ]]
// ]);


/* state */

/*
ab = _.applyTo(_.map(['a', 'b'], k => _.getKey(k)))(_.collect)
ab({a:1, b:2, c:3})
[1,2]

makePropertiesGetters = _.pipe(
    _.mapWith(_.getKey),
    _.apply(_.collect)
);
ab = makePropertiesGetters(['a', 'b'])
ab({a:1, b:2, c:3})
Array [ 1, 2 ]
*/

// export const groupByProperties = (items, properties) => {
//     const propertiesGetters = makePropertiesGetters(properties);
//
//     _.pipe(
//         _.mapWith(_.groupBy)
//     )
// };
