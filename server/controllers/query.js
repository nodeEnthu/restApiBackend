import User from '../models/user';
import FoodItem from '../models/foodItem';
import moment from 'moment';
import async from 'async';

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
    let { combinedDietCuisineFilters,addtnlQuery} = req.query;
    let defaultProviderRadius = 15000;
    combinedDietCuisineFilters = (combinedDietCuisineFilters) ? JSON.parse(combinedDietCuisineFilters) : undefined;
    let foodQuery = {};
    for (let key in combinedDietCuisineFilters) {
        if (combinedDietCuisineFilters.hasOwnProperty(key)) {
            foodQuery['foodItems.' + key] = combinedDietCuisineFilters[key];
        }
    }
    if(addtnlQuery){
        addtnlQuery = JSON.parse(addtnlQuery);
        console.log('addtnlQuery.date',addtnlQuery.date,addtnlQuery.orderMode,addtnlQuery.providerRadius);
        foodQuery['foodItems.serviceDate']= { $gte : new Date(addtnlQuery.date) }
        // if(addtnlQuery.orderMode){
        //     foodQuery['foodItems.' + addtnlQuery.orderMode] = true;
        // }
        if(addtnlQuery.providerRadius){
            defaultProviderRadius = addtnlQuery.providerRadius *1000;
        }

    }
    let userId = req.user;
    if (userId) {
        User.findById(userId, function(err, user) {
            const latitude = user.loc.coordinates[1];
            const longitude = user.loc.coordinates[0];
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
                    $match: foodQuery 
                }, {
                    $project: {
                        distance: 1,
                        loc:1,
                        'foodItems': 1,
                        cuisineType:1
                    }
                }, {
                    "$sort": { "distance": 1 }
                }],
                function(err, results, stats) {
                    res.json(results);
                });
        })
    } else {
        const {latitude,longitude} = req.query;
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
                $match:  foodQuery 
            }, {
                $project: {
                    distance: 1,
                    'foodItems': 1
                }
            }, {
                "$sort": { "distance": 1 }
            }],
            function(err, results, stats) {
                res.json(results);
            });
    }


}

export default { foodItems, providers };
