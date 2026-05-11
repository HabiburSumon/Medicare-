import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ReviewAttributes {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentId: number;
  rating: number;
  comment: string;
  isApproved: boolean;
}

type ReviewCreationAttributes = Optional<ReviewAttributes, 'id' | 'comment' | 'isApproved'>;

class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
  public id!: number;
  public patientId!: number;
  public doctorId!: number;
  public appointmentId!: number;
  public rating!: number;
  public comment!: string;
  public isApproved!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Review.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    patientId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    doctorId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    appointmentId: { type: DataTypes.INTEGER, allowNull: false, unique: true, references: { model: 'appointments', key: 'id' } },
    rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
    comment: { type: DataTypes.TEXT, defaultValue: '' },
    isApproved: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { sequelize, modelName: 'Review', tableName: 'reviews' }
);

export default Review;