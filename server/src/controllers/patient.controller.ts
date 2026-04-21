import { Response } from 'express';
import Patient from '../models/Patient';
import { AuthRequest } from '../middleware/auth';

export const getPatientProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patient = await Patient.findOne({ user: req.userId }).populate('user', 'name email phone avatar');
    if (!patient) {
      res.status(404).json({ success: false, message: 'Patient profile not found' });
      return;
    }
    res.json({ success: true, data: patient });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPatientProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await Patient.findOne({ user: req.userId });
    if (existing) {
      res.status(400).json({ success: false, message: 'Patient profile already exists' });
      return;
    }
    const patient = await Patient.create({ ...req.body, user: req.userId });
    res.status(201).json({ success: true, data: patient });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePatientProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { user: req.userId },
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name email phone avatar');

    if (!patient) {
      res.status(404).json({ success: false, message: 'Patient profile not found' });
      return;
    }
    res.json({ success: true, data: patient });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllPatients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patients = await Patient.find()
      .populate('user', 'name email phone avatar isActive')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: patients });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};