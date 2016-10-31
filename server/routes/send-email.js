import express from 'express';
import sendEmail from '../controllers/send-email';
import ensureAuthenticated, {checkLogin} from '../helpers/ensureAuthenticated';
const router = express.Router(); // eslint-disable-line new-cap

router.route('/order-submit')
	// POST /api/emails/order-submit
	.post(sendEmail.orderSubmit);

export default router; 