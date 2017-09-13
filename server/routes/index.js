import express from 'express';
import userRoutes from './user';
import providerRoutes from './provider';
import locationRoutes from './location';
import queryRoutes from './query';
import orderRoutes from './order';
import foodItemRoutes from './food-item';
import imageUploadRoutes from './image-upload';
import envRoutes from './env';
import deviceRoutes from './device';
import messageRoutes from './message'
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
router.use('/order',orderRoutes);
router.use('/foodItem',foodItemRoutes);
router.use('/upload',imageUploadRoutes);
router.use('/env',envRoutes);
router.use('/device',deviceRoutes);
router.use('/message',messageRoutes)

export default router;
