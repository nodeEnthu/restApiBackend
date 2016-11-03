import User from '../models/user';
import FoodItem from '../models/foodItem'
import Review from '../models/review'
import jwt from 'jwt-simple';
import moment from 'moment';
import config from '../../config/env/index'
import { getLatAndLong,saveLocation } from '../helpers/geo'


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
                user = saveLocation(user,result,place_id,searchText,action);
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
            if (userResponse.foodItemId) {
                // need to edit an existing food item

            } else {
                // its a new item
                //create a new entry
                const foodItem = new FoodItem({
                    name: userResponse.name,
                    description: userResponse.description,
                    price:userResponse.price,
                    cuisineType:userResponse.cuisineType,
                    _creator: user._id,
                    placeOrderBy: userResponse.placeOrderBy,
                    serviceDate: userResponse.serviceDate,
                    deliveryFlag: userResponse.deliveryFlag,
                    deliveryRadius: userResponse.deliveryRadius,
                    deliveryAddtnlComments: userResponse.deliveryAddtnlComments,
                    pickUpFlag: userResponse.pickUpFlag,
                    pickUpStartTime: userResponse.pickUpStartTime,
                    pickUpEndTime: userResponse.pickUpEndTime,
                    pickUpAddtnlComments: userResponse.pickUpAddtnlComments,
                    organic: userResponse.organic,
                    vegetarian: userResponse.vegetarian,
                    glutenfree: userResponse.glutenfree,
                    lowcarb: userResponse.lowcarb,
                    vegan: userResponse.vegan,
                    nutfree: userResponse.nutfree,
                    oilfree: userResponse.oilfree,
                    nondairy: userResponse.nondairy,
                    indianFasting: userResponse.indianFasting,
                    firstItem: true
                })
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

function review (req,res,next){
    const {foodItemId,creatorId,reviewDate,creatorName,rating,review} = req.body;
    console.log(foodItemId,creatorId,reviewDate,creatorName,rating,review);
    FoodItem.findById(foodItemId,function(err,foodItem){
        console.log("foodItem",foodItem,err);
        if(foodItem){
            const newReview = new Review({
                _creator:creatorId,
                reviewDate:reviewDate ,
                creatorName: creatorName,
                rating:rating,
                review:review
            });
            newReview.save(function(err,savedReview){
                console.log('*********savedReview',err,savedReview);
                foodItem.reviews.push(savedReview._id);
                foodItem.save(function(err,savedFooditem){
                    res.json(savedFooditem);
                });
            });
        }
    })

}
export default { register, addOrEditFoodItem,review};
