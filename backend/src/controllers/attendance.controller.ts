import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const checkin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { source = 'MOBILE' } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check if there's an active session (no endAt)
    const activeSession = await prisma.attendanceSession.findFirst({
      where: {
        studentId: userId,
        endAt: null,
      },
    });

    if (activeSession) {
      res.status(400).json({ error: 'Already checked in' });
      return;
    }

    // Create new session
    const session = await prisma.attendanceSession.create({
      data: {
        studentId: userId,
        startAt: new Date(),
        source,
      },
    });

    res.status(201).json({
      message: 'Checked in successfully',
      session: {
        id: session.id,
        startAt: session.startAt,
      },
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Find active session
    const activeSession = await prisma.attendanceSession.findFirst({
      where: {
        studentId: userId,
        endAt: null,
      },
    });

    if (!activeSession) {
      res.status(400).json({ error: 'No active check-in found' });
      return;
    }

    // Update session with endAt
    const session = await prisma.attendanceSession.update({
      where: { id: activeSession.id },
      data: { endAt: new Date() },
    });

    const duration = Math.floor((session.endAt!.getTime() - session.startAt.getTime()) / 60000); // minutes

    res.json({
      message: 'Checked out successfully',
      session: {
        id: session.id,
        startAt: session.startAt,
        endAt: session.endAt,
        durationMinutes: duration,
      },
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCalendar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { studentId, from, to } = req.query;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Determine which student's calendar to fetch
    let targetStudentId = userId;

    if (studentId && req.user?.role === 'PARENT') {
      // Verify parent-student link
      const link = await prisma.parentLink.findFirst({
        where: {
          parentId: userId,
          studentId: studentId as string,
        },
      });

      if (!link) {
        res.status(403).json({ error: 'Not authorized to view this student' });
        return;
      }

      targetStudentId = studentId as string;
    } else if (studentId && ['ADMIN', 'MENTOR'].includes(req.user?.role || '')) {
      targetStudentId = studentId as string;
    }

    // Build date filter
    const dateFilter: any = {};
    if (from) {
      dateFilter.gte = new Date(from as string);
    }
    if (to) {
      dateFilter.lte = new Date(to as string);
    }

    const sessions = await prisma.attendanceSession.findMany({
      where: {
        studentId: targetStudentId,
        ...(Object.keys(dateFilter).length > 0 && { startAt: dateFilter }),
      },
      orderBy: { startAt: 'desc' },
    });

    // Group by date and calculate totals
    const calendar = sessions.reduce((acc: any, session) => {
      const date = session.startAt.toISOString().split('T')[0];
      
      if (!acc[date]) {
        acc[date] = {
          date,
          sessions: [],
          totalMinutes: 0,
        };
      }

      const duration = session.endAt 
        ? Math.floor((session.endAt.getTime() - session.startAt.getTime()) / 60000)
        : 0;

      acc[date].sessions.push({
        id: session.id,
        startAt: session.startAt,
        endAt: session.endAt,
        durationMinutes: duration,
        source: session.source,
      });

      acc[date].totalMinutes += duration;

      return acc;
    }, {});

    res.json({
      calendar: Object.values(calendar),
    });
  } catch (error) {
    console.error('Get calendar error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const editSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { startAt, endAt, notes } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Only ADMIN can edit sessions
    if (req.user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'Only admins can edit sessions' });
      return;
    }

    const session = await prisma.attendanceSession.update({
      where: { id: sessionId },
      data: {
        startAt: startAt ? new Date(startAt) : undefined,
        endAt: endAt ? new Date(endAt) : undefined,
        notes,
        editedBy: userId,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'EDIT_ATTENDANCE',
        entityType: 'AttendanceSession',
        entityId: sessionId,
        payload: { startAt, endAt, notes },
      },
    });

    res.json({
      message: 'Session updated successfully',
      session,
    });
  } catch (error) {
    console.error('Edit session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
