import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  createAbsenceRequest,
  getAbsenceRequests,
  approveAbsence,
  rejectAbsence,
} from '../controllers/absence.controller';

const router = Router();

router.post('/', authenticate, authorize('STUDENT'), createAbsenceRequest);
router.get('/', authenticate, getAbsenceRequests);
router.post('/:requestId/approve', authenticate, authorize('MENTOR', 'PARENT'), approveAbsence);
router.post('/:requestId/reject', authenticate, authorize('MENTOR', 'PARENT'), rejectAbsence);

export default router;
