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
    let serviceOfferedCode;
    switch (userResponse.serviceOffered) {
        case "pickup":
            serviceOfferedCode = 1;
            break;
        case "both":
            serviceOfferedCode = 2;
            break;
        case "delivery":
            serviceOfferedCode = 3;
            break;
        default:
            serviceOfferedCode = 1;
    }
    User.findById(loggedInUser, function(err, user) {
        if (!user) {
            res.send("not able to find the user");
        } else {
            getLatAndLong(place_id, function(err, result) {
                if (err) {
                    res.json({ error: err });
                } else {
                    user.userType = 'provider';
                    user.title = userResponse.title;
                    user.keepAddressPrivateFlag = userResponse.keepAddressPrivateFlag;
                    user.description = userResponse.description;
                    user.email = userResponse.email,
                    user.serviceOffered = serviceOfferedCode;
                    user.addtnlComments = userResponse.addtnlComments;
                    user.doYouDeliverFlag = userResponse.doYouDeliverFlag;
                    user.deliveryMinOrder = userResponse.deliveryMinOrder;
                    user.deliveryRadius = userResponse.deliveryRadius;
                    user.imgUrl = userResponse.imgUrl;
                    user = saveLocation(user, result, place_id, searchText, action);
                    // now we are ready to go to publish stage 2 .. so 2 instead of 1
                    user.publishStage = 2;
                    user.save(function(err, savedUser) {
                        res.json(savedUser);
                    })
                }
            })
        }

    });
}

function publish(req, res, next) {
    const loggedInUser = req.user;
    User.findById(loggedInUser, function(err, user) {
        if (!user) {
            res.send("not able to find the user");
        } else {
            user.published = true;
            user.publishStage = 3;
            user.save(function(err, savedUser) {
                res.json(savedUser);
            })
        }
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
                FoodItem.update({ _id: userResponse._id }, { $set: req.body }, { upsert: true, new: true }, function(err, foodItem) {
                    res.json(foodItem);
                })
            } else {
                // its a new item
                //create a new entry
                const foodItem = new FoodItem(req.body);
                foodItem._creator = user._id;
                foodItem.save(function(err, savedFooditem) {
                    if (err) {
                        res.send("fooditem not saved");
                    } else {
                        user.foodItems.push(savedFooditem._id);
                        user.publishStage = req.body.publishStage;
                        user.save(function(err, savedUser) {
                            res.json(savedFooditem);
                        })
                    }

                })
            }
        }
    });
}

export default { register, addOrEditFoodItem, publish };
