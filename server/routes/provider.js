import express from 'express';
import providerCtrl from '../controllers/provider';
import ensureAuthenticated from '../helpers/ensureAuthenticated';
import config from '../../config/env'
import {userMakingChangeToOwnProfile} from '../helpers/ensureAuthenticated';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/registration')
    // POST /api/providers/registration
    .post(ensureAuthenticated, providerCtrl.register);
router.route('/publish')
    // POST /api/providers/publish
    .post(ensureAuthenticated,userMakingChangeToOwnProfile,providerCtrl.publish);
router.route('/addOrEditFoodItem')
    // Post /api/providers/addOrEditFoodItem
    .post(ensureAuthenticated,userMakingChangeToOwnProfile, providerCtrl.addOrEditFoodItem);
router.route('/remove')
    // Post /api/providers/remove
    .post(ensureAuthenticated, providerCtrl.remove);


export default router;
