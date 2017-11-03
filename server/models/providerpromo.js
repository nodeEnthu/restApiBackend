import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
/**
 * User Schema
 */
const UserSchema = new mongoose.Schema({
    "name": String,
    "description": String,
    "imgUrl": String,
    "deliveryRadius": String,
    "location": String,
    "phone": String,
    "homepageUrl": String,
    "serviceType": [String],
    "email": String,
    "foodItems": [{}],
    "uniqueId":String
}, { collection: 'providerpromo', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('ProviderPromo', UserSchema);