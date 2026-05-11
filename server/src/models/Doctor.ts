import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface DoctorAttributes {
  id: number;
  userId: number;
  specialization: string;
  experience: number;
  qualification: string;
  bio: string;
  consultationFee: number;
  rating: number;
  totalReviews: number;
  availableDays: string; // JSON string
  timeSlots: string; // JSON string
  isAvailable: boolean;
  languages: string; // JSON string
  clinicAddress: string;
  documents: string; // JSON string
}

interface DoctorCreationAttributes extends Optional<DoctorAttributes, 'id' | 'rating' | 'totalReviews' | 'isAvailable' | 'bio' | 'clinicAddress' | 'languages' | 'documents'> {}

class Doctor extends Model<DoctorAttributes, DoctorCreationAttributes> implements DoctorAttributes {
  public id!: number;
  public userId!: number;
  public specialization!: string;
  public experience!: number;
  public qualification!: string;
  public bio!: string;
  public consultationFee!: number;
  public rating!: number;
  public totalReviews!: number;
  public availableDays!: string;
  public timeSlots!: string;
  public isAvailable!: boolean;
  public languages!: string;
  public clinicAddress!: string;
  public documents!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Virtual getters for JSON fields
  getAvailableDays(): string[] {
    try { return JSON.parse(this.availableDays || '[]'); } catch { return []; }
  }
  setAvailableDays(val: string[]) { this.availableDays = JSON.stringify(val); }
  getTimeSlots(): { start: string; end: string }[] {
    try { return JSON.parse(this.timeSlots || '[]'); } catch { return []; }
  }
  setTimeSlots(val: { start: string; end: string }[]) { this.timeSlots = JSON.stringify(val); }
  getLanguages(): string[] {
    try { return JSON.parse(this.languages || '[]'); } catch { return []; }
  }
  setLanguages(val: string[]) { this.languages = JSON.stringify(val); }
  getDocuments(): string[] {
    try { return JSON.parse(this.documents || '[]'); } catch { return []; }
  }
  setDocuments(val: string[]) { this.documents = JSON.stringify(val); }
}

Doctor.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, unique: true, references: { model: 'users', key: 'id' } },
    specialization: { type: DataTypes.STRING(100), allowNull: false },
    experience: { type: DataTypes.INTEGER, defaultValue: 0 },
    qualification: { type: DataTypes.STRING(255), allowNull: false },
    bio: { type: DataTypes.TEXT, defaultValue: '' },
    consultationFee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    rating: { type: DataTypes.DECIMAL(3, 1), defaultValue: 0 },
    totalReviews: { type: DataTypes.INTEGER, defaultValue: 0 },
    availableDays: { type: DataTypes.TEXT, defaultValue: '[]' },
    timeSlots: { type: DataTypes.TEXT, defaultValue: '[]' },
    isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
    languages: { type: DataTypes.TEXT, defaultValue: '[]' },
    clinicAddress: { type: DataTypes.STRING(500), defaultValue: '' },
    documents: { type: DataTypes.TEXT, defaultValue: '[]' },
  },
  { sequelize, modelName: 'Doctor', tableName: 'doctors' }
);

export default Doctor;