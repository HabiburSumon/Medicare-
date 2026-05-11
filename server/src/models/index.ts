import User from './User';
import Doctor from './Doctor';
import Patient from './Patient';
import Appointment from './Appointment';
import Message from './Message';
import Medicine from './Medicine';
import Order from './Order';
import Review from './Review';
import Favorite from './Favorite';
import Notification from './Notification';
import Prescription from './Prescription';
import WebsiteContent from './WebsiteContent';

// User -> Doctor (1:1)
User.hasOne(Doctor, { foreignKey: 'userId', as: 'doctorProfile' });
Doctor.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User -> Patient (1:1)
User.hasOne(Patient, { foreignKey: 'userId', as: 'patientProfile' });
Patient.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Appointment associations
User.hasMany(Appointment, { foreignKey: 'patientId', as: 'patientAppointments' });
User.hasMany(Appointment, { foreignKey: 'doctorId', as: 'doctorAppointments' });
Appointment.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
Appointment.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });
Appointment.hasOne(Prescription, { foreignKey: 'appointmentId', as: 'prescription' });

// Message associations
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// Review associations
User.hasMany(Review, { foreignKey: 'patientId', as: 'givenReviews' });
User.hasMany(Review, { foreignKey: 'doctorId', as: 'receivedReviews' });
Review.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
Review.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

// Favorite associations
User.hasMany(Favorite, { foreignKey: 'patientId', as: 'favorites' });
Favorite.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
Favorite.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

// Notification associations
User.hasMany(Notification, { foreignKey: 'recipientId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });
Notification.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// Order associations
User.hasMany(Order, { foreignKey: 'patientId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });

// Prescription associations
User.hasMany(Prescription, { foreignKey: 'patientId', as: 'prescriptions' });
User.hasMany(Prescription, { foreignKey: 'doctorId', as: 'doctorPrescriptions' });
Prescription.belongsTo(User, { foreignKey: 'patientId', as: 'patient' });
Prescription.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

export {
  User, Doctor, Patient, Appointment, Message,
  Medicine, Order, Review, Favorite, Notification,
  Prescription, WebsiteContent
};