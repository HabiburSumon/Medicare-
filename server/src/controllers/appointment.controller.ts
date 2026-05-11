import { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Op } from 'sequelize';
import Appointment from '../models/Appointment';
import Doctor from '../models/Doctor';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { createNotification } from './notification.controller';

const videosDir = path.join(__dirname, '../../uploads/videos');
if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });

export const videoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, videosDir),
  filename: (_req, file, cb) => {
    cb(null, `video-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${path.extname(file.originalname)}`);
  },
});

export const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm', '.mov', '.avi', '.mkv', '.3gp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only video and image files are allowed'));
  },
});

const generateSerialNumber = (): string => {
  const prefix = 'APT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

const includeUsers = [
  { model: User, as: 'patient', attributes: ['id', 'name', 'email', 'phone', 'avatar'] },
  { model: User, as: 'doctor', attributes: ['id', 'name', 'email', 'phone', 'avatar'] },
];

export const createAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { doctorId, appointmentDate, timeSlot, type, notes } = req.body;
    const doctor = await Doctor.findOne({ where: { userId: doctorId } });
    if (!doctor) { res.status(404).json({ success: false, message: 'Doctor not found' }); return; }

    const finalTimeSlot = type === 'recorded-video' ? { start: 'Flexible', end: 'Flexible' } : timeSlot;

    if (type === 'video') {
      const existing = await Appointment.findOne({
        where: {
          doctorId: doctor.userId,
          appointmentDate: new Date(appointmentDate),
          timeSlotStart: timeSlot.start,
          timeSlotEnd: timeSlot.end,
          status: { [Op.in]: ['pending', 'confirmed'] },
        },
      });
      if (existing) { res.status(400).json({ success: false, message: 'Time slot not available' }); return; }
    }

    const appointment = await Appointment.create({
      patientId: req.userId!,
      doctorId: doctor.userId,
      appointmentDate: new Date(appointmentDate),
      timeSlotStart: finalTimeSlot.start,
      timeSlotEnd: finalTimeSlot.end,
      serialNumber: generateSerialNumber(),
      type,
      notes,
      status: type === 'recorded-video' ? 'confirmed' : 'pending',
    });

    const populated = await Appointment.findByPk(appointment.id, { include: includeUsers });

    const patientUser = await User.findByPk(req.userId!);
    await createNotification({
      recipientId: doctor.userId, senderId: req.userId, type: 'appointment_booked',
      title: 'New Appointment Booked',
      message: `${patientUser?.name || 'A patient'} booked an appointment for ${new Date(appointmentDate).toLocaleDateString()}`,
      data: JSON.stringify({ appointmentId: appointment.id, serialNumber: appointment.serialNumber }),
      link: '/dashboard',
    });

    const admins = await User.findAll({ where: { role: 'admin' } });
    for (const admin of admins) {
      await createNotification({
        recipientId: admin.id, senderId: req.userId, type: 'appointment_booked',
        title: 'New Appointment', message: `${patientUser?.name || 'A patient'} booked #${appointment.serialNumber}`,
        data: JSON.stringify({ appointmentId: appointment.id }), link: '/admin',
      });
    }

    res.status(201).json({ success: true, data: populated });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const getAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page = '1', limit = '10' } = req.query;
    const where: any = {};
    if (req.userRole === 'patient') where.patientId = req.userId;
    else if (req.userRole === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.userId } });
      where.doctorId = doctor?.userId || req.userId;
    }
    if (status) where.status = status;

    const total = await Appointment.count({ where });
    const appointments = await Appointment.findAll({
      where, include: includeUsers,
      order: [['appointmentDate', 'DESC']],
      offset: (parseInt(page as string) - 1) * parseInt(limit as string),
      limit: parseInt(limit as string),
    });
    res.json({ success: true, data: appointments, pagination: { total, page: parseInt(page as string), pages: Math.ceil(total / parseInt(limit as string)) } });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const getAppointmentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, { include: includeUsers });
    if (!appointment) { res.status(404).json({ success: false, message: 'Appointment not found' }); return; }
    res.json({ success: true, data: appointment });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const addDoctorResponse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) { res.status(404).json({ success: false, message: 'Appointment not found' }); return; }
    await appointment.update({ doctorResponse: req.body.doctorResponse, responseDate: new Date(), status: 'completed' });
    const updated = await Appointment.findByPk(appointment.id, { include: includeUsers });
    res.json({ success: true, data: updated });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const uploadVideo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) { res.status(400).json({ success: false, message: 'No video file provided' }); return; }
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) { res.status(404).json({ success: false, message: 'Appointment not found' }); return; }
    if (appointment.patientId !== req.userId) { res.status(403).json({ success: false, message: 'Not authorized' }); return; }
    const videoUrl = `/uploads/videos/${req.file.filename}`;
    await appointment.update({ recordedVideoUrl: videoUrl });
    const updated = await Appointment.findByPk(appointment.id, { include: includeUsers });
    res.json({ success: true, data: updated });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) { res.status(404).json({ success: false, message: 'Appointment not found' }); return; }
    await appointment.update({ status: req.body.status, cancellationReason: req.body.cancellationReason });
    const updated = await Appointment.findByPk(appointment.id, { include: includeUsers });
    res.json({ success: true, data: updated });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};