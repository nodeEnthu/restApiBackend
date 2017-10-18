import Promise from 'bluebird';
import mongoose from 'mongoose';
/**
 * Job Schema
 */

const JobSchema = new mongoose.Schema({
    _creator:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    title: String,
    partysize: Number,
    serviceType: String,
    address: String,
    place_id: String,
    addtnlAddressComments: String,
    addtnlCustomerComments:String,
    start_date: Date,
    end_date: Date,
    budget:Number,
    doneHiring:Boolean,
    cuisines:{ type: [String], default: [] },
    meals:{ type: [String], default: [] },
    weekdays:{ type: [String], default: [] },
    invitees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }],
    applications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        default: []
    }],
    applicants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }],
    hirees:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
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