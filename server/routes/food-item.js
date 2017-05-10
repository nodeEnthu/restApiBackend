import express from 'express';
import foodItemCtrl from '../controllers/food-item';
import ensureAuthenticated, {checkLogin} from '../helpers/ensureAuthenticated';
import {userMakingChangeToOwnProfile} from '../helpers/ensureAuthenticated';
const router = express.Router(); // eslint-disable-line new-cap

router.route('/list')
   	/** GET /api/foodItem/list - Get list of foodItems */
    .get(foodItemCtrl.list)
router.route('/:foodItemId/review')
	// POST /api/foodItem/:id/review
	.post(checkLogin,foodItemCtrl.review);
router.route('/:foodItemId/reviews')
	// GET /api/foodItem/:id/reviews
	.get(foodItemCtrl.reviews);
router.route('/:foodItemId')
	// POST /api/foodItem/:id
	.get(foodItemCtrl.get);
router.route('/:foodItemId/remove')
	// POST /api/foodItem/:id/remove
	.post(checkLogin,userMakingChangeToOwnProfile,foodItemCtrl.remove);

export default router; 