import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai from 'chai';
import { expect } from 'chai';
import app from '../../index';
import config from '../../config/env'
import faker from 'faker'
import { immutableUser } from './data/model/user'

let constUser = immutableUser.toJS();

chai.config.includeStack = true;
const baseUrl = config.baseUrl;
let tokenArr = [];
describe('## User APIs', () => {
    describe('# POST /api/users/signUp', () => {
        it('should create a new user', (done) => { 
            request(app)
                .post('/api/users/signUp')
                .send(constUser)
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.user.name).to.equal(constUser.name);
                    expect(res.body.user.email).to.equal(constUser.email);
                    // preparing for the next run
                    constUser._id = res.body.user._id;
                    tokenArr.push({
                        user: res.body.user.name,
                        token: res.body.token
                    })
                    done();
                });
        });
    });
    describe('# POST /api/users/me', () => {
        it('should return the logged in user', (done) => {
            let token;
            for (let i = 0; i < tokenArr.length; i++) {
                if (constUser.name === tokenArr[i].user) {
                    token = tokenArr[i].token;
                    break;
                }
            }
            request(app)
                .get('/api/users/me')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .then(res => {
                    expect(res.body.name).to.equal(constUser.name);
                    expect(res.body.email).to.equal(constUser.email);
                    done();
                })
        })
    });
});
