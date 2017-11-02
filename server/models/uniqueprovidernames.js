import mongoose from 'mongoose'

var UniqueProviderNames_Schema = new mongoose.Schema({
    titles: [String]
}, { collection: 'uniqueprovidernames', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('UniqueProviderNames', UniqueProviderNames_Schema);