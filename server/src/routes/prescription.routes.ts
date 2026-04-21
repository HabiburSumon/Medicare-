import { Router } from 'express';
import { createPrescription, getPrescriptions, getPrescriptionById, uploadTestResult, testResultUpload, getPatientHistory } from '../controllers/prescription.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize('doctor'), createPrescription);
router.get('/', authenticate, getPrescriptions);
router.get('/patient/:patientId/history', authenticate, authorize('doctor'), getPatientHistory);
router.get('/:id', authenticate, getPrescriptionById);
router.post('/:id/test-results', authenticate, authorize('patient', 'doctor'), testResultUpload.single('file'), uploadTestResult);

export default router;
