import express from 'express';
import locationCtrl from '../controllers/location';
import ensureAuthenticated, {checkLogin} from '../helpers/ensureAuthenticated';
const router = express.Router(); // eslint-disable-line new-cap

router.route('/zipcodeTypeAssist')
   	/** GET /api/locations/zipcodeTypeAssist - Get list of users */
    .get(locationCtrl.zipcodeTypeAssist);

router.route('/address')
   	/** GET /api/locations/address - Get adress given latitude and longitude */
    .get(locationCtrl.address)

router.route('/addressTypeAssist')
   	/** GET /api/locations/addressTypeAssist - Get list of predictions for addresses */
    .get(locationCtrl.addressTypeAssist);

router.route('/registerMostRecentSearchLocation')
   	/** GET /api/locations/registerMostRecentSearchLocation - Register location for the person */
    .get(ensureAuthenticated,locationCtrl.registerMostRecentSearchLocation);
router.route('/calcDistance')
   	/** GET /api/locations/calcDistance - Calculate distance */
    .get(locationCtrl.calcDistance);


export default router;
