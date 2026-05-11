import { Response } from 'express';
import User from '../models/User';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';
import Appointment from '../models/Appointment';
import Order from '../models/Order';
import Review from '../models/Review';
import Medicine from '../models/Medicine';
import Prescription from '../models/Prescription';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';
import * as jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Multer setup for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const doctorUpload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
export const medicineUpload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

export const adminLogin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.scope('withPassword').findOne({ where: { email, role: 'admin' } });
    if (!user) { res.status(401).json({ success: false, message: 'Invalid credentials' }); return; }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) { res.status(401).json({ success: false, message: 'Invalid credentials' }); return; }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' } as any);
    res.json({ success: true, data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token } });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const getDashboard = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalPatients, totalDoctors, totalAppointments, totalOrders, totalRevenue, totalMedicines, pendingReviews] = await Promise.all([
      User.count({ where: { role: 'patient' } }),
      User.count({ where: { role: 'doctor' } }),
      Appointment.count(),
      Order.count(),
      Order.sum('finalAmount'),
      Medicine.count(),
      Review.count({ where: { isApproved: false } }),
    ]);
    res.json({
      success: true,
      data: {
        totalPatients, totalDoctors, totalAppointments, totalOrders,
        totalRevenue: totalRevenue || 0, totalMedicines, pendingReviews,
      },
    });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const getDashboardStats = getDashboard;

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, page = '1', limit = '20' } = req.query;
    const where: any = {};
    if (role) where.role = role;
    const total = await User.count({ where });
    const users = await User.findAll({
      where, order: [['createdAt', 'DESC']],
      offset: (parseInt(page as string) - 1) * parseInt(limit as string),
      limit: parseInt(limit as string),
    });
    res.json({ success: true, data: users, pagination: { total, page: parseInt(page as string), pages: Math.ceil(total / parseInt(limit as string)) } });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    await user.update(req.body);
    res.json({ success: true, data: user });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    await user.destroy();
    res.json({ success: true, message: 'User deleted' });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    await user.update({ isActive: !user.isActive });
    res.json({ success: true, data: user });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const updateUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    await user.update({ isActive: req.body.isActive });
    res.json({ success: true, data: user });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

// Doctor management
export const getAllDoctors = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const total = await Doctor.count();
    const doctors = await Doctor.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'avatar', 'isActive'] }],
      order: [['createdAt', 'DESC']],
      offset: (parseInt(page as string) - 1) * parseInt(limit as string),
      limit: parseInt(limit as string),
    });
    res.json({ success: true, data: doctors, pagination: { total, page: parseInt(page as string), pages: Math.ceil(total / parseInt(limit as string)) } });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const getUserDoctorProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctor = await Doctor.findOne({
      where: { userId: req.params.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'avatar'] }],
    });
    if (!doctor) { res.status(404).json({ success: false, message: 'Doctor profile not found' }); return; }
    res.json({ success: true, data: doctor });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const updateUserDoctorProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctor = await Doctor.findOne({ where: { userId: req.params.id } });
    if (!doctor) { res.status(404).json({ success: false, message: 'Doctor profile not found' }); return; }
    await doctor.update(req.body);
    res.json({ success: true, data: doctor });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const addDoctor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, specialization, qualification, experience, consultationFee, bio } = req.body;
    const user = await User.create({ name, email, phone, password: password || 'doctor123', role: 'doctor', isVerified: true });
    const doctor = await Doctor.create({
      userId: user.id, specialization, qualification, experience, consultationFee, bio,
      availableDays: JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
      timeSlots: JSON.stringify([{ start: '09:00 AM', end: '10:00 AM' }, { start: '10:00 AM', end: '11:00 AM' }]),
      isAvailable: true,
    });
    res.status(201).json({ success: true, data: { user, doctor } });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const deleteDoctor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) { res.status(404).json({ success: false, message: 'Doctor not found' }); return; }
    await User.destroy({ where: { id: doctor.userId } });
    await doctor.destroy();
    res.json({ success: true, message: 'Doctor deleted' });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const uploadDoctorImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) { res.status(400).json({ success: false, message: 'No file uploaded' }); return; }
    const userId = req.body.userId;
    if (userId) {
      await User.update({ avatar: `/uploads/${req.file.filename}` }, { where: { id: userId } });
    }
    res.json({ success: true, data: { url: `/uploads/${req.file.filename}` } });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

// Medicine management
export const getAllMedicines = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20', category } = req.query;
    const where: any = {};
    if (category) where.category = category;
    const total = await Medicine.count({ where });
    const medicines = await Medicine.findAll({
      where, order: [['createdAt', 'DESC']],
      offset: (parseInt(page as string) - 1) * parseInt(limit as string),
      limit: parseInt(limit as string),
    });
    res.json({ success: true, data: medicines, pagination: { total, page: parseInt(page as string), pages: Math.ceil(total / parseInt(limit as string)) } });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const addMedicine = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const medicine = await Medicine.create(req.body);
    res.status(201).json({ success: true, data: medicine });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const updateMedicine = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const medicine = await Medicine.findByPk(req.params.id);
    if (!medicine) { res.status(404).json({ success: false, message: 'Medicine not found' }); return; }
    await medicine.update(req.body);
    res.json({ success: true, data: medicine });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const deleteMedicine = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const medicine = await Medicine.findByPk(req.params.id);
    if (!medicine) { res.status(404).json({ success: false, message: 'Medicine not found' }); return; }
    await medicine.destroy();
    res.json({ success: true, message: 'Medicine deleted' });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const uploadMedicineImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) { res.status(400).json({ success: false, message: 'No file uploaded' }); return; }
    const { medicineId } = req.body;
    if (medicineId) {
      await Medicine.update({ image: `/uploads/${req.file.filename}` }, { where: { id: medicineId } });
    }
    res.json({ success: true, data: { url: `/uploads/${req.file.filename}` } });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

// Appointments
export const getAllAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const total = await Appointment.count();
    const appointments = await Appointment.findAll({
      include: [
        { model: User, as: 'patient', attributes: ['id', 'name', 'email', 'phone'] },
        { model: User, as: 'doctor', attributes: ['id', 'name', 'email', 'phone'] },
      ],
      order: [['createdAt', 'DESC']],
      offset: (parseInt(page as string) - 1) * parseInt(limit as string),
      limit: parseInt(limit as string),
    });
    res.json({ success: true, data: appointments, pagination: { total, page: parseInt(page as string), pages: Math.ceil(total / parseInt(limit as string)) } });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) { res.status(404).json({ success: false, message: 'Appointment not found' }); return; }
    await appointment.update({ status: req.body.status });
    res.json({ success: true, data: appointment });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

// Orders
export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const total = await Order.count();
    const orders = await Order.findAll({
      include: [{ model: User, as: 'patient', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
      offset: (parseInt(page as string) - 1) * parseInt(limit as string),
      limit: parseInt(limit as string),
    });
    res.json({ success: true, data: orders, pagination: { total, page: parseInt(page as string), pages: Math.ceil(total / parseInt(limit as string)) } });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) { res.status(404).json({ success: false, message: 'Order not found' }); return; }
    await order.update({ status: req.body.status });
    res.json({ success: true, data: order });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

// Reviews
export const getAllReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const total = await Review.count();
    const reviews = await Review.findAll({
      include: [
        { model: User, as: 'patient', attributes: ['id', 'name'] },
        { model: User, as: 'doctor', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
      offset: (parseInt(page as string) - 1) * parseInt(limit as string),
      limit: parseInt(limit as string),
    });
    res.json({ success: true, data: reviews, pagination: { total, page: parseInt(page as string), pages: Math.ceil(total / parseInt(limit as string)) } });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) { res.status(404).json({ success: false, message: 'Review not found' }); return; }
    await review.destroy();
    res.json({ success: true, message: 'Review deleted' });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

// Prescriptions
export const getAllPrescriptions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const total = await Prescription.count();
    const prescriptions = await Prescription.findAll({
      include: [
        { model: User, as: 'patient', attributes: ['id', 'name'] },
        { model: User, as: 'doctor', attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
      offset: (parseInt(page as string) - 1) * parseInt(limit as string),
      limit: parseInt(limit as string),
    });
    res.json({ success: true, data: prescriptions, pagination: { total, page: parseInt(page as string), pages: Math.ceil(total / parseInt(limit as string)) } });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

// Notifications
export const sendNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, title, message, type } = req.body;
    const notification = await Notification.create({ recipientId: userId, title, message, type: type || 'system' });
    res.status(201).json({ success: true, data: notification });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const total = await Notification.count();
    const notifications = await Notification.findAll({
      order: [['createdAt', 'DESC']],
      offset: (parseInt(page as string) - 1) * parseInt(limit as string),
      limit: parseInt(limit as string),
    });
    res.json({ success: true, data: notifications, pagination: { total, page: parseInt(page as string), pages: Math.ceil(total / parseInt(limit as string)) } });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};