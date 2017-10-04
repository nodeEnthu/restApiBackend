import express from 'express';
import jobCtrl from '../controllers/job';
import ensureAuthenticated, {checkLogin} from '../helpers/ensureAuthenticated';
const router = express.Router(); // eslint-disable-line new-cap

router.route('/create')
	// POST /api/job/create
	.post(ensureAuthenticated, jobCtrl.create);

router.route('/:id')
	// POST /api/job/create
	.get(ensureAuthenticated, jobCtrl.get);

router.route('/invite/providers')
	// POST /api/job/invite/providers
	.get(jobCtrl.inviteProviders);

router.route('/send/invite')
	// POST /api/job/invite/providers
	.post(jobCtrl.addInvitee);
export default router; 