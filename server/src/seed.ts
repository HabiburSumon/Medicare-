import dotenv from 'dotenv';
dotenv.config();

import sequelize from './config/database';
import './models/index';

import User from './models/User';
import Doctor from './models/Doctor';
import Patient from './models/Patient';
import Appointment from './models/Appointment';
import Review from './models/Review';
import Medicine from './models/Medicine';

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL');

    await sequelize.sync({ force: true });
    console.log('✅ Database synced (tables recreated)');

    // Create Admin
    const admin = await User.create({
      name: 'Admin User', email: 'admin@telemed.com', password: 'admin123', role: 'admin', phone: '+8801700000000', isVerified: true,
    });
    console.log('✅ Admin created');

    // Create Doctors
    const doctorData = [
      { name: 'Dr. Sarah Chen', email: 'sarah@telemed.com', phone: '+8801711111111', specialization: 'Cardiologist', qualification: 'MBBS, MD (Cardiology)', experience: 12, consultationFee: 1500, bio: 'Board-certified cardiologist with 12+ years of experience.' },
      { name: 'Dr. James Wilson', email: 'james@telemed.com', phone: '+8801722222222', specialization: 'Dermatologist', qualification: 'MBBS, MD (Dermatology)', experience: 8, consultationFee: 1200, bio: 'Expert dermatologist specializing in skin conditions.' },
      { name: 'Dr. Emily Rodriguez', email: 'emily@telemed.com', phone: '+8801733333333', specialization: 'Neurologist', qualification: 'MBBS, MD (Neurology)', experience: 15, consultationFee: 1800, bio: 'Renowned neurologist with expertise in brain disorders.' },
      { name: 'Dr. Michael Chang', email: 'michael@telemed.com', phone: '+8801744444444', specialization: 'Orthopedic', qualification: 'MBBS, MS (Orthopedics)', experience: 10, consultationFee: 1400, bio: 'Orthopedic surgeon specializing in joint replacements.' },
      { name: 'Dr. Lisa Thompson', email: 'lisa@telemed.com', phone: '+8801755555555', specialization: 'Gynecologist', qualification: 'MBBS, MS (Gynecology)', experience: 14, consultationFee: 1300, bio: 'Experienced gynecologist and obstetrician.' },
      { name: 'Dr. Robert Kim', email: 'robert@telemed.com', phone: '+8801766666666', specialization: 'General Physician', qualification: 'MBBS, FCPS', experience: 6, consultationFee: 500, bio: 'Dedicated general physician providing primary healthcare.' },
      { name: 'Dr. Aisha Begum', email: 'aisha@telemed.com', phone: '+8801777777777', specialization: 'Pediatrician', qualification: 'MBBS, DCH, MD', experience: 9, consultationFee: 1000, bio: 'Child specialist with 9 years of experience.' },
      { name: 'Dr. Kamal Hossain', email: 'kamal@telemed.com', phone: '+8801788888888', specialization: 'Psychiatrist', qualification: 'MBBS, MD (Psychiatry)', experience: 11, consultationFee: 1600, bio: 'Psychiatrist specializing in mental health disorders.' },
    ];

    const defaultTimeSlots = JSON.stringify([
      { start: '09:00 AM', end: '10:00 AM' },
      { start: '10:00 AM', end: '11:00 AM' },
      { start: '11:00 AM', end: '12:00 PM' },
      { start: '02:00 PM', end: '03:00 PM' },
      { start: '03:00 PM', end: '04:00 PM' },
      { start: '04:00 PM', end: '05:00 PM' },
    ]);
    const defaultDays = JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);

    for (const doc of doctorData) {
      const user = await User.create({
        name: doc.name, email: doc.email, password: 'doctor123', role: 'doctor', phone: doc.phone, isVerified: true,
      });
      await Doctor.create({
        userId: user.id, specialization: doc.specialization, qualification: doc.qualification,
        experience: doc.experience, consultationFee: doc.consultationFee, bio: doc.bio,
        availableDays: defaultDays, timeSlots: defaultTimeSlots, isAvailable: true,
        rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
      });
    }
    console.log('✅ Doctors created');

    // Create Patients
    const patientNames = ['Rahim Uddin', 'Fatima Akter', 'Karim Rahman', 'Nusrat Jahan', 'Tanvir Ahmed', 'Sabrina Islam', 'Arif Hossain', 'Mim Akter'];
    for (const name of patientNames) {
      const email = name.toLowerCase().replace(' ', '.') + '@patient.com';
      const user = await User.create({
        name, email, password: 'patient123', role: 'patient', phone: `+88017${Math.floor(10000000 + Math.random() * 90000000)}`,
      });
      await Patient.create({ userId: user.id, dateOfBirth: null, bloodGroup: null, address: 'Dhaka, Bangladesh' });
    }
    console.log('✅ Patients created');

    // Create Medicines
    const medicines = [
      { name: 'Paracetamol 500mg', genericName: 'Acetaminophen', category: 'Pain Relief', price: 50, dosageForm: 'Tablet', strength: '500mg', packSize: '10 strips', inStock: true, requiresPrescription: false },
      { name: 'Amoxicillin 500mg', genericName: 'Amoxicillin', category: 'Antibiotics', price: 120, dosageForm: 'Capsule', strength: '500mg', packSize: '3 strips', inStock: true, requiresPrescription: true },
      { name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'Gastrointestinal', price: 80, dosageForm: 'Capsule', strength: '20mg', packSize: '2 strips', inStock: true, requiresPrescription: true },
      { name: 'Cetirizine 10mg', genericName: 'Cetirizine', category: 'Allergy', price: 45, dosageForm: 'Tablet', strength: '10mg', packSize: '2 strips', inStock: true, requiresPrescription: false },
      { name: 'Metformin 500mg', genericName: 'Metformin', category: 'Diabetes', price: 60, dosageForm: 'Tablet', strength: '500mg', packSize: '5 strips', inStock: true, requiresPrescription: true },
      { name: 'Amlodipine 5mg', genericName: 'Amlodipine', category: 'Blood Pressure', price: 70, dosageForm: 'Tablet', strength: '5mg', packSize: '3 strips', inStock: true, requiresPrescription: true },
      { name: 'Azithromycin 500mg', genericName: 'Azithromycin', category: 'Antibiotics', price: 180, dosageForm: 'Tablet', strength: '500mg', packSize: '1 strip', inStock: true, requiresPrescription: true },
      { name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', category: 'Pain Relief', price: 55, dosageForm: 'Tablet', strength: '400mg', packSize: '3 strips', inStock: true, requiresPrescription: false },
      { name: 'Salbutamol Inhaler', genericName: 'Salbutamol', category: 'Respiratory', price: 250, dosageForm: 'Inhaler', strength: '100mcg', packSize: '1 inhaler', inStock: true, requiresPrescription: true },
      { name: 'ORS Saline', genericName: 'Oral Rehydration Salts', category: 'Electrolytes', price: 20, dosageForm: 'Sachet', strength: '22.5g', packSize: '10 sachets', inStock: true, requiresPrescription: false },
    ];
    for (const med of medicines) {
      await Medicine.create(med);
    }
    console.log('✅ Medicines created');

    // Create sample appointments
    const patients = await User.findAll({ where: { role: 'patient' }, limit: 3 });
    const doctors = await User.findAll({ where: { role: 'doctor' }, limit: 3 });
    const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];

    for (let i = 0; i < 6; i++) {
      const pat = patients[i % patients.length];
      const doc = doctors[i % doctors.length];
      await Appointment.create({
        patientId: pat.id, doctorId: doc.id,
        appointmentDate: new Date(Date.now() + (i - 2) * 86400000),
        timeSlotStart: '10:00 AM', timeSlotEnd: '11:00 AM',
        serialNumber: `APT-${Date.now().toString(36).toUpperCase()}-${i}`,
        type: 'video', status: statuses[i % statuses.length],
      });
    }
    console.log('✅ Sample appointments created');

    console.log('\n🎉 Seed completed successfully!');
    console.log('\nLogin credentials:');
    console.log('  Admin:   admin@telemed.com / admin123');
    console.log('  Doctor:  sarah@telemed.com / doctor123');
    console.log('  Patient: rahim.uddin@patient.com / patient123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();