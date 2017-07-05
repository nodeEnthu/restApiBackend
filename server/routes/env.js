import express from 'express';
import envCtrl from '../controllers/env';
import ensureAuthenticated, {checkLogin} from '../helpers/ensureAuthenticated';
const router = express.Router(); // eslint-disable-line new-cap

router.route('/envVars')
	// GET /api/env/envVars
	.get(envCtrl.envVars);

export default router; 