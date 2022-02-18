import _ from "lamb";

const pickCoordinates = _.collect(
    _.getKey("Longitude"),
    _.getKey("Latitude")
);

export const toGeoPoints = items => ({
    "type": "FeatureCollection",
    "features": _.map(items, item => ({
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": pickCoordinates(item)
        },
        "properties": item
    }))
});
