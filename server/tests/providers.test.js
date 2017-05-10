import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai from 'chai';
import { expect } from 'chai';
import app from '../../index';
import config from '../../config/env'
import generatePlaceIds from './utils/geo/generateRandomLocs'
import { immutableUser } from './data/model/user'
chai.config.includeStack = true;

let constUser = immutableUser.toJS();

const baseUrl = config.baseUrl;
let tokenArr = [];
describe('## Provider APIs', () => {
    describe('# POST /api/users/signUp', () => {
        it('should create a new user', (done) => {
            request(app)
                .post('/api/users/signUp')
                .send(constUser)
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.user.name).to.equal(constUser.name);
                    expect(res.body.user.email).to.equal(constUser.email);
                    tokenArr.push({
                            user: res.body.user.name,
                            token: res.body.token
                        })
                    // preparing for the next run
                    constUser._id = res.body.user._id;
                    done();
                });
        });
    });
    describe('# POST /api/providers/registration', () => {
        before(function(done) {
            generatePlaceIds({ lat: 40.714224, lng: -73.961452 }, 16000, 1, function(err, results) {
                constUser.place_id = results[0].place_id;
                constUser.searchText = results[0].address;
                done();
            })
        })
        it('should register the user as a provider and enter profile information', (done) => {
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
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.name).to.equal(constUser.name);
                    expect(res.body.email).to.equal(constUser.email);
                    expect(res.body.description).to.equal(constUser.description);
                    expect(res.body.addtnlComments).to.equal(constUser.addtnlComments);
                    expect(res.body.deliveryRadius).to.equal(constUser.deliveryRadius);
                    done();
                })
        })
    });
});
