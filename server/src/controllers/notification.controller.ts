import { Response } from 'express';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';

export const createNotification = async (data: {
  recipientId: number;
  senderId?: number;
  type: string;
  title: string;
  message: string;
  data?: string;
  link?: string;
}): Promise<Notification> => {
  return Notification.create({
    recipientId: data.recipientId,
    senderId: data.senderId || null,
    type: data.type,
    title: data.title,
    message: data.message,
    data: data.data || '{}',
    link: data.link || '',
  });
};

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.findAll({
      where: { recipientId: req.userId },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });
    res.json({ success: true, data: notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.update({ isRead: true }, { where: { recipientId: req.userId, id: req.params.id } });
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.update({ isRead: true }, { where: { recipientId: req.userId, isRead: false } });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const count = await Notification.count({ where: { recipientId: req.userId, isRead: false } });
    res.json({ success: true, data: { count } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};