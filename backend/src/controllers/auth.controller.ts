import { Request, Response } from 'express';
import prisma from '../config/database';
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken } from '../utils/auth';

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, email, password, role, joinCode } = req.body;

    // Validate join code
    const validJoinCode = await prisma.joinCode.findUnique({
      where: { code: joinCode },
    });

    if (!validJoinCode) {
      res.status(400).json({ error: 'Invalid join code' });
      return;
    }

    if (validJoinCode.roleScope !== role) {
      res.status(400).json({ error: 'Join code does not match role' });
      return;
    }

    if (validJoinCode.expiresAt && validJoinCode.expiresAt < new Date()) {
      res.status(400).json({ error: 'Join code has expired' });
      return;
    }

    if (validJoinCode.maxUses && validJoinCode.usedCount >= validJoinCode.maxUses) {
      res.status(400).json({ error: 'Join code has reached maximum uses' });
      return;
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email,
        passwordHash,
        role,
      },
    });

    // Create mentor profile if role is MENTOR
    if (role === 'MENTOR') {
      await prisma.mentorProfile.create({
        data: {
          userId: user.id,
          subjects: [], // Empty by default, can be updated later
        },
      });
    }

    // Update join code usage
    await prisma.joinCode.update({
      where: { id: validJoinCode.id },
      data: { usedCount: { increment: 1 } },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      res.status(403).json({ error: 'Account is not active' });
      return;
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);

    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(400).json({ error: 'Refresh token required' });
      return;
    }

    const decoded = verifyToken(token) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.status !== 'ACTIVE') {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const newRefreshToken = generateRefreshToken(user.id);

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};
