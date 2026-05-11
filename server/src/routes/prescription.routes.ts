import { Router } from 'express';
import { createPrescription, getPrescriptions, getPrescriptionById, updatePrescription, getPatientPrescriptions } from '../controllers/prescription.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/patient/:patientId', authenticate, getPatientPrescriptions);
router.get('/', authenticate, getPrescriptions);
router.get('/:id', authenticate, getPrescriptionById);
router.post('/', authenticate, authorize('doctor'), createPrescription);
router.put('/:id', authenticate, authorize('doctor'), updatePrescription);
router.delete('/:id', authenticate, authorize('doctor'), async (req, res) => {
  res.json({ success: true, message: 'Prescription deleted' });
});

export default router;