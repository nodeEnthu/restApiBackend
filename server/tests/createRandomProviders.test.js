import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai from 'chai';
import { expect } from 'chai';
import app from '../../index';
import config from '../../config/env';
import async from 'async';
import fs from 'fs';
import faker from 'faker';
import generatePlaceIds from './utils/geo/generateRandomLocs'
import moment from 'moment';

faker.locale = "en_US";
chai.config.includeStack = true;

let providerRegistrationFuncArr = [],
    providerFoodItemEntryFuncArr = [],
    userSignUpFuncArr = [],
    publishProvidersFuncArr = [],
    users = [],
    addresses = [],
    tokenArr = [],
    n = 100; // number of providers

let foodItemArr = ["mexican", "indian", "asian", "french", "greek", "african", "dessert", "italian", "mediterranean", "american", "bbq"];
let today = moment().add(1, "days").startOf('day').format('YYYY-MM-DD')
let sevenDaysAhead = moment().add(8, "days").startOf('day').format('YYYY-MM-DD')

function userSignUpFunc(index) {
    return function(callback) {
        let user = {
            name: faker.name.findName(),
            email: faker.internet.email(),
            provider: 'gmail',
            gmailUserId: faker.random.uuid()
        }
        request(app)
            .post('/api/users/signUp')
            .send(user)
            .then(res => {
                // user will now have an _id with it
                users.push(res.body.user);
                tokenArr.push({
                    user: res.body.user.name,
                    token: res.body.token
                })
                callback(null, res);
            })
    }
}

function providerRegistrationFunc(index) {
    return function(callback) {
        //find the user from the last step
        let user = users[index];
        // expand on the user by adding basic provider info
        user.userType = 'provider';
        user.title = faker.company.companyName();
        user.keepAddressPrivateFlag = faker.random.boolean();
        user.description = faker.lorem.paragraph();
        user.streetName = faker.address.streetAddress("###");
        user.crosStreetName = faker.address.secondaryAddress();
        user.city = faker.address.city();
        user.imgUrl = "http://lorempixel.com/400/200/people/";
        user.serviceOffered = faker.random.arrayElement([1, 2, 3]);
        user.addtnlComments = faker.lorem.sentence();
        user.deliveryMinOrder = faker.random.number({ min: 35, max: 50 });
        user.deliveryRadius = faker.random.number({ min: 5, max: 20 });
        user.place_id = addresses[index].place_id;
        user.searchText = addresses[index].address;
        let token = tokenArr[index].token;
        request(app)
            .post('/api/providers/registration')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer ' + token)
            .send(user)
            .then(res => {
                callback(null, res);
            })
    }

}

function providerFoodItemEntryFunc(index) {
    var randomNumber = Math.floor(Math.random() * foodItemArr.length);
    return function(callback) {
        let foodItem = {
            imgUrl: "http://lorempixel.com/400/200/food/",
            name: faker.random.words(),
            description: faker.lorem.paragraph(),
            price: faker.random.number({ min: 5, max: 40 }),
            cuisineType: foodItemArr[randomNumber],
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
        };
        let user = users[index];
        let token = tokenArr[index].token;
        request(app)
            .post('/api/providers/addOrEditFoodItem')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer ' + token)
            .send(foodItem)
            .then(res => {
                callback(null, res);
            })
    }
}

function publishProvidersFunc(index) {
    return function(callMeBack) {
        let user = users[index];
        let token = tokenArr[index].token;
        request(app)
            .post('/api/providers/publish')
            .set('Content-Type', 'application/json')
            .set('Authorization', 'Bearer ' + token)
            .then(res => {
                callMeBack(null, res);
            })
    }
}
describe("# Creating random providers for the search view", function() {
    // this is not a test but creating data for the search view

    // lets first just create different users 
    for (var i = 0; i < n; i++) {
        userSignUpFuncArr.push(userSignUpFunc(i));
        providerRegistrationFuncArr.push(providerRegistrationFunc(i));
        providerFoodItemEntryFuncArr.push(providerFoodItemEntryFunc(i));
        publishProvidersFuncArr.push(publishProvidersFunc(i));
    }
    async.series(
        [
            function(cb) {
                async.parallel(userSignUpFuncArr, function(err, results) {
                    cb();
                })
            },
            function(cb) {
                // 50 kms
                generatePlaceIds({ lat: 37.7670730, lng: -121.9866690 }, 50000, parseInt(n/5), function(err, results) {
                    addresses = addresses.concat(results);
                    cb();
                })
            },
            function(cb) {
                async.parallel(providerRegistrationFuncArr, function(err, results) {
                    cb();
                })
            },
            function(cb) {
                async.parallel(publishProvidersFuncArr, function(err, results) {
                    cb();
                })
            },
            function(cb) {
                async.parallel(providerRegistrationFuncArr, function(err, results) {
                    cb();
                })
            },
            function(cb) {
                async.parallel(providerFoodItemEntryFuncArr, function(err, results) {
                    cb();
                })
            }
        ],
        function(err, results) {
            //done 
        })
})
