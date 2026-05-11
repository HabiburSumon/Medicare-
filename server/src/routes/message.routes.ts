import { Router } from 'express';
import { getMessages, sendMessage, getConversations } from '../controllers/message.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/conversations', authenticate, getConversations);
router.get('/:receiverId', authenticate, getMessages);
router.post('/', authenticate, sendMessage);

export default router;