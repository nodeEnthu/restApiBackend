import mongoose from 'mongoose'

var Review_Schema = new mongoose.Schema({
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // This is temporary before putting stuff in Amazon
    reviewDate: { type: Date, required: true },
    creatorName: { type: String, required: true },
    rating: { type: Number, required: true },
    review: { type: String , required: true}
}, { collection: 'reviews' });

export default mongoose.model('Review', Review_Schema);
