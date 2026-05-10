import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User';
import Doctor from './models/Doctor';
import Patient from './models/Patient';
import Appointment from './models/Appointment';
import Review from './models/Review';
import Medicine from './models/Medicine';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/doctor_appointment';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('📦 Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await Review.deleteMany({});
    await Medicine.deleteMany({});
    console.log('🗑️  Cleared existing data');

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // ==================== ADMIN USER ====================
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@medicare.com',
      password: 'password123',
      role: 'admin',
      phone: '+8801700000001',
      isVerified: true,
      isActive: true,
    });
    console.log('👤 Admin created:', adminUser.email);

    // ==================== DOCTOR USERS ====================
    const doctorData = [
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@medicare.com',
        phone: '+8801710000001',
        specialization: 'Cardiologist',
        experience: 15,
        qualification: 'MBBS, MD (Cardiology), FACC',
        bio: 'Dr. Sarah Johnson is a highly experienced cardiologist specializing in interventional cardiology and heart failure management. She has performed over 2000 cardiac procedures.',
        consultationFee: 1500,
        rating: 4.8,
        totalReviews: 234,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timeSlots: [{ start: '09:00', end: '17:00' }],
        languages: ['English', 'Bengali'],
        clinicAddress: 'Room 301, Heart Care Center, Dhaka',
      },
      {
        name: 'Dr. Rajesh Patel',
        email: 'rajesh.patel@medicare.com',
        phone: '+8801710000002',
        specialization: 'Dermatologist',
        experience: 12,
        qualification: 'MBBS, MD (Dermatology)',
        bio: 'Dr. Rajesh Patel is a board-certified dermatologist with expertise in cosmetic dermatology, skin cancer screening, and treatment of chronic skin conditions.',
        consultationFee: 1200,
        rating: 4.6,
        totalReviews: 189,
        availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
        timeSlots: [{ start: '10:00', end: '18:00' }],
        languages: ['English', 'Hindi', 'Bengali'],
        clinicAddress: 'Suite 205, Skin Care Clinic, Gulshan, Dhaka',
      },
      {
        name: 'Dr. Fatima Ahmed',
        email: 'fatima.ahmed@medicare.com',
        phone: '+8801710000003',
        specialization: 'Gynecologist',
        experience: 18,
        qualification: 'MBBS, MS (Obstetrics & Gynecology), FRCOG',
        bio: 'Dr. Fatima Ahmed is a renowned gynecologist with 18 years of experience in women\'s health, prenatal care, and minimally invasive surgical procedures.',
        consultationFee: 1800,
        rating: 4.9,
        totalReviews: 312,
        availableDays: ['Monday', 'Tuesday', 'Thursday', 'Saturday'],
        timeSlots: [{ start: '08:00', end: '16:00' }],
        languages: ['English', 'Bengali'],
        clinicAddress: 'Room 102, Women\'s Health Center, Dhanmondi, Dhaka',
      },
      {
        name: 'Dr. Michael Chen',
        email: 'michael.chen@medicare.com',
        phone: '+8801710000004',
        specialization: 'Neurologist',
        experience: 20,
        qualification: 'MBBS, MD (Neurology), PhD',
        bio: 'Dr. Michael Chen is a distinguished neurologist specializing in stroke management, epilepsy treatment, and neurodegenerative disorders. Published over 50 research papers.',
        consultationFee: 2000,
        rating: 4.7,
        totalReviews: 156,
        availableDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timeSlots: [{ start: '09:00', end: '17:00' }],
        languages: ['English', 'Mandarin', 'Bengali'],
        clinicAddress: 'Floor 5, Neurology Center, Banani, Dhaka',
      },
      {
        name: 'Dr. Aisha Rahman',
        email: 'aisha.rahman@medicare.com',
        phone: '+8801710000005',
        specialization: 'Pediatrician',
        experience: 10,
        qualification: 'MBBS, DCH, MD (Pediatrics)',
        bio: 'Dr. Aisha Rahman is a compassionate pediatrician dedicated to providing comprehensive healthcare for infants, children, and adolescents.',
        consultationFee: 800,
        rating: 4.9,
        totalReviews: 421,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        timeSlots: [{ start: '09:00', end: '19:00' }],
        languages: ['English', 'Bengali'],
        clinicAddress: 'Room 104, Child Care Hospital, Mirpur, Dhaka',
      },
      {
        name: 'Dr. James Wilson',
        email: 'james.wilson@medicare.com',
        phone: '+8801710000006',
        specialization: 'Orthopedic Surgeon',
        experience: 22,
        qualification: 'MBBS, MS (Orthopedics), FRCS',
        bio: 'Dr. James Wilson is an expert orthopedic surgeon specializing in joint replacement, sports medicine, and spine surgery with over 5000 successful surgeries.',
        consultationFee: 2500,
        rating: 4.5,
        totalReviews: 98,
        availableDays: ['Monday', 'Wednesday', 'Friday'],
        timeSlots: [{ start: '10:00', end: '15:00' }],
        languages: ['English', 'Bengali'],
        clinicAddress: 'Floor 3, Ortho Care Hospital, Uttara, Dhaka',
      },
      {
        name: 'Dr. Nadia Islam',
        email: 'nadia.islam@medicare.com',
        phone: '+8801710000007',
        specialization: 'Psychiatrist',
        experience: 14,
        qualification: 'MBBS, MD (Psychiatry)',
        bio: 'Dr. Nadia Islam is a board-certified psychiatrist with expertise in anxiety disorders, depression, and cognitive behavioral therapy.',
        consultationFee: 1600,
        rating: 4.8,
        totalReviews: 276,
        availableDays: ['Monday', 'Tuesday', 'Thursday', 'Saturday'],
        timeSlots: [{ start: '10:00', end: '18:00' }],
        languages: ['English', 'Bengali'],
        clinicAddress: 'Suite 302, Mind Wellness Center, Bashundhara, Dhaka',
      },
      {
        name: 'Dr. Karim Hossain',
        email: 'karim.hossain@medicare.com',
        phone: '+8801710000008',
        specialization: 'General Physician',
        experience: 8,
        qualification: 'MBBS, FCPS',
        bio: 'Dr. Karim Hossain is a skilled general physician providing primary healthcare, preventive medicine, and management of chronic conditions.',
        consultationFee: 500,
        rating: 4.4,
        totalReviews: 534,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        timeSlots: [{ start: '08:00', end: '20:00' }],
        languages: ['English', 'Bengali'],
        clinicAddress: 'Room 201, General Hospital, Mohakhali, Dhaka',
      },
    ];

    const doctorUsers = [];
    const doctorProfiles = [];

    const doctorAvatars = [
      'https://randomuser.me/api/portraits/women/44.jpg',
      'https://randomuser.me/api/portraits/men/32.jpg',
      'https://randomuser.me/api/portraits/women/68.jpg',
      'https://randomuser.me/api/portraits/men/75.jpg',
      'https://randomuser.me/api/portraits/women/90.jpg',
      'https://randomuser.me/api/portraits/men/22.jpg',
      'https://randomuser.me/api/portraits/women/50.jpg',
      'https://randomuser.me/api/portraits/men/60.jpg',
    ];

    for (let di = 0; di < doctorData.length; di++) {
      const doc = doctorData[di];
      const user = await User.create({
        name: doc.name,
        email: doc.email,
        password: 'password123',
        role: 'doctor',
        phone: doc.phone,
        avatar: doctorAvatars[di] || '',
        isVerified: true,
        isActive: true,
      });

      const doctorProfile = await Doctor.create({
        user: user._id,
        specialization: doc.specialization,
        experience: doc.experience,
        qualification: doc.qualification,
        bio: doc.bio,
        consultationFee: doc.consultationFee,
        rating: doc.rating,
        totalReviews: doc.totalReviews,
        availableDays: doc.availableDays,
        timeSlots: doc.timeSlots,
        languages: doc.languages,
        clinicAddress: doc.clinicAddress,
        isAvailable: true,
      });

      doctorUsers.push(user);
      doctorProfiles.push(doctorProfile);
      console.log('👨‍⚕️  Doctor created:', doc.name, '-', doc.specialization);
    }

    // ==================== PATIENT USERS ====================
    const patientData = [
      { name: 'Rahul Sharma', email: 'rahul@gmail.com', phone: '+8801810000001' },
      { name: 'Nusrat Jahan', email: 'nusrat@gmail.com', phone: '+8801810000002' },
      { name: 'Ahmed Khan', email: 'ahmed@gmail.com', phone: '+8801810000003' },
      { name: 'Priya Das', email: 'priya@gmail.com', phone: '+8801810000004' },
      { name: 'Hasan Mahmud', email: 'hasan@gmail.com', phone: '+8801810000005' },
    ];

    const patientUsers = [];

    for (const pat of patientData) {
      const user = await User.create({
        name: pat.name,
        email: pat.email,
        password: 'password123',
        role: 'patient',
        phone: pat.phone,
        isVerified: true,
        isActive: true,
      });

      const patientProfile = await Patient.create({
        user: user._id,
        dateOfBirth: new Date(1990, 0, 1),
        gender: pat.name.includes('Nusrat') || pat.name.includes('Priya') ? 'female' : 'male',
        bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'B-'][Math.floor(Math.random() * 5)],
        address: 'Dhaka, Bangladesh',
        medicalHistory: 'No major illnesses',
      });

      patientUsers.push(user);
      console.log('🧑 Patient created:', pat.name);
    }

    // ==================== APPOINTMENTS ====================
    const appointmentStatuses = ['pending', 'confirmed', 'completed', 'completed', 'completed', 'cancelled'];
    const appointments = [];

    for (let i = 0; i < 12; i++) {
      const patientIdx = i % patientUsers.length;
      const doctorIdx = i % doctorUsers.length;
      const status = appointmentStatuses[i % appointmentStatuses.length];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 7));

      const serialNumber = `APT-${Date.now().toString(36).toUpperCase()}-${(i + 1).toString().padStart(4, '0')}`;

      const appointment = await Appointment.create({
        patient: patientUsers[patientIdx]._id,
        doctor: doctorUsers[doctorIdx]._id,
        appointmentDate: date,
        timeSlot: { start: '10:00', end: '10:30' },
        serialNumber,
        status,
        notes: `Consultation for general checkup - Visit ${i + 1}`,
        type: i % 3 === 0 ? 'video' : 'recorded-video',
      });
      appointments.push(appointment);
    }
    console.log('📅 Created 12 appointments');

    // ==================== REVIEWS ====================
    const reviewComments = [
      'Excellent doctor! Very thorough examination and clear explanation.',
      'Great experience. Doctor was very patient and caring.',
      'Highly recommended. Very professional and knowledgeable.',
      'Good consultation. Explained everything in detail.',
      'Very friendly and understanding. Treatment was effective.',
    ];

    for (let i = 0; i < 5; i++) {
      await Review.create({
        patient: patientUsers[i]._id,
        doctor: doctorUsers[i]._id,
        appointment: appointments[i]._id,
        rating: Math.round((4 + Math.random()) * 10) / 10,
        comment: reviewComments[i],
      });
    }
    console.log('⭐ Created 5 reviews');

    // ==================== MEDICINES ====================
    const medicines = [
      { name: 'Paracetamol 500mg', genericName: 'Paracetamol', category: 'Pain Relief', price: 50, manufacturer: 'Square Pharma', description: 'Effective for fever and mild to moderate pain', inStock: true, dosageForm: 'Tablet', strength: '500mg', requiresPrescription: false, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop' },
      { name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', category: 'Antibiotics', price: 120, manufacturer: 'Beximco Pharma', description: 'Broad-spectrum antibiotic for bacterial infections', inStock: true, dosageForm: 'Capsule', strength: '250mg', requiresPrescription: true, image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop' },
      { name: 'Omeprazole 20mg', genericName: 'Omeprazole', category: 'Gastrointestinal', price: 80, manufacturer: 'Incepta Pharma', description: 'Reduces stomach acid for acid reflux treatment', inStock: true, dosageForm: 'Capsule', strength: '20mg', requiresPrescription: false, image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=400&fit=crop' },
      { name: 'Metformin 500mg', genericName: 'Metformin', category: 'Diabetes', price: 60, manufacturer: 'Square Pharma', description: 'Controls blood sugar levels in type 2 diabetes', inStock: true, dosageForm: 'Tablet', strength: '500mg', requiresPrescription: true, image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop' },
      { name: 'Amlodipine 5mg', genericName: 'Amlodipine', category: 'Blood Pressure', price: 70, manufacturer: 'Opsonin Pharma', description: 'Calcium channel blocker for high blood pressure', inStock: true, dosageForm: 'Tablet', strength: '5mg', requiresPrescription: true, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop' },
      { name: 'Cetirizine 10mg', genericName: 'Cetirizine', category: 'Allergy', price: 40, manufacturer: 'Eskayef Pharma', description: 'Antihistamine for allergy relief', inStock: true, dosageForm: 'Tablet', strength: '10mg', requiresPrescription: false, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop' },
      { name: 'Azithromycin 500mg', genericName: 'Azithromycin', category: 'Antibiotics', price: 180, manufacturer: 'Beximco Pharma', description: 'Macrolide antibiotic for various infections', inStock: true, dosageForm: 'Tablet', strength: '500mg', requiresPrescription: true, image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&h=400&fit=crop' },
      { name: 'Pantoprazole 40mg', genericName: 'Pantoprazole', category: 'Gastrointestinal', price: 90, manufacturer: 'ACI Pharma', description: 'Proton pump inhibitor for gastric acid reduction', inStock: true, dosageForm: 'Tablet', strength: '40mg', requiresPrescription: false, image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&h=400&fit=crop' },
      { name: 'Losartan 50mg', genericName: 'Losartan', category: 'Blood Pressure', price: 85, manufacturer: 'Square Pharma', description: 'Angiotensin receptor blocker for hypertension', inStock: true, dosageForm: 'Tablet', strength: '50mg', requiresPrescription: true, image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop' },
      { name: 'Montelukast 10mg', genericName: 'Montelukast', category: 'Respiratory', price: 95, manufacturer: 'Incepta Pharma', description: 'Leukotriene receptor antagonist for asthma prevention', inStock: true, dosageForm: 'Tablet', strength: '10mg', requiresPrescription: true, image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=400&fit=crop' },
      { name: 'Vitamin D3 1000IU', genericName: 'Cholecalciferol', category: 'Supplements', price: 150, manufacturer: 'Nutrify Pharma', description: 'Essential vitamin for bone health and immunity', inStock: true, dosageForm: 'Capsule', strength: '1000IU', requiresPrescription: false, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop' },
      { name: 'Ibuprofen 400mg', genericName: 'Ibuprofen', category: 'Pain Relief', price: 55, manufacturer: 'Opsonin Pharma', description: 'NSAID for pain, inflammation and fever', inStock: true, dosageForm: 'Tablet', strength: '400mg', requiresPrescription: false, image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&h=400&fit=crop' },
    ];

    for (const med of medicines) {
      await Medicine.create(med);
    }
    console.log('💊 Created 12 medicines');

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 DEMO CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 Admin:    admin@medicare.com / password123');
    console.log('👨‍⚕️  Doctor 1: sarah.johnson@medicare.com / password123');
    console.log('👨‍⚕️  Doctor 2: rajesh.patel@medicare.com / password123');
    console.log('👨‍⚕️  Doctor 3: fatima.ahmed@medicare.com / password123');
    console.log('👨‍⚕️  Doctor 4: michael.chen@medicare.com / password123');
    console.log('👨‍⚕️  Doctor 5: aisha.rahman@medicare.com / password123');
    console.log('🧑 Patient 1: rahul@gmail.com / password123');
    console.log('🧑 Patient 2: nusrat@gmail.com / password123');
    console.log('🧑 Patient 3: ahmed@gmail.com / password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();