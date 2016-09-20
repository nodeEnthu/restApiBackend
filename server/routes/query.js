import express from 'express';
import queryCtrl from '../controllers/query';
import ensureAuthenticated, {checkLogin} from '../helpers/ensureAuthenticated';
const router = express.Router(); // eslint-disable-line new-cap

router.route('/foodItems')
	// GET /api/query/foodItems
	.get(queryCtrl.foodItems);
router.route('/providers')
	// GET /api/query/providers
	.get(checkLogin,queryCtrl.providers);

export default router; 