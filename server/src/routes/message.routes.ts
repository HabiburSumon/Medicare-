import { Router } from 'express';
import { getMessages, sendMessage, getConversations, uploadMessageFile, upload } from '../controllers/message.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/conversations', authenticate, getConversations);
router.post('/upload', authenticate, upload.single('file'), uploadMessageFile);
router.post('/', authenticate, sendMessage);
router.get('/:receiverId', authenticate, getMessages);

export default router;