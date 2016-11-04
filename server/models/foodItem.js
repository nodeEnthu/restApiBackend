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
    // This is temporary before putting stuff in Amazon
    img:{type:String,default:"http://lorempixel.com/400/200/food"},
    placeOrderBy: { type: Date},
    serviceDate: { type: Date},
    deliveryFlag:{type:Boolean, default:false}, 
    deliveryRadius:String,
    deliveryAddtnlComments:String,
    pickUpFlag:Boolean,
    pickUpStartTime:{ type: Date},
    pickUpEndTime:{ type: Date},
    price:Number,
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
}, { collection: 'foodItems' });

export default mongoose.model('FoodItem', FoodItem_Schema);
