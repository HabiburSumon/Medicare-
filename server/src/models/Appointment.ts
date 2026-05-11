import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AppointmentAttributes {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentDate: Date;
  timeSlotStart: string;
  timeSlotEnd: string;
  serialNumber: string;
  status: string;
  type: string;
  notes: string;
  cancellationReason: string;
  paymentStatus: string;
  paymentId: string;
  meetingLink: string;
  recordedVideoUrl: string;
  doctorResponse: string;
  responseDate: Date | null;
}

type AppointmentCreationAttributes = Optional<AppointmentAttributes, 'id' | 'notes' | 'cancellationReason' | 'paymentStatus' | 'paymentId' | 'meetingLink' | 'recordedVideoUrl' | 'doctorResponse' | 'responseDate'>;

class Appointment extends Model<AppointmentAttributes, AppointmentCreationAttributes> implements AppointmentAttributes {
  public id!: number;
  public patientId!: number;
  public doctorId!: number;
  public appointmentDate!: Date;
  public timeSlotStart!: string;
  public timeSlotEnd!: string;
  public serialNumber!: string;
  public status!: string;
  public type!: string;
  public notes!: string;
  public cancellationReason!: string;
  public paymentStatus!: string;
  public paymentId!: string;
  public meetingLink!: string;
  public recordedVideoUrl!: string;
  public doctorResponse!: string;
  public responseDate!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Appointment.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    patientId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    doctorId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    appointmentDate: { type: DataTypes.DATE, allowNull: false },
    timeSlotStart: { type: DataTypes.STRING(20), allowNull: false },
    timeSlotEnd: { type: DataTypes.STRING(20), allowNull: false },
    serialNumber: { type: DataTypes.STRING(50), unique: true, allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed', 'rejected'), defaultValue: 'pending' },
    type: { type: DataTypes.ENUM('video', 'recorded-video'), defaultValue: 'video' },
    notes: { type: DataTypes.TEXT, defaultValue: '' },
    cancellationReason: { type: DataTypes.TEXT, defaultValue: '' },
    paymentStatus: { type: DataTypes.ENUM('pending', 'paid', 'refunded'), defaultValue: 'pending' },
    paymentId: { type: DataTypes.STRING(255), defaultValue: '' },
    meetingLink: { type: DataTypes.STRING(500), defaultValue: '' },
    recordedVideoUrl: { type: DataTypes.STRING(500), defaultValue: '' },
    doctorResponse: { type: DataTypes.TEXT, defaultValue: '' },
    responseDate: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, modelName: 'Appointment', tableName: 'appointments' }
);

export default Appointment;