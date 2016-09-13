import User from '../models/user';
import FoodItem from '../models/foodItem';
import moment from 'moment';

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
    const {latitude,longitude} = req.query;
    var point = { type: "Point", coordinates: [longitude, latitude]};
    User.geoNear(
        point, {
            spherical: true
        },
        function(err, results, stats) {
            res.json(results);
        });
}

export default { foodItems, providers };
