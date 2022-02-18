import {
    isIterableEmpty,
    isIterableNotEmpty
} from "./iterableUtils";

const arr1 = [
    {Name: "name"},
    {Name: ""},
];

const hasEmptyName = _.pipe(_.getKey("Name"), isIterableEmpty);
const hasItemsWithEmptyName = _.pipe(
    _.filterWith(hasEmptyName),
    isIterableNotEmpty
);

test('detects items with empty Name', () => {
    expect(hasItemsWithEmptyName(arr1)).toEqual(true);
});

test('data has no items with empty Name', () => {
    expect(hasItemsWithEmptyName(arr1)).toEqual(true);
});
