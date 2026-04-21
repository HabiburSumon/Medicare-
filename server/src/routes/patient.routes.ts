import { Router } from 'express';
import { getPatientProfile, createPatientProfile, updatePatientProfile, getAllPatients } from '../controllers/patient.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/profile', authenticate, authorize('patient'), getPatientProfile);
router.post('/profile', authenticate, authorize('patient'), createPatientProfile);
router.put('/profile', authenticate, authorize('patient'), updatePatientProfile);
router.get('/all', authenticate, authorize('admin'), getAllPatients);

export default router;