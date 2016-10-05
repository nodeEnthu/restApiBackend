import mongoose from 'mongoose'

var FoodItem_Schema = new mongoose.Schema({
    name: String,
    description: String,
    _creator:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
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
    cuisineType:String,
    organic:{type:Boolean, default:false},
    vegetarian:{type:Boolean, default:false},
    glutenfree:{type:Boolean, default:false},
    lowcarb:{type:Boolean, default:false},
    vegan:{type:Boolean, default:false},
    nutfree:{type:Boolean, default:false},
    oilfree:{type:Boolean, default:false},
    nondairy:{type:Boolean, default:false},
    indianFasting:{type:Boolean, default:false}
}, { collection: 'foodItems' });

export default mongoose.model('FoodItem', FoodItem_Schema);
