// before running any tests initialize a user
import faker from 'faker';
import {Map,List} from 'immutable';
faker.locale = "en_US";
let immutableUser = Map({
    name: 'joomla',
    email: faker.internet.email(),
    provider: 'fb',
    published: true,
    img: faker.image.imageUrl(),
    fbUserID: faker.random.uuid(),
    userType: faker.random.arrayElement(["provider", "consumer"]),
    title: faker.random.words(),
    keepAddressPrivateFlag: true,
    description: faker.lorem.lines(),
    streetName: 'Main Street',
    crosStreetName: 'Cross street',
    city: 'San Ramon',
    addtnlComments: faker.lorem.lines(),
    serviceOffered: faker.random.arrayElement([1,2,3]),
    deliveryMinOrder: '45',
    deliveryRadius: '10'
});

let randomImmutableUser = Map({
    name: faker.name.findName(),
    email: faker.internet.email(),
    provider: faker.random.arrayElement(["fb", "gmail"]),
    img: faker.image.imageUrl(),
    fbUserID: faker.random.uuid(),
    gmailUserID: faker.random.uuid(),
    userType: faker.random.arrayElement(["provider", "consumer"]),
    title: faker.random.words(),
    keepAddressPrivateFlag: faker.random.boolean(),
    description: faker.lorem.lines(),
    streetName: faker.address.streetAddress("###"),
    crosStreetName: faker.address.secondaryAddress(),
    city: faker.address.city(),
    addtnlComments: faker.lorem.lines(),
    serviceOffered: faker.random.arrayElement([1,2,3]),
    deliveryMinOrder: faker.random.number({ min: 35, max: 50 }),
    deliveryRadius: faker.random.number({ min: 5, max: 20 })
});

export default { immutableUser, randomImmutableUser }
