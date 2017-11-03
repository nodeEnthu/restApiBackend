import User from '../models/user';
import Order from '../models/order'
import Job from '../models/job'
import FoodItem from '../models/foodItem'
import Review from '../models/review'
import jwt from 'jwt-simple';
import moment from 'moment';
import config from '../../config/env/index'
import { getLatAndLong, saveLocation, getDisplayAddress, getSearchAddress } from '../helpers/geo'
import async from 'async';
import merge from 'lodash.merge';
import { deleteAwsImage } from './../helpers/awsUtils'
import mongoose from 'mongoose'
import UniqueProviderNames from '../models/uniqueprovidernames'
import ProviderPromo from '../models/providerpromo';
import ProviderPromotionAnalytics from '../models/providerpromotionanalytics';
import { transport, EmailTemplate, templatesDir } from './../helpers/emailService';
import path from 'path'

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
            serviceOfferedCode = userResponse.serviceOffered;
            break;
    }
    async.waterfall([
        // detect whether its an edit or a new entry and whether person has made a change to their titles
        function(cb) {
            User.findById(loggedInUser, function(err, user) {
                if (!user) {
                    cb(err, true, null)
                    // its an edit and user has not changed title
                } else if (user && user.title === userResponse.title) {
                    cb(null, false, null);
                } else cb(null, true, user.title);
            })
        },
        // perform validation id person has changed business title
        function(performCheck, lastTitle, cb) {
            // check if the name is unique
            if (performCheck) {
                UniqueProviderNames.find({}, function(err, uniqueProvidersDocs) {
                    if (!err) {
                        if (uniqueProvidersDocs.length === 0) {
                            let createNewDoc = new UniqueProviderNames();
                            createNewDoc.titles.push(userResponse.title);
                            createNewDoc.save(function(err) {
                                cb(null, true);
                            });
                        } else {
                            let uniqueProviders = uniqueProvidersDocs[0];
                            if (uniqueProviders.titles.indexOf(userResponse.title) === -1) {
                                // remove the last used name from the unique list
                                if (lastTitle) {
                                    let index = uniqueProviders.titles.indexOf(lastTitle);
                                    if (index >= 0) uniqueProviders.titles.splice(index, 1);
                                }
                                uniqueProviders.titles.push(userResponse.title);
                                uniqueProviders.save(function() {
                                    cb(null, true);
                                })
                            } else cb(null, false);
                        }
                    } else cb(err);
                })
            } else cb(null, true);
        },
        function(uniqueName, cb) {
            if (uniqueName) {
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
                                user.email = userResponse.email;
                                user.serviceOffered = serviceOfferedCode;
                                user.addtnlComments = userResponse.addtnlComments;
                                user.deliveryMinOrder = userResponse.deliveryMinOrder;
                                user.deliveryRadius = userResponse.deliveryRadius;
                                user.imgUrl = userResponse.imgUrl;
                                user.methodsOfPayment = userResponse.methodsOfPayment;
                                user = saveLocation(user, result, place_id, searchText, action);
                                // now we are ready to go to publish stage 2 .. so 2 instead of 1
                                user.publishStage = 2;
                                user.save(function(err, savedUser) {
                                    cb(err);
                                })
                            }
                        })
                    }

                });
            } else {
                cb('code11241');
            }

        }
    ], function(err, resultArr) {
        if (err) {
            res.send({ status: err })
        } else res.json({ status: 'ok' });

    });
}

function publish(req, res, next) {
    var loggedInUser = req.user;
    User.findById(loggedInUser, function(err, user) {
        if (!user) {
            res.send("not able to find the user");
        } else {
            user.published = true;
            user.publishStage = 3;
            // check the providers count number
            async.waterfall([function checkProviderCounter(cb) {
                if (user.firstHundredProviderCount && user.firstHundredProviderCount > 0) {
                    // dont do anything ... we have already iuncreased the counter
                    cb(null, false);
                } else {
                    cb(null, true);
                }
            }], function(err, result) {
                user.save(function(err, savedUser) {
                    res.json({ status: 'ok' });
                });
            });
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
                        foodItem.lowcarb = userResponse.lowcarb;
                        foodItem.vegan = userResponse.vegan;
                        foodItem.nondairy = userResponse.nondairy;
                        foodItem.price = userResponse.price;
                        foodItem.name = userResponse.name;
                        foodItem.organic = userResponse.organic;
                        foodItem.nonveg = userResponse.nonveg;
                        foodItem.pickUpEndTime = userResponse.pickUpEndTime;
                        /**
                         * check whether the image has changed from last one
                         * if changed then delete the one which is replaced
                         **/
                        if (userResponse.imgUrl != foodItem.imgUrl && userResponse.imgUrl != '') {
                            // check there was an image before
                            if (foodItem.imgUrl != '') {
                                let imgUrl = foodItem.imgUrl;
                                let imgName = imgUrl.split('/').pop();
                                // call this and forget
                                deleteAwsImage(imgName);
                            }
                            foodItem.imgUrl = userResponse.imgUrl;
                        }
                        foodItem.indianFasting = userResponse.indianFasting;
                        foodItem.pickUpStartTime = userResponse.pickUpStartTime;
                        foodItem.glutenfree = userResponse.glutenfree;
                        foodItem.nutfree = userResponse.nutfree;
                        foodItem.description = userResponse.description;
                        foodItem.placeOrderBy = userResponse.placeOrderBy;
                        foodItem.cuisineType = userResponse.cuisineType;
                        foodItem.vegetarian = userResponse.vegetarian;
                        foodItem.oilfree = userResponse.oilfre;
                        let currency = (user.currency && user.currency != 'undefined') ? user.currency : '$'
                        foodItem.displayPrice = currency + ' ' + foodItem.price.toString();
                        foodItem.save(function(err, updatedFoodItem) {
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
                if (foodItem.imgUrl === '') {
                    foodItem.imgUrl = 'https://s3-us-west-1.amazonaws.com/prod-usr-food-imgs/default_food_pic.png';
                }
                foodItem._creator = user._id;
                let currency = (user.currency && user.currency != 'undefined') ? user.currency : '$'
                foodItem.displayPrice = currency + ' ' + foodItem.price.toString();
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
                        if (foodItemDeleted) {
                            let imgUrl = foodItemDeleted.imgUrl;
                            let imgName = imgUrl.split('/').pop();
                            // call this and forget
                            deleteAwsImage(imgName);
                        }
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
                    let imgUrl = userDeleted.imgUrl;
                    if (imgUrl) {
                        let imgName = imgUrl.split('/').pop();
                        // call this and forget
                        deleteAwsImage(imgName);
                    }

                    cb(err);
                });
            }
        ], function(err, resultArr) {
            res.json({ message: 'done' });
        });
    } else res.json({ error: "incorrect use of api" });
}

function getAllInvitedJobs(req, res, next) {
    const loggedInUser = req.user;
    let ObjectId = mongoose.Schema.Types.ObjectId;
    Job.find({ invitees: { $elemMatch: { $eq: loggedInUser } } })
        .exec(function(err, jobs) {
            res.send(jobs);
        })
}

function checkUniqueNames(title, cb) {
    UniqueProviderNames.find({}, function(err, uniqueProvidersDocs) {
        if (!err) {
            if (uniqueProvidersDocs.length === 0) {
                let createNewDoc = new UniqueProviderNames();
                createNewDoc.save(function(err) {
                    cb(null, true);
                });
            } else {
                let uniqueProviders = uniqueProvidersDocs[0];
                if (uniqueProviders.titles.indexOf(title) === -1) {
                    cb(null, true);
                } else cb(null, false);
            }
        } else cb(err);
    })
}

function checkUniqueProviderName(req, res, next) {
    let { title } = req.query;
    checkUniqueNames(title, function(err, result) {
        if (!err) {
            res.send({ unique: result });
        } else res.send({ status: 'fail' });
    })
}

function registerEmailSentProviderPromotion(req, res, next) {
    let { refId } = req.query;
    let n = 3

    function sendEmailToProvider(emailAndId, success) {
        let template = new EmailTemplate(path.join(templatesDir, 'invite-provider-enrollment'));
        return function(cb) {
            template.render({ actionUrl: 'https://spoonandspanner/how/it/works/provider?refId=' + emailAndId.uniqueId }, function(error, results) {
                if (results && results.html) {
                    let mailOptions = {
                        from: '"Spoon&Spanner 👥"<support@spoonandspanner.com>', // sender address
                        to: emailAndId.email,
                        subject: 'Dear home chef provide your food with us ', // Subject line
                        html: results.html, // html body
                    };
                    transport.sendMail(mailOptions, function(error, info) {
                        if (!error) {
                            success.push(emailAndId.uniqueId);
                        }
                        // keep going if if it failed
                        cb(null);
                    });

                } else cb();
            });
        }
    }

    async.waterfall([
        function getNProviderEmailIds(cb) {
            let emailAndIdsToBeSent = [];
            ProviderPromo.find({}, function(err, providers) {
                for (let i = 0; i < n; i++) {
                    emailAndIdsToBeSent.push({ email: providers[i].email, uniqueId: providers[i].uniqueId });
                }
                cb(err, emailAndIdsToBeSent);
            })
        },
        function sendEmails(emailAndIdsToBeSent, cb) {
            let sendEmailToProviderArr = [],
                success = [];
            console.log('**** emailAndIdsToBeSent ****', emailAndIdsToBeSent);
            emailAndIdsToBeSent.forEach(function(emailAndId, index) {
                sendEmailToProviderArr.push(sendEmailToProvider(emailAndId, success))
            })
            async.parallel(sendEmailToProviderArr, function(err, resultArr) {
                cb(err, emailAndIdsToBeSent, success);
            })
        },
        function updateAnalytics(emailAndIdsToBeSent, success, cb) {
            ProviderPromotionAnalytics.findOne({}, function(err, analytics) {
                let newAnalytics = analytics || new ProviderPromotionAnalytics();
                emailAndIdsToBeSent.forEach(function(emailAndId) {
                    newAnalytics.emailSent.push(emailAndId.uniqueId);
                })
                success.forEach(function(uniqueId) {
                    newAnalytics.success.push(uniqueId);
                })
                newAnalytics.save(function() {
                    cb(null, emailAndIdsToBeSent, success)
                })
            })
        }
    ], function(err, resultArr) {
        res.send({ emails: resultArr });
    })
}

function providerPromoEmailClickAnalytics(req, res, next) {
    let { refId } = req.body;
    ProviderPromotionAnalytics.findOne({}, function(err, newAnalytics) {
        if (newAnalytics.enrollPageViewed.indexOf(refId) === -1) {
            newAnalytics.enrollPageViewed.push(refId);
            newAnalytics.save(function() {
                res.send({ status: 'ok' })
            })
        } else res.send({ status: 'already registered' })
    })
}

function providerEnrollmentStartedAnalytics(req, res, next) {
    let { refId } = req.body;
    ProviderPromotionAnalytics.findOne({}, function(err, newAnalytics) {
        if (newAnalytics.providerEnrollmentStarted.indexOf(refId) === -1) {
            newAnalytics.providerEnrollmentStarted.push(refId);
            newAnalytics.save(function() {
                res.send({ status: 'ok' })
            })
        } else res.send({ status: 'already registered' })
    })
}

function foodItemEnrollmentStartedAnalytics(req, res, next) {
    let { refId } = req.body;
    ProviderPromotionAnalytics.findOne({}, function(err, newAnalytics) {
        if (newAnalytics.foodItemEnrollmentStarted.indexOf(refId) === -1) {
            newAnalytics.foodItemEnrollmentStarted.push(refId);
            newAnalytics.save(function() {
                res.send({ status: 'ok' })
            })
        } else res.send({ status: 'already registered' })
    })
}

function publishStartedAnalytics(req, res, next) {
    let { refId } = req.body;
    ProviderPromotionAnalytics.findOne({}, function(err, newAnalytics) {
        if (newAnalytics.publishStarted.indexOf(refId) === -1) {
            newAnalytics.publishStarted.push(refId);
            newAnalytics.save(function() {
                res.send({ status: 'ok' })
            })
        } else res.send({ status: 'already registered' })
    })
}



export default {
    register,
    addOrEditFoodItem,
    publish,
    remove,
    getAllInvitedJobs,
    checkUniqueProviderName,
    registerEmailSentProviderPromotion,
    providerPromoEmailClickAnalytics,
    providerEnrollmentStartedAnalytics,
    foodItemEnrollmentStartedAnalytics,
    publishStartedAnalytics
};