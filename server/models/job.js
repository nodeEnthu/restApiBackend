import Promise from 'bluebird';
import mongoose from 'mongoose';
/**
 * Job Schema
 */
const JobSchema = new mongoose.Schema({
    partysize: Number,
    serviceType: String,
    frequency: String,
    address: String,
    place_id: String,
    addtnlAddressComments: String,
    start_date: Date,
    end_date: Date,
    sun: Boolean,
    mon: Boolean,
    tue: Boolean,
    wed: Boolean,
    thu: Boolean,
    fri: Boolean,
    sat: Boolean,
    sun: Boolean,
    ni: Boolean,
    si: Boolean,
    ch: Boolean,
    ve: Boolean,
    nv: Boolean,
    de: Boolean,
    br:Boolean,
    lu:Boolean,
    di:Boolean,
    invitees:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default:[]
    }],
    applications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        default:[]
    }],
    loc: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
    },
}, { collection: 'jobs', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
JobSchema.index({ "loc": "2dsphere" });
JobSchema.method({});



/**
 * @typedef User
 */
export default mongoose.model('Job', JobSchema);