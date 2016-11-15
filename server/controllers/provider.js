import User from '../models/user';
import FoodItem from '../models/foodItem'
import Review from '../models/review'
import jwt from 'jwt-simple';
import moment from 'moment';
import config from '../../config/env/index'
import { getLatAndLong, saveLocation } from '../helpers/geo'


function register(req, res, next) {
    let action = 'registerProvider';
    const userResponse = req.body;
    const loggedInUser = req.user;
    const { searchText, place_id } = userResponse;
    User.findById(loggedInUser, function(err, user) {
        getLatAndLong(place_id, function(err, result) {
            if (err) {
                res.json({ error: err });
            } else {
                user.userType = 'provider';
                user.title = userResponse.title;
                user.keepAddressPrivateFlag = userResponse.keepAddressPrivateFlag;
                user.includeAddressInEmail = userResponse.includeAddressInEmail;
                user.description = userResponse.description;
                user.pickUpFlag = userResponse.pickUpFlag;
                user.pickUpAddtnlComments = userResponse.pickUpAddtnlComments;
                user.doYouDeliverFlag = userResponse.doYouDeliverFlag;
                user.deliveryAddtnlComments = userResponse.deliveryAddtnlComments;
                user.deliveryMinOrder = userResponse.deliveryMinOrder;
                user.deliveryRadius = userResponse.deliveryRadius;
                user = saveLocation(user, result, place_id, searchText, action);
                user.save(function(err, savedUser) {
                    res.json(savedUser);
                })
            }
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
            if (userResponse._id) {
                // need to edit an existing food item
                FoodItem.update({ _id: userResponse._id }, { $set: req.body }, { upsert: true }, function(err, foodItem) {
                    res.json(foodItem);
                })
            } else {
                // its a new item
                //create a new entry
                const foodItem = new FoodItem(req.body);
                foodItem._creator = user._id;
                foodItem.save(function(err, savedFooditem) {
                    user.foodItems.push(savedFooditem._id);
                    user.save(function(err, savedUser) {
                        res.json(savedFooditem);
                    })
                })
            }
        }
    });
}

export default { register, addOrEditFoodItem };
