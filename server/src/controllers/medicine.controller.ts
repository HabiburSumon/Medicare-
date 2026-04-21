import { Response } from 'express';
import Medicine from '../models/Medicine';
import { AuthRequest } from '../middleware/auth';

export const getMedicines = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, category, page = '1', limit = '12' } = req.query;
    const query: any = { inStock: true };

    if (search) {
      query.$or = [
        { name: new RegExp(search as string, 'i') },
        { genericName: new RegExp(search as string, 'i') },
      ];
    }
    if (category) query.category = new RegExp(category as string, 'i');

    const total = await Medicine.countDocuments(query);
    const medicines = await Medicine.find(query)
      .sort({ name: 1 })
      .skip((parseInt(page as string) - 1) * parseInt(limit as string))
      .limit(parseInt(limit as string));

    res.json({
      success: true,
      data: medicines,
      pagination: { total, page: parseInt(page as string), pages: Math.ceil(total / parseInt(limit as string)) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMedicineById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      res.status(404).json({ success: false, message: 'Medicine not found' });
      return;
    }
    res.json({ success: true, data: medicine });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createMedicine = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const medicine = await Medicine.create(req.body);
    res.status(201).json({ success: true, data: medicine });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMedicine = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!medicine) {
      res.status(404).json({ success: false, message: 'Medicine not found' });
      return;
    }
    res.json({ success: true, data: medicine });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMedicine = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) {
      res.status(404).json({ success: false, message: 'Medicine not found' });
      return;
    }
    res.json({ success: true, message: 'Medicine deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategories = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categories = await Medicine.distinct('category');
    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};