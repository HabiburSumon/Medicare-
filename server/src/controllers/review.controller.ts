import { Response } from 'express';
import Review from '../models/Review';
import Doctor from '../models/Doctor';
import { AuthRequest } from '../middleware/auth';

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { doctorId, appointmentId, rating, comment } = req.body;
    const existing = await Review.findOne({ where: { patientId: req.userId, appointmentId } });
    if (existing) { res.status(400).json({ success: false, message: 'Review already exists for this appointment' }); return; }

    const review = await Review.create({ patientId: req.userId!, doctorId, appointmentId, rating, comment });

    // Update doctor's average rating
    const reviews = await Review.findAll({ where: { doctorId } });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Doctor.update({ rating: Math.round(avgRating * 10) / 10 }, { where: { userId: doctorId } });

    res.status(201).json({ success: true, data: review });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const getDoctorReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reviews = await Review.findAll({
      where: { doctorId: req.params.doctorId, isApproved: true },
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: reviews });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const getAllReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reviews = await Review.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: reviews });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const moderateReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) { res.status(404).json({ success: false, message: 'Review not found' }); return; }
    await review.update({ isApproved: req.body.isApproved });
    res.json({ success: true, data: review });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};