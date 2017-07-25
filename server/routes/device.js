import express from 'express';
import deviceCtrl from '../controllers/device';
import ensureAuthenticated, {userMakingChangeToOwnProfile} from '../helpers/ensureAuthenticated';

const router = express.Router();
router.route('/register')
	// POST /api/device/register
	.post(ensureAuthenticated,deviceCtrl.register);
router.route(ensureAuthenticated,'/deregister')
	// POST /api/device/deregister
	.post(deviceCtrl.deregister);

export default router; 