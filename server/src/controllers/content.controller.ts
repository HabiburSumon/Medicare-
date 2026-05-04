import { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import WebsiteContent from '../models/WebsiteContent';
import { AuthRequest } from '../middleware/auth';

// Ensure uploads/hero directory exists
const heroUploadDir = path.join(__dirname, '../../uploads/hero');
if (!fs.existsSync(heroUploadDir)) { fs.mkdirSync(heroUploadDir, { recursive: true }); }

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, heroUploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `hero-${Date.now()}${ext}`);
  },
});

export const heroUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for videos
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|mp4|webm|mov|avi/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype.split('/')[1]) || file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/');
    if (ext && mime) cb(null, true);
    else cb(new Error('Only image and video files are allowed'));
  },
});

export const getAllContent = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const content = await WebsiteContent.find();
    const contentMap: Record<string, any> = {};
    content.forEach((c) => { contentMap[c.section] = c; });
    res.json({ success: true, data: contentMap });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSectionContent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const content = await WebsiteContent.findOne({ section: req.params.section });
    if (!content) { res.status(404).json({ success: false, message: 'Section not found' }); return; }
    res.json({ success: true, data: content });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const upsertContent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { section, title, subtitle, description, image, items, settings } = req.body;
    const content = await WebsiteContent.findOneAndUpdate(
      { section },
      { section, title, subtitle, description, image, items, settings },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, data: content });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteContent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const content = await WebsiteContent.findOneAndDelete({ section: req.params.section });
    if (!content) { res.status(404).json({ success: false, message: 'Section not found' }); return; }
    res.json({ success: true, message: 'Content deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadHeroMedia = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) { res.status(400).json({ success: false, message: 'No file uploaded' }); return; }

    const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
    const mediaUrl = `${serverUrl}/uploads/hero/${req.file.filename}`;

    // Detect media type
    const videoExts = ['.mp4', '.webm', '.mov', '.avi'];
    const ext = path.extname(req.file.originalname).toLowerCase();
    const mediaType = videoExts.includes(ext) ? 'video' : 'image';

    const newSlide = { url: mediaUrl, mediaType, createdAt: new Date().toISOString() };

    // Get or create hero section, then push slide to array
    let content = await WebsiteContent.findOne({ section: 'hero' });
    if (!content) {
      content = await WebsiteContent.create({
        section: 'hero',
        title: 'Your Health, Our Priority',
        subtitle: 'Book appointments with top doctors, consult online, and get prescriptions.',
        settings: { slides: [newSlide] },
      });
    } else {
      const slides: any[] = content.get('settings')?.slides || [];
      slides.push(newSlide);
      content.set('settings', { ...content.get('settings'), slides });
      if (!content.image && slides.length > 0) content.image = slides[0].url;
      await content.save();
    }

    res.json({ success: true, data: content, slide: newSlide });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteHeroMedia = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { slideIndex } = req.params;
    const content = await WebsiteContent.findOne({ section: 'hero' });
    if (!content) { res.status(404).json({ success: false, message: 'Hero section not found' }); return; }

    const settings = content.get('settings') || {};
    const slides: any[] = settings.slides || [];
    const idx = parseInt(slideIndex, 10);
    if (isNaN(idx) || idx < 0 || idx >= slides.length) {
      res.status(400).json({ success: false, message: 'Invalid slide index' }); return;
    }

    // Delete file from disk
    const slide = slides[idx];
    if (slide?.url) {
      const filename = slide.url.split('/hero/')[1];
      if (filename) {
        const filePath = path.join(heroUploadDir, filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    }

    slides.splice(idx, 1);
    content.set('settings', { ...settings, slides });
    content.image = slides.length > 0 ? slides[0].url : '';
    await content.save();

    res.json({ success: true, data: content, message: 'Slide deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const seedContent = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const defaults = [
      {
        section: 'hero',
        title: 'Your Health, Our Priority',
        subtitle: 'Book appointments with top doctors, consult online, and get prescriptions — all from the comfort of your home.',
        items: [
          { icon: '🏥', title: 'Find Doctors', description: 'Search by category, name, or specialization', link: '/doctors' },
          { icon: '📅', title: 'Book Appointment', description: 'Choose your preferred time slot', link: '/doctors' },
          { icon: '💬', title: 'Online Consultation', description: 'Chat or video call with doctors', link: '/chat' },
        ],
      },
      {
        section: 'features',
        title: 'Why Choose Medicare?',
        subtitle: 'Experience healthcare reimagined with cutting-edge technology',
        items: [
          { icon: '🔒', title: 'Secure & Private', description: 'Your medical data is encrypted and protected' },
          { icon: '⚡', title: 'Instant Booking', description: 'Book appointments in under 60 seconds' },
          { icon: '💊', title: 'E-Prescriptions', description: 'Digital prescriptions delivered to your inbox' },
          { icon: '🤖', title: 'AI Symptom Checker', description: 'Get preliminary guidance on your symptoms' },
          { icon: '📹', title: 'Video Consultation', description: 'Face-to-face consultations from anywhere' },
          { icon: '🛒', title: 'Medicine Delivery', description: 'Order medicines directly from prescriptions' },
        ],
      },
      {
        section: 'stats',
        title: 'Trusted by Thousands',
        items: [
          { icon: '👨‍⚕️', title: '500+', description: 'Expert Doctors' },
          { icon: '😊', title: '50,000+', description: 'Happy Patients' },
          { icon: '📅', title: '100,000+', description: 'Appointments' },
          { icon: '⭐', title: '4.9', description: 'Average Rating' },
        ],
      },
      {
        section: 'cta',
        title: 'Ready to Take Control of Your Health?',
        subtitle: 'Join thousands of patients who trust Medicare for their healthcare needs.',
        items: [],
      },
      {
        section: 'footer',
        title: 'Medicare',
        description: 'Your trusted telemedicine platform for quality healthcare services.',
        items: [
          { title: 'Quick Links', description: 'Home,Doctors,Medicines,About' },
          { title: 'Services', description: 'Appointment Booking,Video Consultation,AI Symptom Checker,Medicine Delivery' },
          { title: 'Contact', description: 'support@medicare.com,+880 1234-567890,Dhaka, Bangladesh' },
        ],
        settings: { copyright: '© 2026 Medicare. All rights reserved.' },
      },
    ];

    for (const data of defaults) {
      await WebsiteContent.findOneAndUpdate(
        { section: data.section },
        data as any,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    const content = await WebsiteContent.find();
    const contentMap: Record<string, any> = {};
    content.forEach((c) => { contentMap[c.section] = c; });
    res.json({ success: true, data: contentMap, message: 'Default content seeded' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};