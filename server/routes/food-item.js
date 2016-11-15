import express from 'express';
import foodItemCtrl from '../controllers/food-item';
import ensureAuthenticated, {checkLogin} from '../helpers/ensureAuthenticated';
const router = express.Router(); // eslint-disable-line new-cap

router.route('/:foodItemId/review')
	// POST /api/foodItem/:id/review
	.post(checkLogin,foodItemCtrl.review);
router.route('/:foodItemId/reviews')
	// GET /api/foodItem/:id/reviews
	.get(foodItemCtrl.reviews);
router.route('/:foodItemId')
	// POST /api/foodItem/:id
	.get(foodItemCtrl.get);

export default router; 