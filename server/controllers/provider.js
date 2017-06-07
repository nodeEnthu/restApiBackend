import User from '../models/user';
import Order from '../models/order'
import FoodItem from '../models/foodItem'
import Review from '../models/review'
import jwt from 'jwt-simple';
import moment from 'moment';
import config from '../../config/env/index'
import { getLatAndLong, saveLocation, getDisplayAddress, getSearchAddress } from '../helpers/geo'
import async from 'async';
import merge from 'lodash.merge';

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
                    user.deliveryMinOrder = userResponse.deliveryMinOrder;
                    user.deliveryRadius = userResponse.deliveryRadius;
                    user.imgUrl = userResponse.imgUrl;
                    user = saveLocation(user, result, place_id, searchText, action);
                    // now we are ready to go to publish stage 2 .. so 2 instead of 1
                    user.publishStage = 2;
                    user.save(function(err, savedUser) {
                        console.log(savedUser)
                        res.json({ status: 'ok' });
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
                res.json({ status: 'ok' });
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
                FoodItem.findById(userResponse._id, function(err, foodItem) {
                    if (err) {
                        return res.json({ error: 'error finding foodItem' });
                    }
                    if (!foodItem) {
                        return res.send(404);
                    } else {
                        let updated = merge(foodItem, req.body); // lodash merge method update matching fields with the new value
                        updated.displayPrice = user.currency + ' ' + updated.price.toString();
                        updated.save(function(err, updatedFoodItem) {
                            if (err) {
                                return res.json({ error: 'error saving edited foodItem' });
                            } else {
                                res.json({ status: 'ok' });
                            }
                        });
                    }
                });

            } else {
                // its a new item
                //create a new entry
                const foodItem = new FoodItem(req.body);
                foodItem._creator = user._id;
                foodItem.displayPrice = user.currency + ' ' + foodItem.price.toString();
                foodItem.save(function(err, savedFooditem) {
                    if (err) {
                        res.send("fooditem not saved");
                    } else {
                        user.foodItems.push(savedFooditem._id);
                        user.publishStage = req.body.publishStage;
                        user.save(function(err, savedUser) {
                            res.json({ status: 'ok' });
                        })
                    }

                })
            }
        }
    });
}

/**
 * Delete food item
 * Do 3 things 
 * 1) Delete it from the user profile
 * 2) Delete all the reviews
 * 3) Delete the fodItem
 * @returns {foodItem}
 */

function remove(req, res, next) {
    const loggedInUser = req.user;

    function removeReviewsWithId(id) {
        return function(cb) {
            Review.findByIdAndRemove(id, function(err, review) {
                console.log("Step:4 Removing the review", id);
                cb();
            })
        }
    }

    function removeFoodItem(foodItemId) {
        return function(cb) {
            async.series([
                function removeAllReviews(cb) {
                    FoodItem.findById(foodItemId, function(err, foodItem) {
                        //console.log("Step:3 starting to remove the foodItem", (foodItem)? foodItem._id : foodItem);
                        let removeReviewsFuncArr = [];
                        if (foodItem && foodItem.reviews && foodItem.reviews.length > 0) {
                            foodItem.reviews.forEach(function(reviewId) {
                                removeReviewsFuncArr.push(removeReviewsWithId(reviewId));
                            })
                        }
                        async.parallel(removeReviewsFuncArr, function(err, resultArr) {
                            cb(err);
                        });
                    })
                },
                function removeFoodItemNow(cb) {
                    FoodItem.findByIdAndRemove(foodItemId, function(err, foodItemDeleted) {
                        //console.log("error in removing the foodItem" ,err)
                        cb(null);
                    });
                }
            ], function(err, resultArr) {
                cb(err)
            });
        }

    }
    if (loggedInUser) {
        async.waterfall([
            function findUser(cb) {
                User.findById(loggedInUser)
                    .lean()
                    .exec(function(err, user) {
                        //console.log("step:1 got the user", user._id);
                        cb(err, user);
                    })
            },
            function removeAllFoodItems(user, cb) {
                let foodItemsFuncArr = [];
                //console.log(" step:2 There are the food Items ", user.foodItems);
                user.foodItems.forEach(function(foodItemId) {
                    foodItemsFuncArr.push(removeFoodItem(foodItemId));
                    //console.log(" here is the fooditemId we are going to remove ", foodItemId);
                });
                async.parallel(foodItemsFuncArr, function(err, resultArr) {
                    cb(err, user);
                })
            },
            function removeAllOrdersAsCustomer(user, cb) {
                Order.find({ _creator: user._id })
                    .exec(function(err, orders) {
                        orders.forEach(function(order) {
                            order.remove();
                        });
                        cb(err, user);
                    })
            },
            function removeUser(user, cb) {
                //console.log(" coming here to delet the user");
                User.findByIdAndRemove(loggedInUser, function(err, userDeleted) {
                    //console.log("Step:6 Finally removing the user", loggedInUser);
                    cb(err);
                });
            }
        ], function(err, resultArr) {
            res.json({ message: 'done' });
        });
    } else res.json({ error: "incorrect use of api" });
}

export default { register, addOrEditFoodItem, publish, remove };
