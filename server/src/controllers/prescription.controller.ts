import { Response } from 'express';
import Prescription from '../models/Prescription';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const createPrescription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { appointmentId, patientId, diagnosis, symptoms, medicines, tests, notes, followUpDate } = req.body;
    const doctor = await User.findByPk(req.userId!);
    const prescription = await Prescription.create({
      appointmentId,
      patientId,
      doctorId: req.userId!,
      diagnosis,
      symptoms: JSON.stringify(symptoms || []),
      medicines: JSON.stringify(medicines || []),
      tests: JSON.stringify(tests || []),
      notes: notes || '',
      followUpDate: followUpDate || null,
    });
    res.status(201).json({ success: true, data: prescription });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const getPrescriptions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const where: any = {};
    if (req.userRole === 'patient') where.patientId = req.userId;
    else if (req.userRole === 'doctor') where.doctorId = req.userId;

    const prescriptions = await Prescription.findAll({
      where,
      include: [
        { model: User, as: 'patient', attributes: ['id', 'name', 'email', 'phone'] },
        { model: User, as: 'doctor', attributes: ['id', 'name', 'email', 'phone'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    const parsed = prescriptions.map((p) => ({
      ...p.toJSON(),
      symptoms: JSON.parse(p.symptoms || '[]'),
      medicines: JSON.parse(p.medicines || '[]'),
      tests: JSON.parse(p.tests || '[]'),
    }));
    res.json({ success: true, data: parsed });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const getPrescriptionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const prescription = await Prescription.findByPk(req.params.id, {
      include: [
        { model: User, as: 'patient', attributes: ['id', 'name', 'email', 'phone'] },
        { model: User, as: 'doctor', attributes: ['id', 'name', 'email', 'phone'] },
      ],
    });
    if (!prescription) { res.status(404).json({ success: false, message: 'Prescription not found' }); return; }
    const parsed = {
      ...prescription.toJSON(),
      symptoms: JSON.parse(prescription.symptoms || '[]'),
      medicines: JSON.parse(prescription.medicines || '[]'),
      tests: JSON.parse(prescription.tests || '[]'),
    };
    res.json({ success: true, data: parsed });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const updatePrescription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const prescription = await Prescription.findByPk(req.params.id);
    if (!prescription) { res.status(404).json({ success: false, message: 'Prescription not found' }); return; }
    const data = { ...req.body };
    if (data.symptoms) data.symptoms = JSON.stringify(data.symptoms);
    if (data.medicines) data.medicines = JSON.stringify(data.medicines);
    if (data.tests) data.tests = JSON.stringify(data.tests);
    await prescription.update(data);
    res.json({ success: true, data: prescription });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const getPatientPrescriptions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const prescriptions = await Prescription.findAll({
      where: { patientId: req.params.patientId },
      include: [{ model: User, as: 'doctor', attributes: ['id', 'name', 'email', 'phone'] }],
      order: [['createdAt', 'DESC']],
    });
    const parsed = prescriptions.map((p) => ({
      ...p.toJSON(),
      symptoms: JSON.parse(p.symptoms || '[]'),
      medicines: JSON.parse(p.medicines || '[]'),
      tests: JSON.parse(p.tests || '[]'),
    }));
    res.json({ success: true, data: parsed });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};