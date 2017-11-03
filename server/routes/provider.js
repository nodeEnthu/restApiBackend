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

router.route('/email/promo')
    // Post /api/providers/email/promo
    .get(providerCtrl.registerEmailSentProviderPromotion);

router.route('/analytics/provider/promo/click')
    // Post /api/providers/analytics/provider/promo/click
    .post(providerCtrl.providerPromoEmailClickAnalytics);

router.route('/analytics/profile/started')
    // Post /api/providers/analytics/profile/started
    .post(providerCtrl.providerEnrollmentStartedAnalytics);

router.route('/analytics/foodItem/started')
    // Post /api/providers/analytics/foodItem/started
    .post(providerCtrl.foodItemEnrollmentStartedAnalytics);

router.route('/analytics/publish/started')
    // Post /api/providers/analytics/publish/started
    .post(providerCtrl.publishStartedAnalytics);

export default router;
