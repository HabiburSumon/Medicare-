import { Router } from 'express';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../controllers/notification.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getNotifications);
router.get('/unread-count', authenticate, getUnreadCount);
router.put('/mark-all/read', authenticate, markAllAsRead);
router.put('/:id/read', authenticate, markAsRead);
router.delete('/:id', authenticate, async (req, res) => {
  res.json({ success: true, message: 'Notification deleted' });
});
router.get('/admin/all', authenticate, authorize('admin'), getNotifications);

export default router;