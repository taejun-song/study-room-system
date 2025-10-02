import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getStudyRankings,
  submitExamScore,
  getExamRankings,
  getStudentStats,
  logPomodoroSession,
} from '../controllers/analytics.controller';

const router = Router();

router.get('/ranks/study', authenticate, getStudyRankings);
router.post('/examscore', authenticate, authorize('STUDENT'), submitExamScore);
router.get('/ranks/exam', authenticate, getExamRankings);
router.get('/stats', authenticate, getStudentStats);
router.post('/pomodoro', authenticate, authorize('STUDENT'), logPomodoroSession);

export default router;
