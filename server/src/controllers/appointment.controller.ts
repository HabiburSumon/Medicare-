import { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Appointment from '../models/Appointment';
import Doctor from '../models/Doctor';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { createNotification } from './notification.controller';

// Ensure videos directory exists
const videosDir = path.join(__dirname, '../../uploads/videos');
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

// Multer storage config for video uploads
export const videoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, videosDir),
  filename: (_req, file, cb) => {
    const uniqueName = `video-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

export const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (_req, file, cb) => {
    const allowedVideo = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.3gp'];
    const allowedImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedVideo.includes(ext) || allowedImage.includes(ext)) cb(null, true);
    else cb(new Error('Only video and image files are allowed'));
  },
});

// Generate unique serial number
const generateSerialNumber = (): string => {
  const prefix = 'APT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

export const createAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { doctorId, appointmentDate, timeSlot, type, notes } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }

    // For video calls, check if slot is available
    if (type === 'video') {
      const existingAppointment = await Appointment.findOne({
        doctor: doctor.user,
        appointmentDate: new Date(appointmentDate),
        'timeSlot.start': timeSlot.start,
        'timeSlot.end': timeSlot.end,
        status: { $in: ['pending', 'confirmed'] },
      });

      if (existingAppointment) {
        res.status(400).json({ success: false, message: 'Time slot not available' });
        return;
      }
    }

    // For recorded-video, set a default time slot if not provided
    const finalTimeSlot = type === 'recorded-video' 
      ? { start: 'Flexible', end: 'Flexible' } 
      : timeSlot;

    const appointment = await Appointment.create({
      patient: req.userId,
      doctor: doctor.user,
      appointmentDate: new Date(appointmentDate),
      timeSlot: finalTimeSlot,
      serialNumber: generateSerialNumber(),
      type,
      notes,
      status: type === 'recorded-video' ? 'confirmed' : 'pending',
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email phone');

    // Send notification to doctor about new appointment
    const patientUser = await User.findById(req.userId);
    await createNotification({
      recipient: doctor.user,
      sender: req.userId,
      type: 'appointment_booked',
      title: 'New Appointment Booked',
      message: `${patientUser?.name || 'A patient'} booked an appointment for ${new Date(appointmentDate).toLocaleDateString()}`,
      data: { appointmentId: appointment._id, serialNumber: appointment.serialNumber },
      link: '/dashboard',
    });

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification({
        recipient: admin._id,
        sender: req.userId,
        type: 'appointment_booked',
        title: 'New Appointment',
        message: `${patientUser?.name || 'A patient'} booked #${appointment.serialNumber}`,
        data: { appointmentId: appointment._id },
        link: '/admin',
      });
    }

    res.status(201).json({ success: true, data: populatedAppointment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page = '1', limit = '10' } = req.query;
    const query: any = {};

    if (req.userRole === 'patient') query.patient = req.userId;
    else if (req.userRole === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.userId });
      query.doctor = doctor?.user || req.userId;
    }
    if (status) query.status = status;

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone avatar')
      .populate('doctor', 'name email phone avatar')
      .sort({ appointmentDate: -1 })
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .limit(parseInt(limit as string));

    res.json({
      success: true,
      data: appointments,
      pagination: { total, page: parseInt(page as string), pages: Math.ceil(total / parseInt(limit as string)) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAppointmentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone avatar')
      .populate('doctor', 'name email phone avatar');

    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }
    res.json({ success: true, data: appointment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addDoctorResponse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { doctorResponse } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { 
        doctorResponse, 
        responseDate: new Date(),
        status: 'completed',
      },
      { new: true, runValidators: true }
    ).populate('patient', 'name email phone').populate('doctor', 'name email phone');

    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }
    res.json({ success: true, data: appointment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadVideo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No video file provided' });
      return;
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }

    // Verify the patient owns this appointment
    if (appointment.patient.toString() !== req.userId) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    const videoUrl = `/uploads/videos/${req.file.filename}`;
    appointment.recordedVideoUrl = videoUrl;
    await appointment.save();

    const updated = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email phone');

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, cancellationReason } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, cancellationReason },
      { new: true, runValidators: true }
    ).populate('patient', 'name email phone').populate('doctor', 'name email phone');

    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found' });
      return;
    }
    res.json({ success: true, data: appointment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};