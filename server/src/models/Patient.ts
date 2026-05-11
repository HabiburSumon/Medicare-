import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PatientAttributes {
  id: number;
  userId: number;
  dateOfBirth: Date | null;
  gender: string | null;
  bloodGroup: string | null;
  address: string;
  medicalHistory: string;
  allergies: string; // JSON
  emergencyContact: string;
}

interface PatientCreationAttributes extends Optional<PatientAttributes, 'id' | 'dateOfBirth' | 'gender' | 'bloodGroup' | 'address' | 'medicalHistory' | 'allergies' | 'emergencyContact'> {}

class Patient extends Model<PatientAttributes, PatientCreationAttributes> implements PatientAttributes {
  public id!: number;
  public userId!: number;
  public dateOfBirth!: Date | null;
  public gender!: string | null;
  public bloodGroup!: string | null;
  public address!: string;
  public medicalHistory!: string;
  public allergies!: string;
  public emergencyContact!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Patient.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, unique: true, references: { model: 'users', key: 'id' } },
    dateOfBirth: { type: DataTypes.DATE, allowNull: true },
    gender: { type: DataTypes.ENUM('male', 'female', 'other'), allowNull: true },
    bloodGroup: { type: DataTypes.STRING(10), allowNull: true },
    address: { type: DataTypes.STRING(500), defaultValue: '' },
    medicalHistory: { type: DataTypes.TEXT, defaultValue: '' },
    allergies: { type: DataTypes.TEXT, defaultValue: '[]' },
    emergencyContact: { type: DataTypes.STRING(20), defaultValue: '' },
  },
  { sequelize, modelName: 'Patient', tableName: 'patients' }
);

export default Patient;