import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
/**
 * User Schema
 */
const UserSchema = new mongoose.Schema({
    name: { type: String, default: '' },
    email: { type: String, default: '', index: true },
    phone:String,
    img: { type: String, default: '' },
    fbUserID: { type: String, default: '' },
    gmailUserID: { type: String, default: '' },
    userType: { type: String, default: 'consumer' },
    homepageUrl: String,
    devices: { type: [String], default: [] },
    foodItems: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FoodItem'
        }],
        index: true
    },
    firstHundredProviderCount: { type: Number },
    promotionEligible: { type: Boolean, default: true },
    service: { type: Number },
    reviewEligibleFoodItems: [],
    imgUrl: { type: String, default: 'https://s3-us-west-1.amazonaws.com/prod-usr-food-imgs/default_profile_pic.jpg' },
    published: { type: Boolean, default: false },
    publishStage: { type: Number, default: 0 },
    phoneAuthCode:String,
    /*
     * loc will be used to perform geo spatial queries and no other purpose
     * location denotes the most recent location of a provider
     * for provider: It means their business location that will be used to perform geolocation queries against
     * for consumers: It means the most recent address they have entered for delivery
     */
    loc: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
        searchText: String,
        place_id: String
    },
    /*
     * keepAddressPrivateFlag = true 
     */
    shortAddress: { type: String, default: '' },
    fullAddress: { type: String, default: '' },
    /*
     * the index in userSeachLocations .. which will be the delivery address
     */
    deliveryAddressIndex: { type: Number, default: 0 },
    /*
     * Used as a list of addreses entered by the user
     */
    userSeachLocations: [{
        searchText: { type: String },
        coordinates: { type: [Number], default: [0, 0] },
        place_id: { type: String }
    }],
    /*
     * pickup = 1 , both  = 2, delivery = 3
     */
    serviceOffered: { type: Number, default: 1 },
    addtnlComments: { type: String, default: '' },
    title: String,
    keepAddressPrivateFlag: { type: Boolean, default: false },
    methodsOfPayment: [Number],
    description: String,
    deliveryRadius: String,
    deliveryMinOrder: String,
    ordersReceived: { type: Number, default: 0 },
    ordersConfirmed: { type: Number, default: 0 },
    ordersCancelled: { type: Number, default: 0 },
    state: String,
    country: String,
    currency: String
}, { collection: 'users', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
UserSchema.index({ "loc": "2dsphere" });
UserSchema.method({});

/**
 * Statics
 */
UserSchema.statics = {
    /**
     * Get user
     * @param {ObjectId} id - The objectId of user.
     * @returns {Promise<User, APIError>}
     */
    get(id) {
        return this.findById(id)
            .execAsync().then((user) => {
                if (user) {
                    return user;
                }
                const err = new APIError('No such user exists!', httpStatus.NOT_FOUND);
                return Promise.reject(err);
            });
    },

    /**
     * List users in descending order of 'createdAt' timestamp.
     * @param {number} skip - Number of users to be skipped.
     * @param {number} limit - Limit number of users to be returned.
     * @returns {Promise<User[]>}
     */
    list({ skip = 0, limit = 50 } = {}) {
        return this.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .execAsync();
    }
};


/**
 * @typedef User
 */
export default mongoose.model('User', UserSchema);