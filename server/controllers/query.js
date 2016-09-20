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

    let { combinedDietCuisineFilters } = req.query;
    combinedDietCuisineFilters = (combinedDietCuisineFilters) ? JSON.parse(combinedDietCuisineFilters) : undefined;
    let foodQuery = {};
    for (let key in combinedDietCuisineFilters) {
        if (combinedDietCuisineFilters.hasOwnProperty(key)) {
            foodQuery['foodItems.' + key] = combinedDietCuisineFilters[key];
        }
    }
    let userId = req.user;
    User.findById(userId, function(err, user) {
        const latitude = 40.714224;
        const longitude = -73.96145;
        console.log(latitude, longitude);
        User.aggregate(
            [{
                "$geoNear": {
                    "near": {
                        "type": "Point",
                        "coordinates": [parseFloat(longitude), parseFloat(latitude)]
                    },
                    "distanceField": "distance",
                    "maxDistance": 16000,
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
                $match: { 'foodItems.organic': true }
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
    })

}

export default { foodItems, providers };
