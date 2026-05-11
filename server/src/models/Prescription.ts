import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PrescriptionAttributes {
  id: number;
  appointmentId: number;
  patientId: number;
  doctorId: number;
  diagnosis: string;
  symptoms: string; // JSON array
  medicines: string; // JSON array of {name, dosage, duration, instructions}
  tests: string; // JSON array
  testResults: string; // JSON array
  notes: string;
  followUpDate: Date | null;
}

type PrescriptionCreationAttributes = Optional<PrescriptionAttributes, 'id' | 'symptoms' | 'tests' | 'testResults' | 'notes' | 'followUpDate'>;

class Prescription extends Model<PrescriptionAttributes, PrescriptionCreationAttributes> implements PrescriptionAttributes {
  public id!: number;
  public appointmentId!: number;
  public patientId!: number;
  public doctorId!: number;
  public diagnosis!: string;
  public symptoms!: string;
  public medicines!: string;
  public tests!: string;
  public testResults!: string;
  public notes!: string;
  public followUpDate!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Prescription.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    appointmentId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'appointments', key: 'id' } },
    patientId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    doctorId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    diagnosis: { type: DataTypes.TEXT, allowNull: false },
    symptoms: { type: DataTypes.TEXT, defaultValue: '[]' },
    medicines: { type: DataTypes.TEXT, allowNull: false, defaultValue: '[]' },
    tests: { type: DataTypes.TEXT, defaultValue: '[]' },
    testResults: { type: DataTypes.TEXT, defaultValue: '[]' },
    notes: { type: DataTypes.TEXT, defaultValue: '' },
    followUpDate: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, modelName: 'Prescription', tableName: 'prescriptions' }
);

export default Prescription;