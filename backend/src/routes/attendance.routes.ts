import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { checkin, checkout, getCalendar, editSession } from '../controllers/attendance.controller';

const router = Router();

router.post('/checkin', authenticate, authorize('STUDENT'), checkin);
router.post('/checkout', authenticate, authorize('STUDENT'), checkout);
router.get('/calendar', authenticate, getCalendar);
router.put('/session/:sessionId', authenticate, authorize('ADMIN'), editSession);

export default router;
