import { Router } from 'express';
import { getMedicines, getMedicineById, createMedicine, updateMedicine, deleteMedicine, getCategories } from '../controllers/medicine.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getMedicines);
router.get('/categories', getCategories);
router.get('/:id', getMedicineById);
router.post('/', authenticate, authorize('admin', 'pharmacist'), createMedicine);
router.put('/:id', authenticate, authorize('admin', 'pharmacist'), updateMedicine);
router.delete('/:id', authenticate, authorize('admin', 'pharmacist'), deleteMedicine);

export default router;