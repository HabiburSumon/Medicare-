import { Router } from 'express';
import { getPatientProfile, updatePatientProfile, getPatientById } from '../controllers/patient.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/profile', authenticate, getPatientProfile);
router.put('/profile', authenticate, updatePatientProfile);
router.get('/:id', authenticate, getPatientById);
router.put('/:id', authenticate, updatePatientProfile);

export default router;