import express from 'express';
import locationCtrl from '../controllers/location';
import ensureAuthenticated from '../helpers/ensureAuthenticated';
const router = express.Router(); // eslint-disable-line new-cap

router.route('/zipcodeTypeAssist')
   	/** GET /api/locations/zipcodeTypeAssist - Get list of users */
    .get(locationCtrl.zipcodeTypeAssist)

export default router;
