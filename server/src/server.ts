import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';

import authRoutes from './routes/auth.routes';
import doctorRoutes from './routes/doctor.routes';
import patientRoutes from './routes/patient.routes';
import appointmentRoutes from './routes/appointment.routes';
import prescriptionRoutes from './routes/prescription.routes';
import messageRoutes from './routes/message.routes';
import orderRoutes from './routes/order.routes';
import reviewRoutes from './routes/review.routes';
import medicineRoutes from './routes/medicine.routes';
import favoriteRoutes from './routes/favorite.routes';
import symptomRoutes from './routes/symptom.routes';
import adminRoutes from './routes/admin.routes';
import notificationRoutes from './routes/notification.routes';
import contentRoutes from './routes/content.routes';
import { setupSocketIO } from './socket/socket.handler';

const app = express();
const httpServer = createServer(app);

const allowedOrigins: string[] = ['http://localhost:3000', 'http://localhost:3001', process.env.CLIENT_URL].filter((o): o is string => !!o);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  },
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads (serve from both locations)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/prescriptions', prescriptionRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/medicines', medicineRoutes);
app.use('/api/v1/favorites', favoriteRoutes);
app.use('/api/v1/symptoms', symptomRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/content', contentRoutes);

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Socket.IO setup
setupSocketIO(io);

// Database connection and server start
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/doctor-appointment';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.IO ready`);
      console.log(`🌐 API: http://localhost:${PORT}/api/v1`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

export { app, io };