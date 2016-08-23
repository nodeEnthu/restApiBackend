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
    foodItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodItem'
    }],
    // loc: {
    //     type: { type: String, default: 'Point' },
    //     coordinates: [Number],
    // },
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
//UserSchema.index({ "loc": "2dsphere" });
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
