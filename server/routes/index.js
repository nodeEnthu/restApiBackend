import express from 'express';
import userRoutes from './user';
import providerRoutes from './provider';
import locationRoutes from './location';
import queryRoutes from './query';
import emailRoutes from './send-email';
import foodItemRoutes from './food-item';

const router = express.Router();	// eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
	res.send('OK')
);

// mount user routes at /users
router.use('/users', userRoutes);
// mount provider routes at /providers
router.use('/providers', providerRoutes);

router.use('/locations',locationRoutes);
router.use('/query',queryRoutes);
router.use('/emails',emailRoutes);
router.use('/foodItem',foodItemRoutes);


export default router;
