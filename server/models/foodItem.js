import mongoose from 'mongoose'

var FoodItem_Schema = new mongoose.Schema({
    name: String,
    description: String,
    _creator:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rating:{type:Number,default:0,index: true },
    numOfReviews:{type:Number,default:0},
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }],
    avalilabilityType:{type:String,default:'onOrder',index: true},
    reviewers:[String],
    imgUrl: { type: String, default: 'https://s3-us-west-1.amazonaws.com/prod-usr-food-imgs/default_food_pic.png' },
    placeOrderBy: { type: Number},
    availability:{type:[Date],index: true },
    pickUpStartTime:String,
    pickUpEndTime:String,
    price:Number,
    displayPrice:String,
    cuisineType:{type: String, index: true },
    organic:Boolean,
    vegetarian:Boolean,
    glutenfree:Boolean,
    lowcarb:Boolean,
    vegan:Boolean,
    nutfree:Boolean,
    oilfree:Boolean,
    nondairy:Boolean,
    indianFasting:Boolean,
    nonveg:{type: Boolean, index: true },
}, { collection: 'foodItems',timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export default mongoose.model('FoodItem', FoodItem_Schema);
