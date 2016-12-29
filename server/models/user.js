import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
/**
 * User Schema
 */
const UserSchema = new mongoose.Schema({
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    provider: { type: String, default: '' },
    img: { type: String, default: '' },
    fbUserID: { type: String, default: '' },
    gmailUserID: { type: String, default: '' },
    userType: { type: String, default: 'consumer' },
    homepageUrl: String,
    foodItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodItem'
    }],
    imgUrl:String,
    published: { type: Boolean, default: false },
    publishStage: { type: Number, default: 0 },
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
    pickUpFlag: { type: Boolean, default: true },
    pickUpAddtnlComments: { type: String, default: '' },
    title: String,
    keepAddressPrivateFlag: { type: Boolean, default: false },
    includeAddressInEmail: { type: Boolean, default: true },
    description: String,
    streetName: String,
    crosStreetName: String,
    city: String,
    doYouDeliverFlag: { type: Boolean, default: false },
    deliveryRadius: String,
    deliveryMinOrder: String,
    deliveryAddtnlComments: String
}, { collection: 'users' });

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
