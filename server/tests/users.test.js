import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai from 'chai';
import { expect } from 'chai';
import app from '../../index';
import config from '../../config/env'


chai.config.includeStack = true;
const baseUrl = config.baseUrl;
let tokenArr = [];
describe('## User APIs', () => {
    let user = {
        name: 'joomla',
        email: 'joomla@gmail.com',
        provider: 'fb',
        img: 'https://graph.facebook.com/' + 'joomla' + '/picture?type=small',
        fbUserID: 'randomUserId'
    };

    describe('# POST /api/users/signUp', () => {
        it('should create a new user', (done) => {
            request(app)
                .post('/api/users/signUp')
                .send(user)
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.user.name).to.equal(user.name);
                    expect(res.body.user.email).to.equal(user.email);
                    user = res.body.user;
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
            request(app)
                .get('/api/users/me')
                .set('Content-Type','application/json')
                .set('Authorization','Bearer ' + tokenArr[0].token)
                .then(res => {
                    expect(res.body.name).to.equal(user.name);
                    expect(res.body.email).to.equal(user.email);
                    done();
                })
        })
    });
});
