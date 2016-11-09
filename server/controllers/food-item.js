import User from '../models/user';
import FoodItem from '../models/foodItem'
import Review from '../models/review'


function review(req, res, next) {
    const { foodItemId, creatorId, reviewDate, creatorName, rating, review } = req.body;
    FoodItem.findById(foodItemId, function(err, foodItem) {
        if (foodItem) {
            const newReview = new Review({
                _creator: creatorId,
                reviewDate: reviewDate,
                creatorName: creatorName,
                rating: rating,
                review: review
            });
            newReview.save(function(err, savedReview) {
                foodItem.reviews.push(savedReview._id);
                const numberOfReviews = foodItem.reviews.length;
                const newRating = (foodItem.rating + parseInt(savedReview.rating))/numberOfReviews; // taking the mean
                foodItem.rating = newRating;
                foodItem.numOfReviews = numberOfReviews;
                foodItem.save(function(err, savedFooditem) {
                    res.json(savedFooditem);
                });
            });
        }
    })

}

function reviews(req, res, next) {
    const foodItemId = req.params.foodItemId
    FoodItem.findById(foodItemId)
        .populate('reviews')
        .exec(function(err, foodItemAndReviews) {
            res.json(foodItemAndReviews)
        })
}
export default { review, reviews };
