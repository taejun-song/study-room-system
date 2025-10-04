import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getLinkedChildren = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const links = await prisma.parentLink.findMany({
      where: { parentId: userId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const children = links.map(link => link.student);

    res.json({ children });
  } catch (error) {
    console.error('Get linked children error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
