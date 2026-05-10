import { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../models/User';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';
import Appointment from '../models/Appointment';
import Medicine from '../models/Medicine';
import Order from '../models/Order';
import Review from '../models/Review';
import Prescription from '../models/Prescription';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';

// Ensure upload directories exist
const uploadDirs = ['uploads/doctors', 'uploads/medicines'];
uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

// Multer storage config
const createStorage = (subDir: string) => multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, '..', 'uploads', subDir)),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${subDir}-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
  },
});

const fileFilter = (_req: any, file: any, cb: any) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = file.mimetype.startsWith('image/');
  if (ext && mime) cb(null, true);
  else cb(new Error('Only image files are allowed'));
};

export const doctorUpload = multer({
  storage: createStorage('doctors'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

export const medicineUpload = multer({
  storage: createStorage('medicines'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [users, doctors, appointments, medicines, orders, reviews, prescriptions] = await Promise.all([
      User.countDocuments(),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Medicine.countDocuments(),
      Order.countDocuments(),
      Review.countDocuments(),
      Prescription.countDocuments(),
    ]);
    const recentUsers = await User.find().select('-password').sort({ createdAt: -1 }).limit(5);
    const recentAppointments = await Appointment.find().sort({ createdAt: -1 }).limit(5).populate('patient doctor', 'name email phone');
    const totalRevenue = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]);
    const appointmentStats = await Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.json({
      success: true,
      data: {
        users, doctors, appointments, medicines, orders, reviews, prescriptions,
        revenue: totalRevenue[0]?.total || 0,
        recentUsers, recentAppointments,
        appointmentStats: appointmentStats.reduce((acc: any, cur) => { acc[cur._id] = cur.count; return acc; }, {})
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== USER MANAGEMENT =====
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, search, page = '1', limit = '20' } = req.query;
    const query: any = {};
    if (role) query.role = role;
    if (search) query.$or = [{ name: new RegExp(search as string, 'i') }, { email: new RegExp(search as string, 'i') }];
    const total = await User.countDocuments(query);
    const users = await User.find(query).select('-password').sort({ createdAt: -1 }).skip((+page - 1) * +limit).limit(+limit);
    res.json({ success: true, data: users, total, page: +page, totalPages: Math.ceil(total / +limit) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, role, phone, isActive, email } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { name, role, phone, isActive, email }, { new: true }).select('-password');
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    user.isActive = !user.isActive;
    await user.save();
    const safeUser = await User.findById(req.params.id).select('-password');
    res.json({ success: true, data: safeUser });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    await Doctor.deleteOne({ user: user._id });
    await Patient.deleteOne({ user: user._id });
    res.json({ success: true, message: 'User deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== DOCTOR MANAGEMENT =====
export const getAllDoctors = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctors = await Doctor.find().populate('user', 'name email phone avatar isActive').sort({ createdAt: -1 });
    res.json({ success: true, data: doctors });
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

export const addDoctor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, specialization, experience, qualification, bio, consultationFee, availableDays, timeSlots, languages, clinicAddress, avatar } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) { res.status(400).json({ success: false, message: 'Email already exists' }); return; }
    
    // Create user with doctor role (include avatar if uploaded before creation)
    const userData: any = { name, email, phone, password, role: 'doctor' };
    if (avatar) userData.avatar = avatar;
    const user = await User.create(userData);
    
    // Create doctor profile
    const doctor = await Doctor.create({
      user: user._id,
      specialization,
      experience: experience || 0,
      qualification: qualification || '',
      bio: bio || '',
      consultationFee: consultationFee || 0,
      availableDays: availableDays || ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday'],
      timeSlots: timeSlots || [
        { start: '09:00 AM', end: '09:30 AM' },
        { start: '10:00 AM', end: '10:30 AM' },
        { start: '11:00 AM', end: '11:30 AM' },
        { start: '02:00 PM', end: '02:30 PM' },
        { start: '03:00 PM', end: '03:30 PM' },
        { start: '04:00 PM', end: '04:30 PM' },
      ],
      languages: languages || ['English'],
      clinicAddress: clinicAddress || '',
      isAvailable: true,
    });
    
    const populatedDoctor = await Doctor.findById(doctor._id).populate('user', 'name email phone avatar');
    res.status(201).json({ success: true, data: populatedDoctor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDoctor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) { res.status(404).json({ success: false, message: 'Doctor not found' }); return; }
    if (doctor.user) {
      await User.findByIdAndDelete(doctor.user);
    }
    res.json({ success: true, message: 'Doctor deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== MEDICINE MANAGEMENT =====
export const getAllMedicines = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, category, page = '1', limit = '20' } = req.query;
    const query: any = {};
    if (search) query.$or = [{ name: new RegExp(search as string, 'i') }, { genericName: new RegExp(search as string, 'i') }, { brand: new RegExp(search as string, 'i') }];
    if (category) query.category = category;
    const total = await Medicine.countDocuments(query);
    const medicines = await Medicine.find(query).sort({ createdAt: -1 }).skip((+page - 1) * +limit).limit(+limit);
    res.json({ success: true, data: medicines, total, page: +page, totalPages: Math.ceil(total / +limit) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addMedicine = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const medicine = await Medicine.create(req.body);
    res.status(201).json({ success: true, data: medicine });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMedicine = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!medicine) { res.status(404).json({ success: false, message: 'Medicine not found' }); return; }
    res.json({ success: true, data: medicine });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMedicine = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) { res.status(404).json({ success: false, message: 'Medicine not found' }); return; }
    res.json({ success: true, message: 'Medicine deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== APPOINTMENT MANAGEMENT =====
export const getAllAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, doctor, date, page = '1', limit = '20' } = req.query;
    const query: any = {};
    if (status) query.status = status;
    if (doctor) query.doctor = doctor;
    if (date) query.appointmentDate = date;
    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query).sort({ createdAt: -1 }).skip((+page - 1) * +limit).limit(+limit).populate('patient doctor', 'name email phone');
    res.json({ success: true, data: appointments, total, page: +page, totalPages: Math.ceil(total / +limit) });
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

// ===== ORDER MANAGEMENT =====
export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const query: any = {};
    if (status) query.status = status;
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query).sort({ createdAt: -1 }).skip((+page - 1) * +limit).limit(+limit).populate('userId', 'name email');
    res.json({ success: true, data: orders, total, page: +page, totalPages: Math.ceil(total / +limit) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('userId', 'name email');
    if (!order) { res.status(404).json({ success: false, message: 'Order not found' }); return; }
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== REVIEW MANAGEMENT =====
export const getAllReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { doctor, page = '1', limit = '20' } = req.query;
    const query: any = {};
    if (doctor) query.doctor = doctor;
    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query).sort({ createdAt: -1 }).skip((+page - 1) * +limit).limit(+limit).populate('patient', 'name email').populate('doctor', 'specialization').populate({ path: 'doctor', populate: { path: 'user', select: 'name' } });
    res.json({ success: true, data: reviews, total, page: +page, totalPages: Math.ceil(total / +limit) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) { res.status(404).json({ success: false, message: 'Review not found' }); return; }
    res.json({ success: true, message: 'Review deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== PRESCRIPTION MANAGEMENT =====
export const getAllPrescriptions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const total = await Prescription.countDocuments();
    const prescriptions = await Prescription.find().sort({ createdAt: -1 }).skip((+page - 1) * +limit).limit(+limit).populate('patient', 'name email').populate('doctor', 'specialization').populate({ path: 'doctor', populate: { path: 'user', select: 'name' } });
    res.json({ success: true, data: prescriptions, total, page: +page, totalPages: Math.ceil(total / +limit) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== NOTIFICATION MANAGEMENT =====
export const sendNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, message, type, targetRole, targetUsers } = req.body;
    
    if (targetUsers && targetUsers.length > 0) {
      // Send to specific users
      const notifications = targetUsers.map((userId: string) => ({
        recipient: userId, title, message, type: type || 'system'
      }));
      await Notification.insertMany(notifications);
    } else if (targetRole) {
      // Send to all users of a role
      const users = await User.find({ role: targetRole, isActive: { $ne: false } }).select('_id');
      const notifications = users.map(u => ({
        recipient: u._id, title, message, type: type || 'system'
      }));
      await Notification.insertMany(notifications);
    } else {
      // Send to all users
      const users = await User.find({ isActive: { $ne: false } }).select('_id');
      const notifications = users.map(u => ({
        recipient: u._id, title, message, type: type || 'announcement'
      }));
      await Notification.insertMany(notifications);
    }
    
    res.status(201).json({ success: true, message: 'Notification sent successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const total = await Notification.countDocuments();
    const notifications = await Notification.find().sort({ createdAt: -1 }).skip((+page - 1) * +limit).limit(+limit).populate('recipient', 'name email role');
    res.json({ success: true, data: notifications, total, page: +page, totalPages: Math.ceil(total / +limit) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== IMAGE UPLOAD: DOCTOR AVATAR =====
export const uploadDoctorImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) { res.status(400).json({ success: false, message: 'No file uploaded' }); return; }

    const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
    const imageUrl = `${serverUrl}/uploads/doctors/${req.file.filename}`;

    // Update user avatar if userId provided
    const { userId } = req.body;
    if (userId) {
      await User.findByIdAndUpdate(userId, { avatar: imageUrl });
    }

    res.json({ success: true, data: { url: imageUrl } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== IMAGE UPLOAD: MEDICINE IMAGE =====
export const uploadMedicineImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) { res.status(400).json({ success: false, message: 'No file uploaded' }); return; }

    const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
    const imageUrl = `${serverUrl}/uploads/medicines/${req.file.filename}`;

    // Update medicine image if medicineId provided
    const { medicineId } = req.body;
    if (medicineId) {
      await Medicine.findByIdAndUpdate(medicineId, { image: imageUrl });
    }

    res.json({ success: true, data: { url: imageUrl } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

