import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai from 'chai';
import { expect } from 'chai';
import app from '../../index';
import config from '../../config/env';
import async from 'async';
import faker from 'faker';
import generatePlaceIds from './utils/geo/generateRandomLocs'
import {immutableUser} from './data/model/user'
import {immutableFoodItem} from './data/model/foodItem'
chai.config.includeStack = true;
let tokenArr = [];

let constUser = immutableUser.toJS();
let constFoodItem = immutableFoodItem.toJS();

describe('# POST /api/users/signUp && /api/providers/registration', () => {
    before(function(done) {
        generatePlaceIds({ lat: 37.7670730, lng: -121.9866690 }, 1000, 1, function(err, results) {
            constUser.place_id = results[0].place_id;
            constUser.searchText = results[0].address;
            done();
        })
    })
    it('should create a new user AND enroll provider with a basic information', (done) => {
        async.series([
            function(callback) {
                request(app)
                    .post('/api/users/signUp')
                    .send(constUser)
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
                    if (constUser.name === tokenArr[i].user) {
                        token = tokenArr[i].token;
                        break;
                    }
                }
                request(app)
                    .post('/api/providers/registration')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', 'Bearer ' + token)
                    .send(constUser)
                    .then(res => {
                        callback(null, res);
                    })
            }
        ], function(err, results) {
            let userRes = results[1];
            expect(userRes.body.name).to.equal(constUser.name);
            expect(userRes.body.userType).to.equal('provider');
            expect(userRes.body.description).to.equal(constUser.description);
             // preparing for the next run
            constUser._id = userRes.body._id;
            done();
        });
    });
    describe("#POST /api/providers/addOrEditFoodItem", () => {
        it("should enter food item(s) to the providers menu", (done) => {
            let token;
            for (let i = 0; i < tokenArr.length; i++) {
                if (constUser.name === tokenArr[i].user) {
                    token = tokenArr[i].token;
                    break;
                }
            }
            request(app)
                .post('/api/providers/addOrEditFoodItem')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .send(constFoodItem)
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.name).to.equal(constFoodItem.name);
                    expect(res.body.description).to.equal(constFoodItem.description);
                    expect(res.body.placeOrderBy).to.equal(constFoodItem.placeOrderBy);
                    expect(res.body.pickUpStartTime).to.equal(constFoodItem.pickUpStartTime);
                    expect(res.body.nutfree).to.equal(constFoodItem.nutfree);
                    done();
                })
        })
    })
});
