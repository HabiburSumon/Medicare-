import { Response } from 'express';
import WebsiteContent from '../models/WebsiteContent';
import { AuthRequest } from '../middleware/auth';

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