import mongoose from 'mongoose'

var Application_Schema = new mongoose.Schema({
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    coverLetter:String    
}, { collection: 'applications',timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('Application', Application_Schema);
