import { Response } from 'express';
import Doctor from '../models/Doctor';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getAllDoctors = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { specialization, search, page = '1', limit = '10' } = req.query;
    const query: any = { isAvailable: true };

    if (specialization) query.specialization = new RegExp(specialization as string, 'i');
    if (search) {
      const users = await User.find({
        role: 'doctor',
        name: new RegExp(search as string, 'i'),
      }).select('_id');
      query.user = { $in: users.map((u) => u._id) };
    }

    const total = await Doctor.countDocuments(query);
    const doctors = await Doctor.find(query)
      .populate('user', 'name email phone avatar')
      .sort({ rating: -1 })
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .limit(parseInt(limit as string));

    res.json({
      success: true,
      data: doctors,
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
    const doctor = await Doctor.findById(req.params.id).populate('user', 'name email phone avatar');
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }
    res.json({ success: true, data: doctor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDoctorProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctor = await Doctor.findOne({ user: req.userId }).populate('user', 'name email phone avatar');
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor profile not found' });
      return;
    }
    res.json({ success: true, data: doctor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDoctorProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await Doctor.findOne({ user: req.userId });
    if (existing) {
      res.status(400).json({ success: false, message: 'Doctor profile already exists' });
      return;
    }

    const doctor = await Doctor.create({ ...req.body, user: req.userId });
    res.status(201).json({ success: true, data: doctor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDoctorProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { user: req.userId },
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'name email phone avatar');

    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor profile not found' });
      return;
    }
    res.json({ success: true, data: doctor });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSpecializations = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const specializations = await Doctor.distinct('specialization');
    res.json({ success: true, data: specializations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};