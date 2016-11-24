import User from '../models/user';
import FoodItem from '../models/foodItem';
import moment from 'moment';
import async from 'async';
import { getLatAndLong } from '../helpers/geo'

function combinedQuery(latitude, longitude, defaultProviderRadius, query, cb) {
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
                "query": { "loc.type": "Point" }
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
            $match: query
        }, {
            $project: {
                distance: 1,
                loc: 1,
                'foodItems': 1
            }
        }, {
            "$sort": { "distance": 1 }
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
    let filterspageNum = req.query["filterspageNum"] * 12;
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
    let { cuisineSelectedMap, dietSelectedMap, addtnlQuery, guestLocation } = req.query;
    let defaultProviderRadius = 24000; // 10 miles
    cuisineSelectedMap = (cuisineSelectedMap) ? JSON.parse(cuisineSelectedMap) : undefined;
    dietSelectedMap = (dietSelectedMap) ? JSON.parse(dietSelectedMap) : undefined;
    let foodQuery = {};
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
        foodQuery['foodItems.serviceDate'] = { $gte: new Date(addtnlQuery.date) }
        if (addtnlQuery.orderMode) {
            foodQuery['foodItems.' + addtnlQuery.orderMode] = true;
        }
        if (addtnlQuery.providerRadius) {
            defaultProviderRadius = (addtnlQuery.providerRadius) ? addtnlQuery.providerRadius * 1600 : defaultProviderRadius;
        }

    }

    let userId = req.user;
    if (userId) {
        User.findById(userId, function(err, user) {
            let latitude, longitude;
            if (user.type === 'consumer') {
                latitude = user.loc.coordinates[1];
                longitude = user.loc.coordinates[0];

            } else {
                // its a provider trying to look for food
                latitude = user.userSeachLocations[user.deliveryAddressIndex].coordinates[1];
                longitude = user.userSeachLocations[user.deliveryAddressIndex].coordinates[0];
            }
            combinedQuery(latitude, longitude, defaultProviderRadius, foodQuery, function(err, results, stats) {
                res.json(results);
            });

        })
    } else {
        guestLocation = (guestLocation) ? JSON.parse(guestLocation) : undefined;
        if (guestLocation && guestLocation["place_id"]) {
            getLatAndLong(guestLocation["place_id"], function(err, result) {
                const { latitude, longitude } = result;
                combinedQuery(latitude, longitude, defaultProviderRadius, foodQuery, function(err, results, stats) {
                    res.json(results);
                });
            });
        }else res.json({message:"incorrect use of the api"});

    }
}

export default { foodItems, providers };
