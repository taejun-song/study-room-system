import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const createThread = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check if thread already exists
    const existing = await prisma.messageThread.findFirst({
      where: { userId },
    });

    if (existing) {
      res.json({ thread: existing });
      return;
    }

    // Create new thread
    const thread = await prisma.messageThread.create({
      data: { userId },
    });

    res.status(201).json({ thread });
  } catch (error) {
    console.error('Create thread error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { threadId } = req.params;
    const { text, attachments, category } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify thread access
    const thread = await prisma.messageThread.findUnique({
      where: { id: threadId },
    });

    if (!thread) {
      res.status(404).json({ error: 'Thread not found' });
      return;
    }

    // Only thread owner or admin can send messages
    if (thread.userId !== userId && req.user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const message = await prisma.message.create({
      data: {
        threadId,
        senderId: userId,
        text,
        attachments: attachments || [],
        category,
      },
      include: {
        sender: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { threadId } = req.params;
    const { limit = '50' } = req.query;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify thread access
    const thread = await prisma.messageThread.findUnique({
      where: { id: threadId },
    });

    if (!thread) {
      res.status(404).json({ error: 'Thread not found' });
      return;
    }

    if (thread.userId !== userId && req.user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    const messages = await prisma.message.findMany({
      where: { threadId },
      include: {
        sender: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: parseInt(limit as string),
    });

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getThreads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    let threads;

    if (req.user?.role === 'ADMIN') {
      // Admin sees all threads
      threads = await prisma.messageThread.findMany({
        include: {
          user: {
            select: { id: true, name: true, role: true },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Regular users see only their thread
      threads = await prisma.messageThread.findMany({
        where: { userId },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });
    }

    res.json({ threads });
  } catch (error) {
    console.error('Get threads error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
