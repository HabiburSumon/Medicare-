import { Router } from 'express';
import {
  getDashboardStats,
  // Users
  getAllUsers, updateUser, deleteUser, toggleUserStatus,
  // Doctors
  getAllDoctors, getUserDoctorProfile, updateUserDoctorProfile, addDoctor, deleteDoctor, doctorUpload, uploadDoctorImage,
  // Medicines
  getAllMedicines, addMedicine, updateMedicine, deleteMedicine, medicineUpload, uploadMedicineImage,
  // Appointments
  getAllAppointments, updateAppointmentStatus,
  // Orders
  getAllOrders, updateOrderStatus,
  // Reviews
  getAllReviews, deleteReview,
  // Prescriptions
  getAllPrescriptions,
  // Notifications
  sendNotification, getNotifications,
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require admin authentication
router.use(authenticate, authorize('admin'));

// Dashboard
router.get('/stats', getDashboardStats);

// Users
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

// Doctors
router.get('/doctors', getAllDoctors);
router.post('/doctors', addDoctor);
router.post('/doctors/upload-image', doctorUpload.single('image'), uploadDoctorImage);
router.get('/users/:id/doctor-profile', getUserDoctorProfile);
router.put('/users/:id/doctor-profile', updateUserDoctorProfile);
router.delete('/doctors/:id', deleteDoctor);

// Medicines
router.get('/medicines', getAllMedicines);
router.post('/medicines', addMedicine);
router.post('/medicines/upload-image', medicineUpload.single('image'), uploadMedicineImage);
router.put('/medicines/:id', updateMedicine);
router.delete('/medicines/:id', deleteMedicine);

// Appointments
router.get('/appointments', getAllAppointments);
router.put('/appointments/:id/status', updateAppointmentStatus);

// Orders
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Reviews
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

// Prescriptions
router.get('/prescriptions', getAllPrescriptions);

// Notifications
router.get('/notifications', getNotifications);
router.post('/notifications', sendNotification);

export default router;