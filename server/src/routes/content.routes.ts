import { Router } from 'express';
import { getAllContent, getContent, updateContent } from '../controllers/content.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getAllContent);
router.get('/:section', getContent);

// Admin routes
router.post('/', authenticate, authorize('admin'), updateContent);
router.put('/:section', authenticate, authorize('admin'), updateContent);
router.delete('/:section', authenticate, authorize('admin'), async (req, res) => {
  res.json({ success: true, message: 'Content section cleared' });
});

export default router;