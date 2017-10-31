import express from 'express';
import jobCtrl from '../controllers/job';
import ensureAuthenticated, {userMakingChangeToOwnProfile} from '../helpers/ensureAuthenticated';
const router = express.Router(); // eslint-disable-line new-cap

router.route('/create')
	// POST /api/job/create
	.post(ensureAuthenticated, jobCtrl.create);

router.route('/:id')
	// GET /api/job/:id
	.get(ensureAuthenticated, jobCtrl.get);

router.route('/list/all')
	// GET /api/job/list
	.get(ensureAuthenticated, jobCtrl.list);

router.route('/invite/providers')
	// GET /api/job/invite/providers
	.get(ensureAuthenticated, jobCtrl.inviteProviders);


router.route('/get/applicants')
	// GET /api/job/get/applicants
	.get(ensureAuthenticated, jobCtrl.getApplicants);

router.route('/get/closeby')
	// GET /api/job/get/closeby
	.get(ensureAuthenticated, jobCtrl.findJobsCloseBy);

router.route('/get/hirees')
	// GET /api/job/get/hirees
	.get(ensureAuthenticated, jobCtrl.getHiredProviders);

router.route('/send/invite')
	// POST /api/job/send/invite
	.post(ensureAuthenticated, jobCtrl.addInvitee);

router.route('/send/hire')
	// POST /api/job/send/hire
	.post(ensureAuthenticated, jobCtrl.hire);

router.route('/apply')
	// POST /api/job/apply
	.post(ensureAuthenticated,userMakingChangeToOwnProfile,  jobCtrl.apply);

export default router; 