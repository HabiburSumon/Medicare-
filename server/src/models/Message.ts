import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface MessageAttributes {
  id: number;
  senderId: number;
  receiverId: number;
  appointmentId: number | null;
  content: string;
  messageType: string;
  fileUrl: string;
  isRead: boolean;
}

type MessageCreationAttributes = Optional<MessageAttributes, 'id' | 'appointmentId' | 'content' | 'fileUrl' | 'isRead'>;

class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  public id!: number;
  public senderId!: number;
  public receiverId!: number;
  public appointmentId!: number | null;
  public content!: string;
  public messageType!: string;
  public fileUrl!: string;
  public isRead!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Message.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    senderId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    receiverId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    appointmentId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'appointments', key: 'id' } },
    content: { type: DataTypes.TEXT, defaultValue: '' },
    messageType: { type: DataTypes.ENUM('text', 'image', 'file', 'video'), defaultValue: 'text' },
    fileUrl: { type: DataTypes.STRING(500), defaultValue: '' },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { sequelize, modelName: 'Message', tableName: 'messages' }
);

export default Message;