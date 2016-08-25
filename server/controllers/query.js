
import FoodItem from '../models/foodItem';
import moment from 'moment';

/*
* GET /api/query/foodItems
*/
function foodItems(req, res, next) {
    // right now just return the foodItem with its provider
    FoodItem
        .find({organic:true}, 'name placeOrderBy serviceDate deliveryFlag pickUpStartTime pickUpEndTime _creator')
        .populate('_creator', 'name img pickUpFlag doYouDeliverFlag')
        .limit(10) 
        .exec(function(err,foodItems){
            res.json(foodItems);
        });
}

function providers(req, res, next) {
   
}

export default { foodItems, providers };
