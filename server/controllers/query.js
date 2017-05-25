import User from '../models/user';
import FoodItem from '../models/foodItem';
import moment from 'moment';
import async from 'async';
import { getLatAndLong } from '../helpers/geo'

export const CORRECTION_FACTOR = 1.2;

function combinedQuery(latitude, longitude, defaultProviderRadius, providerQuery, foodQuery, filterspageNum, cb) {
    filterspageNum = parseInt(filterspageNum) || 0;
    let skip = filterspageNum * 12;
    User.aggregate(
        [{
            "$geoNear": {
                "near": {
                    "type": "Point",
                    "coordinates": [parseFloat(longitude), parseFloat(latitude)]
                },
                "distanceField": "distance",
                "maxDistance": defaultProviderRadius,
                "spherical": true,
                "distanceMultiplier": 0.000621371,
                "query": providerQuery
            }
        }, {
            $unwind: '$foodItems'
        }, {
            $lookup: {
                from: "foodItems",
                localField: "foodItems",
                foreignField: "_id",
                as: "foodItems"
            }
        }, {
            $match: foodQuery
        }, {
            $project: {
                'distance': 1,
                'loc': 1,
                'foodItems': 1,
                'serviceOffered': 1
            }
        }, {
            "$sort": { "distance": 1 }
        }, {
            "$skip": skip
        }, {
            "$limit": 12
        }],
        function(err, results, stats) {
            cb(err, results, stats);
        });
}
/*
 * GET /api/query/foodItems
 */
function foodItems(req, res, next) {
    // right now just return the foodItem with its provider
    let limit = 12;
    let combinedDietCuisineFilters = req.query["combinedDietCuisineFilters"];
    let filterspageNum = req.query["filterspageNum"] * 0;
    FoodItem
        .find(combinedDietCuisineFilters, 'name placeOrderBy serviceDate deliveryFlag pickUpStartTime pickUpEndTime _creator')
        .populate('_creator', 'name img pickUpFlag doYouDeliverFlag')
        .skip(filterspageNum)
        .limit(12)
        .exec(function(err, foodItems) {
            res.json(foodItems);
        });
}

function providers(req, res, next) {
    let { cuisineSelectedMap, dietSelectedMap, addtnlQuery, guestLocation, filterspageNum, onOrder } = req.query;
    let defaultProviderRadius = 1609 * 10; // 10 miles
    filterspageNum = filterspageNum || 0;
    cuisineSelectedMap = (cuisineSelectedMap) ? JSON.parse(cuisineSelectedMap) : undefined;
    dietSelectedMap = (dietSelectedMap) ? JSON.parse(dietSelectedMap) : undefined;
    let foodQuery = {};
    let providerQuery = { "loc.type": "Point", published: true };
    // dietSelectedMap is all AND
    for (let key in dietSelectedMap) {
        if (dietSelectedMap.hasOwnProperty(key)) {
            foodQuery['foodItems.' + key] = dietSelectedMap[key];
        }
    }
    // cuisineSelectedMap is all OR
    if (cuisineSelectedMap && Object.keys(cuisineSelectedMap).length > 0) {
        let orConditions = [];
        for (let key in cuisineSelectedMap) {
            if (cuisineSelectedMap.hasOwnProperty(key)) {
                orConditions.push({
                    ['foodItems.cuisineType']: key
                })
            }
        }
        foodQuery["$or"] = orConditions;
    }
    if (addtnlQuery) {
        addtnlQuery = JSON.parse(addtnlQuery);
        if (onOrder === "false") {
            let queryDate = (addtnlQuery.date) ? new Date(addtnlQuery.date) : new Date();
            foodQuery['foodItems.availability'] = { $gte: queryDate };
            foodQuery['foodItems.avalilabilityType'] = 'specificDates';
        } else foodQuery['foodItems.avalilabilityType'] = 'onOrder';
        if (addtnlQuery.orderMode && addtnlQuery.orderMode.length > 0) {
            let orderModeQuery = {};
            switch (addtnlQuery.orderMode) {
                case "pickup":
                    orderModeQuery = { $lte: 2 };
                    break;
                case "delivery":
                    orderModeQuery = { $gte: 2 };
                    break;
                case "both":
                    orderModeQuery = { $gte: 1 };
                    break;
                default:
                    orderModeQuery = { $gte: 1 };
            }
            providerQuery.serviceOffered = orderModeQuery;
        }
        if (addtnlQuery.providerRadius) {
            defaultProviderRadius = (addtnlQuery.providerRadius) ? addtnlQuery.providerRadius * 1609 : defaultProviderRadius;
        }
    }
    let userId = req.user;
    // user is logged in
    if (userId) {
        User.findById(userId, function(err, user) {
            let latitude, longitude;
            if (user) {
                if (user.userType === 'consumer') {
                    if (user.loc && user.loc.coordinates && user.loc.coordinates.length && user.loc.coordinates.length > 0 && user.loc.coordinates[0] != 0) {
                        latitude = user.loc.coordinates[1];
                        longitude = user.loc.coordinates[0];
                    } else {
                        res.json({ error: 'NOADDRFND' });
                        return;
                    }
                } else {
                    // its a provider trying to look for food
                    latitude = user.userSeachLocations[user.deliveryAddressIndex].coordinates[1];
                    longitude = user.userSeachLocations[user.deliveryAddressIndex].coordinates[0];
                }
                combinedQuery(latitude, longitude, defaultProviderRadius, providerQuery, foodQuery, filterspageNum, function(err, results, stats) {
                    res.json(results);
                })
            } else {
                res.status(404);
                res.send("err");
            }

        });
    } else {
        guestLocation = (guestLocation) ? JSON.parse(guestLocation) : undefined;
        if (guestLocation && guestLocation["place_id"]) {
            getLatAndLong(guestLocation["place_id"], function(err, result) {
                if (err) {
                    res.status(404);
                    res.send("err");
                } else {
                    const { latitude, longitude } = result;
                    combinedQuery(latitude, longitude, defaultProviderRadius * CORRECTION_FACTOR, providerQuery, foodQuery, filterspageNum, function(err, results, stats) {
                        res.json(results);
                    });
                }

            });
        } else res.json({ message: "incorrect use of the api" });

    }
}

export default { foodItems, providers };
