import User from '../models/user';
import FoodItem from '../models/foodItem'
import Review from '../models/review'
import async from 'async'

function review(req, res, next) {
    const { foodItemId, creatorId, reviewDate, creatorName, rating, review } = req.body;
    FoodItem.findById(foodItemId, function(err, foodItem) {
        if (foodItem) {
            foodItem.reviewers = foodItem.reviewers || [];
            if (foodItem.reviewers.indexOf(creatorId) === -1) {
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
                    foodItem.reviewers.push(creatorId);
                    const newRating = (savedReview.rating  + parseInt(foodItem.rating) * (numberOfReviews - 1)) / numberOfReviews; // taking the mean
                    foodItem.rating = newRating;
                    foodItem.numOfReviews = numberOfReviews;
                    foodItem.save(function(err, savedFooditem) {
                        res.json(savedFooditem);
                    });
                });
            } else {
                res.json({ message: 'already reviewed' });
            }
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

function get(req, res, next) {
    const foodItemId = req.params.foodItemId
    FoodItem.findById(foodItemId)
        .exec(function(err, foodItem) {
            res.json(foodItem)
        })
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
    const foodItemId = req.params.foodItemId

    function removeReviewsWithId(id) {
        return function(cb) {
            Review.findByIdAndRemove(id, function(err, review) {
                cb();
            })
        }
    }
    if (loggedInUser && foodItemId) {
        async.series([
            function removeFoodItemFromUser(cb) {
                User.update({ _id: loggedInUser }, { $pull: { foodItems: foodItemId } })
                    .then(function(err, res) {
                        cb();
                    })
            },
            function removeAllReviews(cb) {
                FoodItem.findById(foodItemId, function(err, foodItem) {
                    let removeReviewsFuncArr = [];
                    foodItem.reviews.forEach(function(reviewId) {
                        removeReviewsFuncArr.push(removeReviewsWithId(reviewId));
                    })
                    async.parallel(removeReviewsFuncArr, function(err, resultArr) {
                        cb();
                    });
                })
            },
            function removeFoodItem(cb) {
                FoodItem.findByIdAndRemove(foodItemId, function(err, foodItemDeleted) {
                    cb();
                });
            }
        ], function(err, resultArr) {
            res.json(resultArr);
        });
    }else res.json({error:"incorrect use of api"});

}
export default { review, reviews, get, remove };
