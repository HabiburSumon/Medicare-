import { Response } from 'express';
import User from '../models/User';
import Doctor from '../models/Doctor';
import Appointment from '../models/Appointment';
import Medicine from '../models/Medicine';
import Order from '../models/Order';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [users, doctors, appointments, medicines, orders] = await Promise.all([
      User.countDocuments(),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Medicine.countDocuments(),
      Order.countDocuments(),
    ]);
    const recentUsers = await User.find().select('-password').sort({ createdAt: -1 }).limit(5);
    const recentAppointments = await Appointment.find().sort({ createdAt: -1 }).limit(5).populate('patient doctor', 'name email phone');
    res.json({ success: true, data: { users, doctors, appointments, medicines, orders, recentUsers, recentAppointments } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, search } = req.query;
    const query: any = {};
    if (role) query.role = role;
    if (search) query.$or = [{ name: new RegExp(search as string, 'i') }, { email: new RegExp(search as string, 'i') }];
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, role, phone, isActive, email, avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { name, role, phone, isActive, email, avatar }, { new: true }).select('-password');
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserDoctorProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctor = await Doctor.findOne({ user: req.params.id }).populate('user', 'name email phone avatar');
    if (!doctor) { res.status(404).json({ success: false, message: 'Doctor profile not found' }); return; }
    res.json({ success: true, data: doctor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserDoctorProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { specialization, experience, qualification, bio, consultationFee, availableDays, timeSlots, isAvailable, languages, clinicAddress } = req.body;
    const doctor = await Doctor.findOneAndUpdate(
      { user: req.params.id },
      { specialization, experience, qualification, bio, consultationFee, availableDays, timeSlots, isAvailable, languages, clinicAddress },
      { new: true, runValidators: true }
    ).populate('user', 'name email phone avatar');
    if (!doctor) { res.status(404).json({ success: false, message: 'Doctor profile not found' }); return; }
    res.json({ success: true, data: doctor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('patient doctor', 'name email phone');
    if (!appointment) { res.status(404).json({ success: false, message: 'Appointment not found' }); return; }
    res.json({ success: true, data: appointment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllDoctors = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctors = await Doctor.find().populate('user', 'name email phone avatar isActive').sort({ createdAt: -1 });
    res.json({ success: true, data: doctors });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    res.json({ success: true, message: 'User deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllAppointments = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 }).limit(50).populate('patient doctor', 'name email phone');
    res.json({ success: true, data: appointments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllOrders = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(50).populate('userId', 'name email');
    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};