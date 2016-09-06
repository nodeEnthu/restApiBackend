import express from 'express';
import providerCtrl from '../controllers/provider';
import ensureAuthenticated from '../helpers/ensureAuthenticated';
import config from '../../config/env'
const router = express.Router(); // eslint-disable-line new-cap

router.route('/registration')
    // POST /api/providers/registration
    .post(ensureAuthenticated, providerCtrl.register);
router.route('/addOrEditFoodItem')
    // Post /api/providers/addOrEditFoodItem
    .post(ensureAuthenticated, providerCtrl.addOrEditFoodItem);


if (config.env === 'test') {
    router.route('/test/registration')
        // POST /api/providers/test/registration
        .post(ensureAuthenticated, providerCtrl.testRegisteration);
}
export default router;
