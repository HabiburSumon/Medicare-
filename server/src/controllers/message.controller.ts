import { Response } from 'express';
import { Op } from 'sequelize';
import Message from '../models/Message';
import { AuthRequest } from '../middleware/auth';

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const otherUserId = req.params.userId;
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: req.userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: req.userId },
        ],
      },
      order: [['createdAt', 'ASC']],
      limit: 200,
    });
    // Mark unread messages as read
    await Message.update(
      { isRead: true },
      { where: { senderId: otherUserId, receiverId: req.userId, isRead: false } }
    );
    res.json({ success: true, data: messages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { receiverId, content, messageType = 'text', fileUrl } = req.body;
    const message = await Message.create({
      senderId: req.userId!,
      receiverId,
      content,
      messageType,
      fileUrl: fileUrl || '',
    });
    res.status(201).json({ success: true, data: message });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get distinct conversation partners
    const sent = await Message.findAll({
      where: { senderId: req.userId },
      attributes: ['receiverId'],
      group: ['receiverId'],
    });
    const received = await Message.findAll({
      where: { receiverId: req.userId },
      attributes: ['senderId'],
      group: ['senderId'],
    });
    const partnerIds = new Set<number>();
    sent.forEach((m) => partnerIds.add(m.receiverId));
    received.forEach((m) => partnerIds.add(m.senderId));

    const conversations = [];
    for (const partnerId of partnerIds) {
      const lastMessage = await Message.findOne({
        where: {
          [Op.or]: [
            { senderId: req.userId, receiverId: partnerId },
            { senderId: partnerId, receiverId: req.userId },
          ],
        },
        order: [['createdAt', 'DESC']],
      });
      const unreadCount = await Message.count({
        where: { senderId: partnerId, receiverId: req.userId, isRead: false },
      });
      if (lastMessage) {
        conversations.push({ partnerId, lastMessage, unreadCount });
      }
    }
    conversations.sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());
    res.json({ success: true, data: conversations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};