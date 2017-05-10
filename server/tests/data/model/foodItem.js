import faker from 'faker';
import { Map } from 'immutable';
faker.locale = "en_US";
import moment from 'moment';
let today = moment().startOf('day').format('YYYY-MM-DD');
let sevenDaysAhead = moment().add(7, "days").startOf('day').format('YYYY-MM-DD');

let immutableFoodItem = Map({
    name: "Dal Makhani",
    description: "These will make u gassy",
    cuisineType: "Mexican",
    price: 10,
    pickUpEndTime: "2016-08-23T20:45:11.493Z",
    pickUpStartTime: "2016-08-23T22:44:05.595Z",
    placeOrderBy: 2,
    serviceDate: "2016-08-25T07:00:00.000Z",
    vegan: false,
    vegetarian: true,
    nondairy: false,
    nutfree: true,
    oilfree: false,
    organic: false,
    glutenfree: true,
    indianFasting: false,
    lowcarb: false
});

let randomImmutableFoodItem = Map({
    name: faker.random.words(),
    description: faker.lorem.paragraph(),
    price: faker.random.number({ min: 8, max: 25 }),
    cuisineType: faker.random.arrayElement(["mexican", "indian", "asian", "french", "greek", "african", "dessert", "italian", "mediterranean", "american", "bbq"]),
    pickUpEndTime: "64800000",
    pickUpStartTime: "36000000",
    placeOrderBy: faker.random.arrayElement([0, 1, 2, 3]),
    availability: [faker.date.between(today, sevenDaysAhead)],
    vegan: faker.random.boolean(),
    vegetarian: faker.random.boolean(),
    nondairy: faker.random.boolean(),
    nutfree: faker.random.boolean(),
    oilfree: faker.random.boolean(),
    organic: faker.random.boolean(),
    indianFasting: faker.random.boolean(),
    lowcarb: faker.random.boolean(),
    glutenfree: faker.random.boolean()
});

export default { immutableFoodItem, randomImmutableFoodItem }
