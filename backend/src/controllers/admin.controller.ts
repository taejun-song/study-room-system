import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

export const createJoinCode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { roleScope, centerId, expiresAt, maxUses } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Generate random code
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();

    const joinCode = await prisma.joinCode.create({
      data: {
        code,
        roleScope,
        centerId,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxUses,
        createdBy: userId,
      },
    });

    res.status(201).json({
      message: 'Join code created',
      joinCode,
    });
  } catch (error) {
    console.error('Create join code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getJoinCodes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { roleScope } = req.query;

    const where: any = {};
    if (roleScope) where.roleScope = roleScope;

    const codes = await prisma.joinCode.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ joinCodes: codes });
  } catch (error) {
    console.error('Get join codes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const linkParentStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { parentId, studentId } = req.body;

    // Verify parent and student exist
    const parent = await prisma.user.findFirst({
      where: { id: parentId, role: 'PARENT' },
    });

    const student = await prisma.user.findFirst({
      where: { id: studentId, role: 'STUDENT' },
    });

    if (!parent || !student) {
      res.status(404).json({ error: 'Parent or student not found' });
      return;
    }

    // Check if link exists
    const existing = await prisma.parentLink.findFirst({
      where: { parentId, studentId },
    });

    if (existing) {
      res.status(400).json({ error: 'Link already exists' });
      return;
    }

    const link = await prisma.parentLink.create({
      data: { parentId, studentId },
    });

    res.status(201).json({
      message: 'Parent-student link created',
      link,
    });
  } catch (error) {
    console.error('Link parent-student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, body, pinned, audienceScope } = req.body;

    const announcement = await prisma.announcement.create({
      data: {
        title,
        body,
        pinned: pinned || false,
        audienceScope: audienceScope || [],
      },
    });

    res.status(201).json({
      message: 'Announcement created',
      announcement,
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAnnouncements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [
          { audienceScope: { isEmpty: true } },
          { audienceScope: { has: role } },
        ],
      },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({ announcements });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, status } = req.query;

    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: req.user!.userId,
        action: 'UPDATE_USER_STATUS',
        entityType: 'User',
        entityId: userId,
        payload: { status },
      },
    });

    res.json({
      message: 'User status updated',
      user,
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
