import { Router } from 'express';
import { analyzeSymptoms } from '../controllers/symptom.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/analyze', authenticate, analyzeSymptoms);

export default router;