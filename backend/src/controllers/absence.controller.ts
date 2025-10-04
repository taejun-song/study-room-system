import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const createAbsenceRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { date, type, startAt, endAt, reasonText, evidenceUrl } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const request = await prisma.absenceRequest.create({
      data: {
        studentId: userId,
        date: new Date(date),
        type,
        startAt: startAt ? new Date(startAt) : null,
        endAt: endAt ? new Date(endAt) : null,
        reasonText,
        evidenceUrl,
      },
    });

    res.status(201).json({
      message: 'Absence request submitted',
      request,
    });
  } catch (error) {
    console.error('Create absence request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAbsenceRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { studentId, status } = req.query;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    let where: any = {};

    // Handle different roles
    if (req.user?.role === 'STUDENT') {
      where.studentId = userId;
    } else if (req.user?.role === 'PARENT') {
      if (studentId) {
        const link = await prisma.parentLink.findFirst({
          where: { parentId: userId, studentId: studentId as string },
        });
        if (!link) {
          res.status(403).json({ error: 'Not authorized' });
          return;
        }
        where.studentId = studentId;
      } else {
        // Get all linked students' requests
        const links = await prisma.parentLink.findMany({
          where: { parentId: userId },
          select: { studentId: true },
        });
        where.studentId = { in: links.map(l => l.studentId) };
      }
    } else if (req.user?.role === 'MENTOR') {
      // Only show requests from assigned students
      const assignedStudents = await prisma.user.findMany({
        where: { assignedMentorId: userId, role: 'STUDENT' },
        select: { id: true },
      });
      where.studentId = { in: assignedStudents.map(s => s.id) };
    } else if (req.user?.role === 'ADMIN') {
      if (studentId) {
        where.studentId = studentId;
      }
      // Admin sees all if no studentId specified
    }

    if (status) {
      where.status = status;
    }

    const requests = await prisma.absenceRequest.findMany({
      where,
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ requests });
  } catch (error) {
    console.error('Get absence requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const approveAbsence = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;
    const { comment } = req.body;
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const request = await prisma.absenceRequest.findUnique({
      where: { id: requestId },
      include: {
        student: {
          select: {
            id: true,
            assignedMentorId: true,
          },
        },
      },
    });

    if (!request) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }

    const updateData: any = {};

    if (role === 'MENTOR') {
      // Verify mentor is assigned to this student
      if (request.student.assignedMentorId !== userId) {
        res.status(403).json({ error: 'Not the assigned mentor for this student' });
        return;
      }
      updateData.mentorDecision = 'APPROVED';
      updateData.mentorComment = comment;
    } else if (role === 'PARENT') {
      // Verify parent-student link
      const link = await prisma.parentLink.findFirst({
        where: { parentId: userId, studentId: request.studentId },
      });
      if (!link) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }
      updateData.parentDecision = 'APPROVED';
      updateData.parentComment = comment;
    } else {
      res.status(403).json({ error: 'Only mentors and parents can approve' });
      return;
    }

    // Update decision
    const updated = await prisma.absenceRequest.update({
      where: { id: requestId },
      data: updateData,
    });

    // Check if both approved
    if (updated.mentorDecision === 'APPROVED' && updated.parentDecision === 'APPROVED') {
      await prisma.absenceRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          decidedAt: new Date(),
        },
      });
    } else if (
      updated.mentorDecision === 'APPROVED' ||
      updated.parentDecision === 'APPROVED'
    ) {
      await prisma.absenceRequest.update({
        where: { id: requestId },
        data: { status: 'PARTIAL' },
      });
    }

    const final = await prisma.absenceRequest.findUnique({
      where: { id: requestId },
    });

    res.json({
      message: 'Absence approved',
      request: final,
    });
  } catch (error) {
    console.error('Approve absence error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const rejectAbsence = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;
    const { comment } = req.body;
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const request = await prisma.absenceRequest.findUnique({
      where: { id: requestId },
      include: {
        student: {
          select: {
            id: true,
            assignedMentorId: true,
          },
        },
      },
    });

    if (!request) {
      res.status(404).json({ error: 'Request not found' });
      return;
    }

    const updateData: any = { status: 'REJECTED', decidedAt: new Date() };

    if (role === 'MENTOR') {
      // Verify mentor is assigned to this student
      if (request.student.assignedMentorId !== userId) {
        res.status(403).json({ error: 'Not the assigned mentor for this student' });
        return;
      }
      updateData.mentorDecision = 'REJECTED';
      updateData.mentorComment = comment;
    } else if (role === 'PARENT') {
      const link = await prisma.parentLink.findFirst({
        where: { parentId: userId, studentId: request.studentId },
      });
      if (!link) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }
      updateData.parentDecision = 'REJECTED';
      updateData.parentComment = comment;
    } else {
      res.status(403).json({ error: 'Only mentors and parents can reject' });
      return;
    }

    const updated = await prisma.absenceRequest.update({
      where: { id: requestId },
      data: updateData,
    });

    res.json({
      message: 'Absence rejected',
      request: updated,
    });
  } catch (error) {
    console.error('Reject absence error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
