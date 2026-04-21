import { Router } from 'express';
import { createReview, getDoctorReviews, getAllReviews, moderateReview } from '../controllers/review.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize('patient'), createReview);
router.get('/doctor/:doctorId', getDoctorReviews);
router.get('/all', authenticate, authorize('admin'), getAllReviews);
router.put('/:id/moderate', authenticate, authorize('admin'), moderateReview);

export default router;