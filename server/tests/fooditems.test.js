import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai from 'chai';
import { expect } from 'chai';
import app from '../../index';
import config from '../../config/env';
import async from 'async';
import faker from 'faker';
import generatePlaceIds from './utils/geo/generateRandomLocs'

chai.config.includeStack = true;
let tokenArr = [];

// before running any tests initialize a user
let user = {
    name: 'joomla',
    email: faker.internet.email(),
    provider: 'fb',
    img: faker.image.imageUrl(),
    fbUserID: 'randomUserId',
    userType: 'provider',
    title: 'Chilli me',
    keepAddressPrivateFlag: true,
    includeAddressInEmail: true,
    description: 'been in businees for the last 20 years ',
    streetName: 'Main Street',
    crosStreetName: 'Cross street',
    city: 'San Ramon',
    pickUpFlag: true,
    pickUpAddtnlComments: 'please wear gloves .. its gonne be hot',
    doYouDeliverFlag: true,
    deliveryAddtnlComments: 'We deliver 6pm to 9pm within a 5 miles radius',
    deliveryMinOrder: '45',
    deliveryRadius: '10'
};
let foodItem1 = {
    deliveryFlag: true,
    description: "These will make u gassy",
    firstItem: true,
    glutenfree: true,
    indianFasting: false,
    lowcarb: false,
    cuisineType:"Mexican",
    name: "faker",
    nondairy: false,
    nutfree: true,
    oilfree: false,
    organic: false,
    pickUpEndTime: "2016-08-23T20:45:11.493Z",
    pickUpStartTime: "2016-08-23T22:44:05.595Z",
    placeOrderBy: "2016-08-24T07:00:00.000Z",
    serviceDate: "2016-08-25T07:00:00.000Z",
    snackBarMessage: "",
    snackBarOpen: false,
    vegan: false,
    vegetarian: true
};
describe('# POST /api/users/signUp && /api/providers/registration', () => {
    before(function(done) {
        generatePlaceIds({ lat: 40.714224, lng: -73.961452 }, 16000, 1, function(err, results) {
            user.place_id = results[0].place_id;
            user.searchText = results[0].address;
            done();
        })
    })
    it('should create a new user AND enroll provider with a basic information', (done) => {
        async.series([
            function(callback) {
                request(app)
                    .post('/api/users/signUp')
                    .send(user)
                    .then(res => {
                        tokenArr.push({
                            user: res.body.user.name,
                            token: res.body.token
                        })
                        callback(null, res);
                    })
            },
            function(callback) {
                let token;
                for (let i = 0; i < tokenArr.length; i++) {
                    if (user.name === tokenArr[i].user) {
                        token = tokenArr[i].token;
                        break;
                    }
                }
                request(app)
                    .post('/api/providers/registration')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ' + token)
                    .send(user)
                    .then(res => {
                        callback(null, res);
                    })
            }
        ], function(err, results) {
            let userRes = results[1];
            expect(userRes.body.name).to.equal(user.name);
            expect(userRes.body.userType).to.equal('provider');
            expect(userRes.body.description).to.equal(user.description);
            done();
        });
    });
    describe("#POST /api/providers/addOrEditFoodItem", () => {
        it("should enter food item(s) to the providers menu", (done) => {
            let token;
            for (let i = 0; i < tokenArr.length; i++) {
                if (user.name === tokenArr[i].user) {
                    token = tokenArr[i].token;
                    break;
                }
            }
            request(app)
                .post('/api/providers/addOrEditFoodItem')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .send(foodItem1)
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.name).to.equal(foodItem1.name);
                    expect(res.body.description).to.equal(foodItem1.description);
                    expect(res.body.placeOrderBy).to.equal(foodItem1.placeOrderBy);
                    expect(res.body.pickUpStartTime).to.equal(foodItem1.pickUpStartTime);
                    expect(res.body.nutfree).to.equal(foodItem1.nutfree);
                    done();
                })
        })
    })
});
