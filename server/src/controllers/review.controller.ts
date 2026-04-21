import { Response } from 'express';
import Review from '../models/Review';
import Doctor from '../models/Doctor';
import { AuthRequest } from '../middleware/auth';

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { doctorId, appointmentId, rating, comment } = req.body;

    const existing = await Review.findOne({ patient: req.userId, appointment: appointmentId });
    if (existing) {
      res.status(400).json({ success: false, message: 'Review already exists for this appointment' });
      return;
    }

    const review = await Review.create({
      patient: req.userId,
      doctor: doctorId,
      appointment: appointmentId,
      rating,
      comment,
    });

    // Update doctor's average rating
    const stats = await Review.aggregate([
      { $match: { doctor: review.doctor } },
      { $group: { _id: '$doctor', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (stats.length > 0) {
      await Doctor.findOneAndUpdate(
        { user: review.doctor },
        { rating: Math.round(stats[0].avgRating * 10) / 10, totalReviews: stats[0].count }
      );
    }

    res.status(201).json({ success: true, data: review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDoctorReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find({ doctor: req.params.doctorId, isApproved: true })
      .populate('patient', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find()
      .populate('patient', 'name avatar')
      .populate('doctor', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const moderateReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved: req.body.isApproved },
      { new: true }
    );
    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found' });
      return;
    }
    res.json({ success: true, data: review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};