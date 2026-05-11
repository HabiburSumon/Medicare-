import { Response } from 'express';
import { Op } from 'sequelize';
import Doctor from '../models/Doctor';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getAllDoctors = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { specialization, search, page = '1', limit = '10' } = req.query;
    const where: any = { isAvailable: true };

    if (specialization) where.specialization = { [Op.like]: `%${specialization}%` };

    let userInclude: any = { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'avatar'] };
    let userIds: number[] | null = null;

    if (search) {
      const users = await User.findAll({
        where: { role: 'doctor', name: { [Op.like]: `%${search}%` } },
        attributes: ['id'],
      });
      userIds = users.map((u) => u.id);
      where.userId = { [Op.in]: userIds };
    }

    const total = await Doctor.count({ where });
    const doctors = await Doctor.findAll({
      where,
      include: [userInclude],
      order: [['rating', 'DESC']],
      offset: (parseInt(page as string) - 1) * parseInt(limit as string),
      limit: parseInt(limit as string),
    });

    // Parse JSON fields for each doctor
    const parsed = doctors.map((d: any) => ({
      ...d.toJSON(),
      availableDays: d.getAvailableDays ? d.getAvailableDays() : JSON.parse(d.availableDays || '[]'),
      timeSlots: d.getTimeSlots ? d.getTimeSlots() : JSON.parse(d.timeSlots || '[]'),
      languages: d.getLanguages ? d.getLanguages() : JSON.parse(d.languages || '[]'),
      documents: d.getDocuments ? d.getDocuments() : JSON.parse(d.documents || '[]'),
    }));

    res.json({
      success: true,
      data: parsed,
      pagination: {
        total,
        page: parseInt(page as string),
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDoctorById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctor = await Doctor.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'avatar'] }],
    });
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }
    const parsed = {
      ...doctor.toJSON(),
      availableDays: doctor.getAvailableDays(),
      timeSlots: doctor.getTimeSlots(),
      languages: doctor.getLanguages(),
      documents: doctor.getDocuments(),
    };
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDoctorProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctor = await Doctor.findOne({
      where: { userId: req.userId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'avatar'] }],
    });
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor profile not found' });
      return;
    }
    const parsed = {
      ...doctor.toJSON(),
      availableDays: doctor.getAvailableDays(),
      timeSlots: doctor.getTimeSlots(),
      languages: doctor.getLanguages(),
      documents: doctor.getDocuments(),
    };
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDoctorProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await Doctor.findOne({ where: { userId: req.userId } });
    if (existing) {
      res.status(400).json({ success: false, message: 'Doctor profile already exists' });
      return;
    }
    const data = { ...req.body, userId: req.userId };
    if (data.availableDays && Array.isArray(data.availableDays)) data.availableDays = JSON.stringify(data.availableDays);
    if (data.timeSlots && Array.isArray(data.timeSlots)) data.timeSlots = JSON.stringify(data.timeSlots);
    if (data.languages && Array.isArray(data.languages)) data.languages = JSON.stringify(data.languages);
    const doctor = await Doctor.create(data);
    res.status(201).json({ success: true, data: doctor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDoctorProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctor = await Doctor.findOne({ where: { userId: req.userId } });
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor profile not found' });
      return;
    }
    const data = { ...req.body };
    if (data.availableDays && Array.isArray(data.availableDays)) data.availableDays = JSON.stringify(data.availableDays);
    if (data.timeSlots && Array.isArray(data.timeSlots)) data.timeSlots = JSON.stringify(data.timeSlots);
    if (data.languages && Array.isArray(data.languages)) data.languages = JSON.stringify(data.languages);
    await doctor.update(data);
    const parsed = {
      ...doctor.toJSON(),
      availableDays: doctor.getAvailableDays(),
      timeSlots: doctor.getTimeSlots(),
      languages: doctor.getLanguages(),
      documents: doctor.getDocuments(),
    };
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSpecializations = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const specs = await Doctor.findAll({
      attributes: ['specialization'],
      group: ['specialization'],
      where: { isAvailable: true },
    });
    res.json({ success: true, data: specs.map((s) => s.specialization) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};