import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createThread,
  sendMessage,
  getMessages,
  getThreads,
} from '../controllers/message.controller';

const router = Router();

router.post('/thread', authenticate, createThread);
router.post('/:threadId', authenticate, sendMessage);
router.get('/:threadId', authenticate, getMessages);
router.get('/', authenticate, getThreads);

export default router;
