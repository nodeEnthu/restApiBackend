import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import userCtrl from '../controllers/user';
import ensureAuthenticated, {checkLogin} from '../helpers/ensureAuthenticated';
const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
   	/** GET /api/users - Get list of users */
    .get(userCtrl.list)

router.route('/me')
	/** GET  /api/users/me-  give the details of logged in person*/
    .get(ensureAuthenticated,userCtrl.load)

router.route('/signUp')
    /** POST /api/users/signUp - Create new user */
    .post(validate(paramValidation.createUser), userCtrl.create);

router.route('/:userId')
    /** GET /api/users/:userId - Get user */
    .get(checkLogin,userCtrl.get)

/** PUT /api/users/:userId - Update user */
.put(validate(paramValidation.updateUser), userCtrl.update)

/** DELETE /api/users/:userId - Delete user */
.delete(userCtrl.remove);

export default router;
