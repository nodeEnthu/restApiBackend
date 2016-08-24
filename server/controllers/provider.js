import User from '../models/user';
import FoodItem from '../models/foodItem'
import jwt from 'jwt-simple';
import moment from 'moment';
import config from '../../config/env/index'

function register(req, res, next) {
    const userResponse = req.body;
    const loggedInUser = req.user;
    User.findById(loggedInUser, function(err, user) {
        user.userType ='provider';
        user.title = userResponse.title;
        user.keepAddressPrivateFlag = userResponse.keepAddressPrivateFlag;
        user.includeAddressInEmail = userResponse.includeAddressInEmail;
        user.description = userResponse.description;
        user.streetName = userResponse.streetName;
        user.crosStreetName = userResponse.crosStreetName;
        user.city = userResponse.city;
        user.pickUpFlag = userResponse.pickUpFlag;
        user.pickUpAddtnlComments = userResponse.pickUpAddtnlComments;
        user.doYouDeliverFlag = userResponse.doYouDeliverFlag;
        user.deliveryAddtnlComments = userResponse.deliveryAddtnlComments;
        user.deliveryMinOrder = userResponse.deliveryMinOrder;
        user.deliveryRadius = userResponse.deliveryRadius;
        user.save(function(err,savedUser){
            res.json(savedUser);
        })
    });
}

function addOrEditFoodItem(req, res, next) {
    const userResponse = req.body;
    const loggedInUser = req.user;
    // first get the user
    User.findById(loggedInUser, function(err, user) {
        if (!user) {
            res.send("not able to find the person");
        } else {
            // check if its a new item
            if (userResponse.foodItemId) {
                // need to edit an existing food item

            } else {
                // its a new item
                //create a new entry
                const foodItem = new FoodItem({
                    name :  userResponse.name,
                    description : userResponse.description,
                    placeOrderBy : userResponse.placeOrderBy,
                    serviceDate : userResponse.serviceDate,
                    deliveryFlag : userResponse.deliveryFlag,
                    deliveryRadius:userResponse.deliveryRadius,
                    deliveryAddtnlComments:userResponse.deliveryAddtnlComments,
                    pickUpFlag:userResponse.pickUpFlag,
                    pickUpStartTime:userResponse.pickUpStartTime,
                    pickUpEndTime:userResponse.pickUpEndTime,
                    pickUpAddtnlComments:userResponse.pickUpAddtnlComments,
                    organic:userResponse.organic,
                    vegetarian:userResponse.vegetarian,
                    glutenfree:userResponse.glutenfree,
                    lowcarb:userResponse.lowcarb,
                    vegan:userResponse.vegan,
                    nutfree:userResponse.nutfree,
                    oilfree:userResponse.oilfree,
                    nondairy:userResponse.nondairy,
                    indianFasting:userResponse.indianFasting,
                    firstItem:true
                })
                foodItem.save(function(err,savedFooditem){
                    user.foodItems.push(savedFooditem._id);
                    user.save(function(err,savedUser){
                        res.json(savedFooditem);
                    })
                })      
            }
        }
    });
}

export default { register, addOrEditFoodItem };
