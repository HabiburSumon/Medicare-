import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import Prescription from '../models/Prescription';
import Appointment from '../models/Appointment';
import { AuthRequest } from '../middleware/auth';
import { createNotification } from './notification.controller';

// Ensure test results directory exists
const testResultsDir = path.join(__dirname, '../../uploads/test-results');
if (!fs.existsSync(testResultsDir)) fs.mkdirSync(testResultsDir, { recursive: true });

export const testResultUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, testResultsDir),
    filename: (_req, file, cb) => cb(null, `test-${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`),
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype.split('/')[1]) || file.mimetype === 'application/pdf';
    cb(null, ext || mime);
  },
});

export const createPrescription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { appointmentId, patientId, diagnosis, symptoms, medicines, tests, notes, followUpDate } = req.body;

    const prescription = await Prescription.create({
      appointment: appointmentId,
      patient: patientId,
      doctor: req.userId,
      diagnosis,
      symptoms,
      medicines,
      tests,
      notes,
      followUpDate,
    });

    const populated = await Prescription.findById(prescription._id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email phone');

    // Notify patient about new prescription
    await createNotification({
      recipient: patientId,
      sender: req.userId,
      type: 'prescription_sent',
      title: 'New Prescription Received',
      message: `Your doctor has sent a prescription${diagnosis ? ` for ${diagnosis}` : ''}`,
      data: { prescriptionId: prescription._id },
      link: '/prescriptions',
    });

    res.status(201).json({ success: true, data: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPrescriptions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query: any = {};
    if (req.userRole === 'patient') query.patient = req.userId;
    else if (req.userRole === 'doctor') query.doctor = req.userId;

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email phone')
      .populate('appointment')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: prescriptions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPrescriptionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email phone')
      .populate('appointment');

    if (!prescription) {
      res.status(404).json({ success: false, message: 'Prescription not found' });
      return;
    }
    res.json({ success: true, data: prescription });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadTestResult = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const { id } = req.params;
    const { testName } = req.body;

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      res.status(404).json({ success: false, message: 'Prescription not found' });
      return;
    }

    // Only the patient who owns the prescription can upload test results
    if (req.userRole === 'patient' && prescription.patient.toString() !== req.userId) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    const fileUrl = `/uploads/test-results/${req.file.filename}`;
    const testResult = {
      testName: testName || 'Test Result',
      fileUrl,
      fileName: req.file.originalname,
      uploadedAt: new Date(),
    };

    if (!prescription.testResults) prescription.testResults = [];
    prescription.testResults.push(testResult as any);
    await prescription.save();

    // Notify the doctor about the uploaded test result
    await createNotification({
      recipient: prescription.doctor,
      sender: req.userId,
      type: 'test_result_uploaded',
      title: 'Test Result Uploaded',
      message: `A test result "${testResult.testName}" has been uploaded`,
      data: { prescriptionId: prescription._id, testName: testResult.testName },
      link: '/prescriptions',
    });

    const updated = await Prescription.findById(id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email phone');

    res.json({ success: true, data: updated, testResult });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get patient medical history (for doctors)
export const getPatientHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const [prescriptions, appointments] = await Promise.all([
      Prescription.find({ patient: patientId, doctor: req.userId }).sort({ createdAt: -1 }).populate('doctor', 'name email'),
      Appointment.find({ patient: patientId, doctor: req.userId }).sort({ appointmentDate: -1 }).populate('patient', 'name email phone'),
    ]);
    res.json({ success: true, data: { prescriptions, appointments, totalVisits: appointments.length } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
