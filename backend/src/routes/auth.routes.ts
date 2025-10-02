import { Router } from 'express';
import { signup, login, refreshToken } from '../controllers/auth.controller';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refreshToken);

export default router;
