import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai from 'chai';
import { expect } from 'chai';
import app from '../../index';
import config from '../../config/env'
import faker from 'faker';
import generatePlaceIds from './utils/geo/generateRandomLocs'

chai.config.includeStack = true;
const baseUrl = config.baseUrl;
let tokenArr = [];
describe('## Provider APIs', () => {
    let user = {
        name: 'joomla',
        email: faker.internet.email(),
        provider: 'fb',
        img: faker.image.imageUrl(),
        fbUserID: 'randomUserId',
        userType :'provider',
        title: 'Chilli me',
        keepAddressPrivateFlag : true,
        includeAddressInEmail : true,
        description : 'been in businees for the last 20 years ',
        streetName : 'Main Street',
        crosStreetName : 'Cross street',
        city : 'San Ramon',
        pickUpFlag : true,
        pickUpAddtnlComments : 'please wear gloves .. its gonne be hot',
        doYouDeliverFlag : true,
        deliveryAddtnlComments : 'We deliver 6pm to 9pm within a 5 miles radius',
        deliveryMinOrder : '45',
        deliveryRadius : '10'
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
    describe('# POST /api/providers/registration', () => {
        before(function(done){
            generatePlaceIds({lat:40.714224,lng:-73.961452},16000,1,function(err,results){
                user.place_id = results[0].place_id;
                user.searchText = results[0].address;
                done();
            })
        })
        it('should register the user as a provider and enter profile information', (done) => {
            let token;
            for(let i=0;i<tokenArr.length;i++){
                if(user.name === tokenArr[i].user){
                    token = tokenArr[i].token;
                    break;
                }
            }
            request(app)
                .post('/api/providers/registration')
                .set('Content-Type','application/json')
                .set('Authorization','Bearer ' + token)
                .send(user)
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.name).to.equal(user.name);
                    expect(res.body.email).to.equal(user.email);
                    expect(res.body.description).to.equal(user.description);
                    expect(res.body.crosStreetName).to.equal(user.crosStreetName);
                    expect(res.body.pickUpAddtnlComments).to.equal(user.pickUpAddtnlComments);
                    expect(res.body.deliveryRadius).to.equal(user.deliveryRadius);
                    done();
                })
        })
    });
});
