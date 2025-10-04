import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getLinkedChildren } from '../controllers/parent.controller';

const router = Router();

router.get('/children', authenticate, authorize('PARENT'), getLinkedChildren);

export default router;
