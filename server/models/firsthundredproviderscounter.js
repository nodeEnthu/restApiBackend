'use strict';

import mongoose from 'mongoose'

var FirstHundredProvidersCounter_Schema = new mongoose.Schema({
    counter: { type: Number, default: 0 },
    // email ids that have received the promotion code
    emailIds: [String],
    browserIdsSame: { type: Array, default: [] }
}, { collection: 'firsthundredproviderscounter', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('FirstHundredProvidersCounter', FirstHundredProvidersCounter_Schema);
