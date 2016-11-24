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


faker.locale = "en_US";
chai.config.includeStack = true;

let providerRegistrationFuncArr = [];
let providerFoodItemEntryFuncArr = [];
let userSignUpFuncArr = [];

let n = 3 // number of providers
let users = [];
let addresses = [];
let tokenArr = [];
let foodItemArr = ["chinese","american","african","caribbean","japanese","indian","italian","mediterrnean","korean","mexican","viatnamese"]
Date.prototype.yyyymmdd = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [this.getFullYear(), !mm[1] && '0', mm, !dd[1] && '0', dd].join('-'); // padding
};
let today = new Date();
let date = new Date();
let twoDaysAhead = date.setDate(date.getDate() + 2);


function userSignUpFunc(index) {
    return function(callback) {
        let user = {
            name: faker.name.findName(),
            email: faker.internet.email(),
            provider: 'gmail',
            img: faker.image.imageUrl(),
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
        user.includeAddressInEmail = faker.random.boolean();
        user.description = faker.lorem.paragraph();
        user.streetName = faker.address.streetAddress("###");
        user.crosStreetName = faker.address.secondaryAddress();
        user.city = faker.address.city();
        user.pickUpFlag = faker.random.boolean();
        user.pickUpAddtnlComments = faker.lorem.sentence();
        user.doYouDeliverFlag = faker.random.boolean();
        user.deliveryAddtnlComments = faker.lorem.sentence();
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
    var randomNumber = Math.floor(Math.random()*foodItemArr.length);
    return function(callback) {
        let foodItem = {
            deliveryFlag: faker.random.boolean(),
            description: faker.lorem.paragraph(),
            glutenfree: faker.random.boolean(),
            price:faker.random.number({min:8, max:25}),
            indianFasting: faker.random.boolean(),
            lowcarb: faker.random.boolean(),
            name: faker.random.words(),
            cuisineType:foodItemArr[randomNumber],
            nondairy: faker.random.boolean(),
            nutfree: faker.random.boolean(),
            oilfree: faker.random.boolean(),
            organic: faker.random.boolean(),
            pickUpEndTime: "2016-08-23T20:45:11.493Z",
            pickUpStartTime: "2016-08-23T22:44:05.595Z",
            placeOrderBy: today,
            serviceDate: twoDaysAhead,
            snackBarOpen: faker.random.boolean(),
            vegan: faker.random.boolean(),
            vegetarian: faker.random.boolean(),
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

describe("# Creating random providers for the search view", function() {
    // this is not a test but creating data for the search view

    // lets first just create different users 
    for (var i = 0; i < n; i++) {
        userSignUpFuncArr.push(userSignUpFunc(i));
        providerRegistrationFuncArr.push(providerRegistrationFunc(i));
        providerFoodItemEntryFuncArr.push(providerFoodItemEntryFunc(i));
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
                generatePlaceIds({ lat: 37.7670730, lng: -121.9866690 }, 50000, parseInt(n / 3), function(err, results) {
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
                async.parallel(providerFoodItemEntryFuncArr, function(err, results) {
                    cb();
                })
            },
        ],
        function(err, results) {
            //done 
        })
})
