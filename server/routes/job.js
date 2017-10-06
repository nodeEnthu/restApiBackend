import express from 'express';
import jobCtrl from '../controllers/job';
import ensureAuthenticated, {userMakingChangeToOwnProfile} from '../helpers/ensureAuthenticated';
const router = express.Router(); // eslint-disable-line new-cap

router.route('/create')
	// POST /api/job/create
	.post(ensureAuthenticated, jobCtrl.create);

router.route('/:id')
	// POST /api/job/create
	.get(ensureAuthenticated, jobCtrl.get);

router.route('/invite/providers')
	// POST /api/job/invite/providers
	.get(ensureAuthenticated, jobCtrl.inviteProviders);


router.route('/get/applicants')
	// POST /api/job/get/applicants
	.get(ensureAuthenticated, jobCtrl.getApplicants);

router.route('/get/hirees')
	// POST /api/job/get/hirees
	.get(ensureAuthenticated, jobCtrl.getHiredProviders);

router.route('/send/invite')
	// POST /api/job/invite/providers
	.post(ensureAuthenticated, jobCtrl.addInvitee);

router.route('/send/hire')
	// POST /api/job/send/hire
	.post(ensureAuthenticated, jobCtrl.hire);

router.route('/apply')
	// POST /api/job/apply
	.post(ensureAuthenticated,userMakingChangeToOwnProfile,  jobCtrl.apply);
export default router; 