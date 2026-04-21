import { Router } from 'express';
import { getMyNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification, getAllNotifications } from '../controllers/notification.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getMyNotifications);
router.get('/unread-count', authenticate, getUnreadCount);
router.put('/mark-all/read', authenticate, markAllAsRead);
router.put('/:id/read', authenticate, markAsRead);
router.delete('/:id', authenticate, deleteNotification);
router.get('/admin/all', authenticate, authorize('admin'), getAllNotifications);

export default router;