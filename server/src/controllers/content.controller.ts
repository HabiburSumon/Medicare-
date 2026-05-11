import { Response } from 'express';
import WebsiteContent from '../models/WebsiteContent';
import { AuthRequest } from '../middleware/auth';

export const getContent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { section } = req.params;
    const content = await WebsiteContent.findOne({ where: { section } });
    if (!content) { res.status(404).json({ success: false, message: 'Content not found' }); return; }
    res.json({ success: true, data: { ...content.toJSON(), items: JSON.parse(content.items || '[]'), settings: JSON.parse(content.settings || '{}') } });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const getAllContent = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const contents = await WebsiteContent.findAll();
    const parsed = contents.map((c) => ({ ...c.toJSON(), items: JSON.parse(c.items || '[]'), settings: JSON.parse(c.settings || '{}') }));
    res.json({ success: true, data: parsed });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const updateContent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { section } = req.params;
    let content = await WebsiteContent.findOne({ where: { section } });
    const data = { ...req.body, section };
    if (data.items && Array.isArray(data.items)) data.items = JSON.stringify(data.items);
    if (data.settings && typeof data.settings === 'object') data.settings = JSON.stringify(data.settings);
    if (!content) {
      content = await WebsiteContent.create(data);
    } else {
      await content.update(data);
    }
    res.json({ success: true, data: content });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};