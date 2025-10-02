import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getStudyRankings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period = 'weekly' } = req.query;

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'daily':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'monthly':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

    // Get all students with their attendance
    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        status: 'ACTIVE',
      },
      include: {
        attendanceSessions: {
          where: {
            startAt: { gte: startDate },
            endAt: { not: null },
          },
        },
      },
    });

    // Calculate total study time for each student
    const rankings = students
      .map((student) => {
        const totalMinutes = student.attendanceSessions.reduce((sum, session) => {
          if (session.endAt) {
            const duration = Math.floor(
              (session.endAt.getTime() - session.startAt.getTime()) / 60000
            );
            return sum + duration;
          }
          return sum;
        }, 0);

        return {
          studentId: student.id,
          name: student.name,
          totalMinutes,
          totalHours: Math.floor(totalMinutes / 60),
          sessionCount: student.attendanceSessions.length,
        };
      })
      .filter((r) => r.totalMinutes > 0)
      .sort((a, b) => b.totalMinutes - a.totalMinutes)
      .slice(0, 50); // Top 50

    res.json({ period, rankings });
  } catch (error) {
    console.error('Get study rankings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const submitExamScore = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { examName, examDate, subjectScores, total, proofUrl } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const score = await prisma.examScore.create({
      data: {
        studentId: userId,
        examName,
        examDate: new Date(examDate),
        subjectScores,
        total,
        proofUrl,
      },
    });

    res.status(201).json({
      message: 'Exam score submitted',
      score,
    });
  } catch (error) {
    console.error('Submit exam score error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getExamRankings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { examName } = req.query;

    if (!examName) {
      res.status(400).json({ error: 'examName is required' });
      return;
    }

    const scores = await prisma.examScore.findMany({
      where: {
        examName: examName as string,
      },
      include: {
        student: {
          select: { id: true, name: true },
        },
      },
      orderBy: { total: 'desc' },
    });

    const rankings = scores.map((score, index) => ({
      rank: index + 1,
      studentId: score.student.id,
      studentName: score.student.name,
      total: score.total,
      subjectScores: score.subjectScores,
      examDate: score.examDate,
    }));

    res.json({ examName, rankings });
  } catch (error) {
    console.error('Get exam rankings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStudentStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { studentId } = req.query;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    let targetStudentId = userId;

    // Authorization check
    if (studentId && studentId !== userId) {
      if (req.user?.role === 'PARENT') {
        const link = await prisma.parentLink.findFirst({
          where: { parentId: userId, studentId: studentId as string },
        });
        if (!link) {
          res.status(403).json({ error: 'Not authorized' });
          return;
        }
        targetStudentId = studentId as string;
      } else if (['ADMIN', 'MENTOR'].includes(req.user?.role || '')) {
        targetStudentId = studentId as string;
      }
    }

    // Get attendance stats
    const sessions = await prisma.attendanceSession.findMany({
      where: {
        studentId: targetStudentId,
        endAt: { not: null },
      },
      orderBy: { startAt: 'desc' },
      take: 100,
    });

    const totalMinutes = sessions.reduce((sum, session) => {
      if (session.endAt) {
        return sum + Math.floor((session.endAt.getTime() - session.startAt.getTime()) / 60000);
      }
      return sum;
    }, 0);

    // Get study logs (Pomodoro)
    const studyLogs = await prisma.studyLog.findMany({
      where: { studentId: targetStudentId },
      orderBy: { loggedAt: 'desc' },
      take: 100,
    });

    const pomodoroMinutes = studyLogs.reduce((sum, log) => sum + log.minutes, 0);

    // Subject breakdown
    const subjectBreakdown = studyLogs.reduce((acc: any, log) => {
      if (!acc[log.subject]) {
        acc[log.subject] = 0;
      }
      acc[log.subject] += log.minutes;
      return acc;
    }, {});

    res.json({
      studentId: targetStudentId,
      attendance: {
        totalMinutes,
        totalHours: Math.floor(totalMinutes / 60),
        sessionCount: sessions.length,
      },
      pomodoro: {
        totalMinutes: pomodoroMinutes,
        totalHours: Math.floor(pomodoroMinutes / 60),
        sessionCount: studyLogs.length,
      },
      subjectBreakdown,
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const logPomodoroSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { subject, chapter, minutes } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const log = await prisma.studyLog.create({
      data: {
        studentId: userId,
        subject,
        chapter,
        minutes,
        source: 'POMODORO',
      },
    });

    res.status(201).json({
      message: 'Pomodoro session logged',
      log,
    });
  } catch (error) {
    console.error('Log pomodoro error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
