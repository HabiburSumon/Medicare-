import { Response } from 'express';
import Favorite from '../models/Favorite';
import { AuthRequest } from '../middleware/auth';

export const getFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const favorites = await Favorite.find({ patient: req.userId })
      .populate({
        path: 'doctor',
        select: 'name email phone avatar',
        populate: { path: 'doctorProfile' },
      })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: favorites });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { doctorId } = req.body;
    const existing = await Favorite.findOne({ patient: req.userId, doctor: doctorId });
    if (existing) {
      res.status(400).json({ success: false, message: 'Doctor already in favorites' });
      return;
    }
    const favorite = await Favorite.create({ patient: req.userId, doctor: doctorId });
    res.status(201).json({ success: true, data: favorite });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Favorite.findOneAndDelete({ patient: req.userId, doctor: req.params.doctorId });
    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};