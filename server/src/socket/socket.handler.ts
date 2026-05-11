import { Server, Socket } from 'socket.io';
import Message from '../models/Message';
import User from '../models/User';

interface OnlineUser {
  userId: string;
  socketId: string;
}

let onlineUsers: OnlineUser[] = [];

export const setupSocketIO = (io: Server): void => {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // User comes online
    socket.on('user:online', (userId: string) => {
      onlineUsers = onlineUsers.filter((u) => u.userId !== userId);
      onlineUsers.push({ userId, socketId: socket.id });
      io.emit('users:online', onlineUsers.map((u) => u.userId));
    });

    // Send message
    socket.on('message:send', async (data: {
      senderId: string;
      receiverId: string;
      content: string;
      messageType?: string;
      fileUrl?: string;
      appointmentId?: string;
    }) => {
      try {
        const message = await Message.create({
          senderId: parseInt(data.senderId),
          receiverId: parseInt(data.receiverId),
          content: data.content,
          messageType: data.messageType || 'text',
          fileUrl: data.fileUrl || '',
        });

        const sender = await User.findByPk(data.senderId, { attributes: ['id', 'name', 'avatar'] });
        const receiver = await User.findByPk(data.receiverId, { attributes: ['id', 'name', 'avatar'] });

        const populated = {
          ...message.toJSON(),
          sender: sender ? sender.toJSON() : null,
          receiver: receiver ? receiver.toJSON() : null,
        };

        // Send to receiver if online
        const receiverUser = onlineUsers.find((u) => u.userId === data.receiverId);
        if (receiverUser) {
          io.to(receiverUser.socketId).emit('message:receive', populated);
        }

        // Confirm to sender
        socket.emit('message:sent', populated);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing:start', (data: { receiverId: string }) => {
      const receiver = onlineUsers.find((u) => u.userId === data.receiverId);
      if (receiver) {
        io.to(receiver.socketId).emit('typing:start', { senderId: socket.handshake.query.userId });
      }
    });

    socket.on('typing:stop', (data: { receiverId: string }) => {
      const receiver = onlineUsers.find((u) => u.userId === data.receiverId);
      if (receiver) {
        io.to(receiver.socketId).emit('typing:stop', { senderId: socket.handshake.query.userId });
      }
    });

    // Video call signaling
    socket.on('video:call-user', (data: { receiverId: string; signal: any; callerName: string }) => {
      const receiver = onlineUsers.find((u) => u.userId === data.receiverId);
      if (receiver) {
        io.to(receiver.socketId).emit('video:incoming-call', {
          signal: data.signal,
          callerId: socket.handshake.query.userId,
          callerName: data.callerName,
        });
      }
    });

    socket.on('video:answer-call', (data: { signal: any; callerId: string }) => {
      const caller = onlineUsers.find((u) => u.userId === data.callerId);
      if (caller) {
        io.to(caller.socketId).emit('video:call-accepted', { signal: data.signal });
      }
    });

    socket.on('video:end-call', (data: { receiverId: string }) => {
      const receiver = onlineUsers.find((u) => u.userId === data.receiverId);
      if (receiver) {
        io.to(receiver.socketId).emit('video:call-ended');
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id);
      io.emit('users:online', onlineUsers.map((u) => u.userId));
      console.log(`🔌 User disconnected: ${socket.id}`);
    });
  });
};