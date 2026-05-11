import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface NotificationAttributes {
  id: number;
  recipientId: number;
  senderId: number | null;
  type: string;
  title: string;
  message: string;
  data: string; // JSON
  isRead: boolean;
  link: string;
}

type NotificationCreationAttributes = Optional<NotificationAttributes, 'id' | 'senderId' | 'data' | 'isRead' | 'link'>;

class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  public id!: number;
  public recipientId!: number;
  public senderId!: number | null;
  public type!: string;
  public title!: string;
  public message!: string;
  public data!: string;
  public isRead!: boolean;
  public link!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Notification.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    recipientId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    senderId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'users', key: 'id' } },
    type: { type: DataTypes.ENUM('appointment_booked', 'appointment_confirmed', 'appointment_cancelled', 'prescription_sent', 'new_message', 'system'), defaultValue: 'system' },
    title: { type: DataTypes.STRING(255), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    data: { type: DataTypes.TEXT, defaultValue: '{}' },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
    link: { type: DataTypes.STRING(500), defaultValue: '' },
  },
  { sequelize, modelName: 'Notification', tableName: 'notifications' }
);

export default Notification;