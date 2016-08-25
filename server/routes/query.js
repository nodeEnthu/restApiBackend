import express from 'express';
import queryCtrl from '../controllers/query';
const router = express.Router(); // eslint-disable-line new-cap

router.route('/foodItems')
	// GET /api/query/foodItems
	.get(queryCtrl.foodItems);
router.route('/providers')
	// GET /api/query/providers
	.get(queryCtrl.providers);

export default router;