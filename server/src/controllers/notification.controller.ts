import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Notification from '../models/Notification';

export const getMyNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const [notifications, unreadCount, total] = await Promise.all([
      Notification.find({ recipient: userId }).populate('sender', 'name email role').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments({ recipient: userId, isRead: false }),
      Notification.countDocuments({ recipient: userId }),
    ]);
    res.json({ data: notifications, unreadCount, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const unreadCount = await Notification.countDocuments({ recipient: req.userId, isRead: false });
    res.json({ unreadCount });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const notification = await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.userId }, { isRead: true }, { new: true });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    await Notification.updateMany({ recipient: req.userId, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.userId });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Notification deleted' });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const getAllNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      Notification.find().populate('recipient', 'name email role').populate('sender', 'name email role').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(),
    ]);
    res.json({ data: notifications, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error: any) { res.status(500).json({ message: error.message }); }
};

export const createNotification = async (data: { recipient: any; sender?: any; type: string; title: string; message: string; data?: any; link?: string; }) => {
  try { return await Notification.create(data); } catch (error) { console.error('Failed to create notification:', error); return null; }
};