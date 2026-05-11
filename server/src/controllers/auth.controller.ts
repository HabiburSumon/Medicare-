import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import User from '../models/User';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

function generateToken(id: number, role: string): string {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '7d' } as any);
}

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, phone } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email already registered' });
      return;
    }
    const user = await User.create({ name, email, password, role, phone });

    // Auto-create Doctor or Patient profile
    if (role === 'doctor') {
      await Doctor.create({
        userId: user.id,
        specialization: 'General Physician',
        experience: 0,
        qualification: 'MBBS',
        consultationFee: 500,
        availableDays: JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
        timeSlots: JSON.stringify([
          { start: '09:00 AM', end: '10:00 AM' },
          { start: '10:00 AM', end: '11:00 AM' },
          { start: '11:00 AM', end: '12:00 PM' },
          { start: '02:00 PM', end: '03:00 PM' },
          { start: '03:00 PM', end: '04:00 PM' },
          { start: '04:00 PM', end: '05:00 PM' },
        ]),
        isAvailable: true,
        bio: '',
      });
    } else if (role === 'patient') {
      await Patient.create({
        userId: user.id,
        dateOfBirth: null,
        bloodGroup: null,
        address: '',
      });
    }

    const token = generateToken(user.id, user.role);
    res.status(201).json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, avatar: user.avatar },
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password' });
      return;
    }
    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }
    if (!user.isActive) {
      res.status(401).json({ success: false, message: 'Account is deactivated' });
      return;
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }
    // Auto-create missing Doctor or Patient profile
    if (user.role === 'doctor') {
      const existingDoc = await Doctor.findOne({ where: { userId: user.id } });
      if (!existingDoc) {
        await Doctor.create({
          userId: user.id,
          specialization: 'General Physician',
          experience: 0,
          qualification: 'MBBS',
          consultationFee: 500,
          availableDays: JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
          timeSlots: JSON.stringify([
            { start: '09:00 AM', end: '10:00 AM' },
            { start: '10:00 AM', end: '11:00 AM' },
            { start: '11:00 AM', end: '12:00 PM' },
            { start: '02:00 PM', end: '03:00 PM' },
            { start: '03:00 PM', end: '04:00 PM' },
            { start: '04:00 PM', end: '05:00 PM' },
          ]),
          isAvailable: true,
          bio: '',
        });
      }
    } else if (user.role === 'patient') {
      const existingPat = await Patient.findOne({ where: { userId: user.id } });
      if (!existingPat) {
        await Patient.create({ userId: user.id, dateOfBirth: null, bloodGroup: null, address: '' });
      }
    }

    const token = generateToken(user.id, user.role);
    res.json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, avatar: user.avatar, isVerified: user.isVerified },
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByPk(req.userId);
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    await user.update({ name, phone, avatar });
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.scope('withPassword').findByPk(req.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Current password is incorrect' });
      return;
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};