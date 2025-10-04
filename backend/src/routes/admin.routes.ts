import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  createJoinCode,
  getJoinCodes,
  linkParentStudent,
  createAnnouncement,
  getAnnouncements,
  getUsers,
  updateUserStatus,
  assignMentor,
  getStudentAssignments,
} from '../controllers/admin.controller';

const router = Router();

router.post('/joincode', authenticate, authorize('ADMIN'), createJoinCode);
router.get('/joincode', authenticate, authorize('ADMIN'), getJoinCodes);
router.post('/link-parent', authenticate, authorize('ADMIN'), linkParentStudent);
router.post('/assign-mentor', authenticate, authorize('ADMIN'), assignMentor);
router.get('/students/:studentId/assignments', authenticate, authorize('ADMIN'), getStudentAssignments);
router.post('/announcement', authenticate, authorize('ADMIN'), createAnnouncement);
router.get('/announcement', authenticate, getAnnouncements);
router.get('/users', authenticate, authorize('ADMIN'), getUsers);
router.put('/users/:userId/status', authenticate, authorize('ADMIN'), updateUserStatus);

export default router;
