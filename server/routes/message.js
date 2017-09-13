import express from 'express';
import messageCtrl from '../controllers/message';
import ensureAuthenticated, { checkLogin } from '../helpers/ensureAuthenticated';
const router = express.Router(); // eslint-disable-line new-cap

router.route('/provider')
    // GET /api/message/provider
    .post(ensureAuthenticated, messageCtrl.messageProvider);

router.route('/send/code/provider')
	.post(ensureAuthenticated,messageCtrl.sendAuthCodeToProvider)

router.route('/verify/code')
	.post(ensureAuthenticated,messageCtrl.verifyAuthCode)

export default router;