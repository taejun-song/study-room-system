import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getMentors = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { subject } = req.query;

    const where: any = {
      role: 'MENTOR',
      status: 'ACTIVE',
    };

    const mentors = await prisma.user.findMany({
      where,
      include: {
        mentorProfile: true,
      },
    });

    // Filter by subject if provided
    let filtered = mentors.filter((m) => m.mentorProfile);

    if (subject) {
      filtered = filtered.filter((m) =>
        m.mentorProfile?.subjects.includes(subject as string)
      );
    }

    const result = filtered.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      university: m.mentorProfile?.university,
      major: m.mentorProfile?.major,
      bio: m.mentorProfile?.bio,
      subjects: m.mentorProfile?.subjects,
      rating: m.mentorProfile?.ratingAvg,
    }));

    res.json({ mentors: result });
  } catch (error) {
    console.error('Get mentors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const bookQA = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { mentorId, subject, chapter, summary, images, slotStart, slotEnd } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check if mentor exists and is available
    const mentor = await prisma.user.findFirst({
      where: {
        id: mentorId,
        role: 'MENTOR',
        status: 'ACTIVE',
      },
    });

    if (!mentor) {
      res.status(404).json({ error: 'Mentor not found' });
      return;
    }

    // Check for slot conflicts
    const conflict = await prisma.qABooking.findFirst({
      where: {
        mentorId,
        status: { in: ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS'] },
        OR: [
          {
            AND: [
              { slotStart: { lte: new Date(slotStart) } },
              { slotEnd: { gt: new Date(slotStart) } },
            ],
          },
          {
            AND: [
              { slotStart: { lt: new Date(slotEnd) } },
              { slotEnd: { gte: new Date(slotEnd) } },
            ],
          },
        ],
      },
    });

    if (conflict) {
      res.status(400).json({ error: 'Time slot is already booked' });
      return;
    }

    const booking = await prisma.qABooking.create({
      data: {
        studentId: userId,
        mentorId,
        subject,
        chapter,
        summary,
        images: images || [],
        slotStart: new Date(slotStart),
        slotEnd: new Date(slotEnd),
      },
      include: {
        mentor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json({
      message: 'Q&A session booked',
      booking,
    });
  } catch (error) {
    console.error('Book Q&A error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const acceptBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const booking = await prisma.qABooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (booking.mentorId !== userId) {
      res.status(403).json({ error: 'Not your booking' });
      return;
    }

    if (booking.status !== 'REQUESTED') {
      res.status(400).json({ error: 'Booking already processed' });
      return;
    }

    const updated = await prisma.qABooking.update({
      where: { id: bookingId },
      data: { status: 'ACCEPTED' },
    });

    res.json({
      message: 'Booking accepted',
      booking: updated,
    });
  } catch (error) {
    console.error('Accept booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const answerQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const { answerText, answerFiles } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const booking = await prisma.qABooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (booking.mentorId !== userId) {
      res.status(403).json({ error: 'Not your booking' });
      return;
    }

    const updated = await prisma.qABooking.update({
      where: { id: bookingId },
      data: {
        status: 'COMPLETED',
        answerText,
        answerFiles: answerFiles || [],
      },
    });

    res.json({
      message: 'Answer submitted',
      booking: updated,
    });
  } catch (error) {
    console.error('Answer question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getQAHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { subject, chapter } = req.query;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const where: any = {
      OR: [{ studentId: userId }, { mentorId: userId }],
      status: 'COMPLETED',
    };

    if (subject) where.subject = subject;
    if (chapter) where.chapter = chapter;

    const history = await prisma.qABooking.findMany({
      where,
      include: {
        student: { select: { id: true, name: true } },
        mentor: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ history });
  } catch (error) {
    console.error('Get Q&A history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
