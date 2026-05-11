import { Response } from 'express';
import Patient from '../models/Patient';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getPatientProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patient = await Patient.findOne({
      where: { userId: req.userId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'avatar'] }],
    });
    if (!patient) { res.status(404).json({ success: false, message: 'Patient profile not found' }); return; }
    res.json({ success: true, data: patient });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePatientProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patient = await Patient.findOne({ where: { userId: req.userId } });
    if (!patient) { res.status(404).json({ success: false, message: 'Patient profile not found' }); return; }
    await patient.update(req.body);
    const updated = await Patient.findByPk(patient.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'avatar'] }],
    });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPatientById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const patient = await Patient.findOne({
      where: { userId: req.params.id },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'avatar'] }],
    });
    if (!patient) { res.status(404).json({ success: false, message: 'Patient not found' }); return; }
    res.json({ success: true, data: patient });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};