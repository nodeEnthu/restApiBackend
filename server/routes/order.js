import express from 'express';
import order from '../controllers/order';
import ensureAuthenticated, {checkLogin , userMakingChangeToOwnProfile} from '../helpers/ensureAuthenticated';
const router = express.Router(); // eslint-disable-line new-cap

router.route('/order-submit')
	// POST /api/order/order-submit
	.post(ensureAuthenticated,userMakingChangeToOwnProfile,order.orderSubmit);
router.route('/:orderId/orderConfirmCustomer')
	// POST /api/order/325123132/orderConfirmCustomer
	.post(order.orderConfirmCustomer);
router.route('/:orderId/orderCancelCustomer')
	// POST /api/order/325123132/orderConfirmCustomer
	.post(order.orderCancelCustomer);
router.route('/:userId/:role/get')
	// GET /api/:userId/:role/get
	.get(order.get);
router.route('/:orderId')
	// GET /api/order/:orderId
	.get(order.load);

export default router; 