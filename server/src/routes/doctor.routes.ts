import { Router } from 'express';
import { getAllDoctors, getDoctorById, getDoctorProfile, createDoctorProfile, updateDoctorProfile, getSpecializations } from '../controllers/doctor.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getAllDoctors);
router.get('/specializations', getSpecializations);
router.get('/profile', authenticate, authorize('doctor'), getDoctorProfile);
router.post('/profile', authenticate, authorize('doctor'), createDoctorProfile);
router.put('/profile', authenticate, authorize('doctor'), updateDoctorProfile);
router.get('/:id', getDoctorById);

export default router;