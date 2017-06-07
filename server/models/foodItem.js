import mongoose from 'mongoose'

var FoodItem_Schema = new mongoose.Schema({
    name: String,
    description: String,
    _creator:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rating:{type:Number,default:0},
    numOfReviews:{type:Number,default:0},
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    avalilabilityType:{type:String,default:'onOrder'},
    reviewers:[String],
    imgUrl:String,
    placeOrderBy: { type: Number},
    availability:[Date],
    pickUpStartTime:String,
    pickUpEndTime:String,
    price:Number,
    displayPrice:String,
    cuisineType:String,
    organic:Boolean,
    vegetarian:Boolean,
    glutenfree:Boolean,
    lowcarb:Boolean,
    vegan:Boolean,
    nutfree:Boolean,
    oilfree:Boolean,
    nondairy:Boolean,
    indianFasting:Boolean
}, { collection: 'foodItems',timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('FoodItem', FoodItem_Schema);
