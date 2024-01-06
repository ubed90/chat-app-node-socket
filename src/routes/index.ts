import express from 'express';

// * Application routes
import authRoutes from './auth'

const router = express.Router();


router.use('/auth', authRoutes);

export default router;