import express from 'express';
import locationCtrl from '../controllers/location';
import ensureAuthenticated, {checkLogin} from '../helpers/ensureAuthenticated';
const router = express.Router(); // eslint-disable-line new-cap

router.route('/zipcodeTypeAssist')
   	/** GET /api/locations/zipcodeTypeAssist - Get list of users */
    .get(locationCtrl.zipcodeTypeAssist);

router.route('/address')
   	/** GET /api/locations/address - Get adress given latitude and longitude */
    .get(checkLogin,locationCtrl.address)

router.route('/addressTypeAssist')
   	/** GET /api/locations/addressTypeAssist - Get list of predictions for addresses */
    .get(locationCtrl.addressTypeAssist);

export default router;
