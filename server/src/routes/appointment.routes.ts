import { Router } from 'express';
import { createAppointment, getAppointments, getAppointmentById, updateAppointmentStatus, addDoctorResponse, uploadVideo, videoUpload } from '../controllers/appointment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createAppointment);
router.get('/', authenticate, getAppointments);
router.get('/:id', authenticate, getAppointmentById);
router.post('/:id/upload-video', authenticate, videoUpload.single('video'), uploadVideo);
router.put('/:id/status', authenticate, updateAppointmentStatus);
router.put('/:id/doctor-response', authenticate, addDoctorResponse);

export default router;