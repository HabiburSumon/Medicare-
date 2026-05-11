import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface OrderAttributes {
  id: number;
  patientId: number;
  prescriptionId: number | null;
  items: string; // JSON array of {medicineId, name, quantity, price}
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  couponCode: string;
  status: string;
  paymentStatus: string;
  paymentId: string;
  shippingAddress: string;
  phone: string;
}

type OrderCreationAttributes = Optional<OrderAttributes, 'id' | 'prescriptionId' | 'discountAmount' | 'couponCode' | 'status' | 'paymentStatus' | 'paymentId'>;

class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public patientId!: number;
  public prescriptionId!: number | null;
  public items!: string;
  public totalAmount!: number;
  public discountAmount!: number;
  public finalAmount!: number;
  public couponCode!: string;
  public status!: string;
  public paymentStatus!: string;
  public paymentId!: string;
  public shippingAddress!: string;
  public phone!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    patientId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    prescriptionId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'prescriptions', key: 'id' } },
    items: { type: DataTypes.TEXT, allowNull: false, defaultValue: '[]' },
    totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    discountAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    finalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    couponCode: { type: DataTypes.STRING(50), defaultValue: '' },
    status: { type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'), defaultValue: 'pending' },
    paymentStatus: { type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'), defaultValue: 'pending' },
    paymentId: { type: DataTypes.STRING(255), defaultValue: '' },
    shippingAddress: { type: DataTypes.TEXT, allowNull: false },
    phone: { type: DataTypes.STRING(20), allowNull: false },
  },
  { sequelize, modelName: 'Order', tableName: 'orders' }
);

export default Order;