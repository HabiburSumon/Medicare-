import { Response } from 'express';
import Favorite from '../models/Favorite';
import Doctor from '../models/Doctor';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const favorites = await Favorite.findAll({
      where: { patientId: req.userId },
      include: [{
        model: Doctor, as: 'doctor',
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'avatar'] }],
      }],
    });
    const parsed = favorites.map((f: any) => {
      const d = f.doctor;
      return {
        ...f.toJSON(),
        doctor: d ? {
          ...d,
          availableDays: d.getAvailableDays ? d.getAvailableDays() : JSON.parse(d.availableDays || '[]'),
          timeSlots: d.getTimeSlots ? d.getTimeSlots() : JSON.parse(d.timeSlots || '[]'),
          languages: d.getLanguages ? d.getLanguages() : JSON.parse(d.languages || '[]'),
        } : null,
      };
    });
    res.json({ success: true, data: parsed });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const addFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { doctorId } = req.body;
    const existing = await Favorite.findOne({ where: { patientId: req.userId, doctorId } });
    if (existing) { res.status(400).json({ success: false, message: 'Doctor already in favorites' }); return; }
    const favorite = await Favorite.create({ patientId: req.userId!, doctorId });
    res.status(201).json({ success: true, data: favorite });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const removeFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const favorite = await Favorite.findOne({ where: { patientId: req.userId, doctorId: req.params.doctorId } });
    if (!favorite) { res.status(404).json({ success: false, message: 'Favorite not found' }); return; }
    await favorite.destroy();
    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const checkFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const favorite = await Favorite.findOne({ where: { patientId: req.userId, doctorId: req.params.doctorId } });
    res.json({ success: true, data: { isFavorite: !!favorite } });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};