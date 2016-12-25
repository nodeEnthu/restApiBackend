import express from 'express';
import imageUploadCtrl from '../controllers/image-upload';
import ensureAuthenticated, {checkLogin} from '../helpers/ensureAuthenticated';
const router = express.Router(); // eslint-disable-line new-cap

router.route('/sign')
	// POST /api/upload/sign
	.post(imageUploadCtrl.sign);

export default router; 