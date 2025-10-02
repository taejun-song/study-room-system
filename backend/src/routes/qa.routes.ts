import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getMentors,
  bookQA,
  acceptBooking,
  answerQuestion,
  getQAHistory,
} from '../controllers/qa.controller';

const router = Router();

router.get('/mentors', authenticate, getMentors);
router.post('/book', authenticate, authorize('STUDENT'), bookQA);
router.post('/:bookingId/accept', authenticate, authorize('MENTOR'), acceptBooking);
router.post('/:bookingId/answer', authenticate, authorize('MENTOR'), answerQuestion);
router.get('/history', authenticate, getQAHistory);

export default router;
