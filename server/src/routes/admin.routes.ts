import { Router } from 'express';
import { getDashboardStats, getAllUsers, updateUser, deleteUser, getAllAppointments, getAllOrders, getUserDoctorProfile, updateUserDoctorProfile, updateAppointmentStatus, getAllDoctors } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticate, authorize('admin'), getDashboardStats);
router.get('/users', authenticate, authorize('admin'), getAllUsers);
router.put('/users/:id', authenticate, authorize('admin'), updateUser);
router.delete('/users/:id', authenticate, authorize('admin'), deleteUser);
router.get('/users/:id/doctor-profile', authenticate, authorize('admin'), getUserDoctorProfile);
router.put('/users/:id/doctor-profile', authenticate, authorize('admin'), updateUserDoctorProfile);
router.get('/doctors', authenticate, authorize('admin'), getAllDoctors);
router.get('/appointments', authenticate, authorize('admin'), getAllAppointments);
router.put('/appointments/:id/status', authenticate, authorize('admin'), updateAppointmentStatus);
router.get('/orders', authenticate, authorize('admin'), getAllOrders);

export default router;