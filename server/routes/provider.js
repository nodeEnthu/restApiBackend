import express from 'express';
import providerCtrl from '../controllers/provider';
import config from '../../config/env'
import ensureAuthenticated, {userMakingChangeToOwnProfile} from '../helpers/ensureAuthenticated';

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
router.route('/get/job/invites')
    // Post /api/providers/remove
    .get(ensureAuthenticated, providerCtrl.getAllInvitedJobs);
router.route('/check/unique/name')
    // Post /api/providers/check/unique/name
    .get(providerCtrl.checkUniqueProviderName);

export default router;
