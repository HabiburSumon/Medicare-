import { Response } from 'express';
import { Op } from 'sequelize';
import Medicine from '../models/Medicine';
import { AuthRequest } from '../middleware/auth';

export const getMedicines = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, category, page = '1', limit = '12' } = req.query;
    const where: any = {};
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (category) where.category = category;

    const total = await Medicine.count({ where });
    const medicines = await Medicine.findAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: (parseInt(page as string) - 1) * parseInt(limit as string),
      limit: parseInt(limit as string),
    });
    res.json({ success: true, data: medicines, pagination: { total, page: parseInt(page as string), pages: Math.ceil(total / parseInt(limit as string)) } });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const getMedicineById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const medicine = await Medicine.findByPk(req.params.id);
    if (!medicine) { res.status(404).json({ success: false, message: 'Medicine not found' }); return; }
    res.json({ success: true, data: medicine });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const createMedicine = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const medicine = await Medicine.create(req.body);
    res.status(201).json({ success: true, data: medicine });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const updateMedicine = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const medicine = await Medicine.findByPk(req.params.id);
    if (!medicine) { res.status(404).json({ success: false, message: 'Medicine not found' }); return; }
    await medicine.update(req.body);
    res.json({ success: true, data: medicine });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const deleteMedicine = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const medicine = await Medicine.findByPk(req.params.id);
    if (!medicine) { res.status(404).json({ success: false, message: 'Medicine not found' }); return; }
    await medicine.destroy();
    res.json({ success: true, message: 'Medicine deleted' });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const getCategories = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categories = await Medicine.findAll({ attributes: ['category'], group: ['category'] });
    res.json({ success: true, data: categories.map((c) => c.category) });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};