import { Router } from 'express';
import { getAllContent, getSectionContent, upsertContent, deleteContent, seedContent } from '../controllers/content.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getAllContent);
router.get('/:section', getSectionContent);

// Admin routes
router.post('/', authenticate, authorize('admin'), upsertContent);
router.post('/seed', authenticate, authorize('admin'), seedContent);
router.delete('/:section', authenticate, authorize('admin'), deleteContent);

export default router;