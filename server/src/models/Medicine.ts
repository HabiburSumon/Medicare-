import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface MedicineAttributes {
  id: number;
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  price: number;
  discount: number;
  description: string;
  image: string;
  images: string; // JSON
  inStock: boolean;
  requiresPrescription: boolean;
  dosageForm: string;
  strength: string;
  packSize: string;
  sideEffects: string;
  warnings: string;
  dosageInstructions: string;
  storageInstructions: string;
  indications: string;
  rating: number;
  numReviews: number;
  soldCount: number;
}

type MedicineCreationAttributes = Optional<MedicineAttributes, 'id' | 'discount' | 'description' | 'image' | 'images' | 'inStock' | 'requiresPrescription' | 'dosageForm' | 'strength' | 'packSize' | 'sideEffects' | 'warnings' | 'dosageInstructions' | 'storageInstructions' | 'indications' | 'rating' | 'numReviews' | 'soldCount' | 'manufacturer'>;

class Medicine extends Model<MedicineAttributes, MedicineCreationAttributes> implements MedicineAttributes {
  public id!: number;
  public name!: string;
  public genericName!: string;
  public category!: string;
  public manufacturer!: string;
  public price!: number;
  public discount!: number;
  public description!: string;
  public image!: string;
  public images!: string;
  public inStock!: boolean;
  public requiresPrescription!: boolean;
  public dosageForm!: string;
  public strength!: string;
  public packSize!: string;
  public sideEffects!: string;
  public warnings!: string;
  public dosageInstructions!: string;
  public storageInstructions!: string;
  public indications!: string;
  public rating!: number;
  public numReviews!: number;
  public soldCount!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Medicine.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    genericName: { type: DataTypes.STRING(255), allowNull: false },
    category: { type: DataTypes.STRING(100), allowNull: false },
    manufacturer: { type: DataTypes.STRING(255), defaultValue: '' },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    discount: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
    description: { type: DataTypes.TEXT, defaultValue: '' },
    image: { type: DataTypes.STRING(500), defaultValue: '' },
    images: { type: DataTypes.TEXT, defaultValue: '[]' },
    inStock: { type: DataTypes.BOOLEAN, defaultValue: true },
    requiresPrescription: { type: DataTypes.BOOLEAN, defaultValue: false },
    dosageForm: { type: DataTypes.STRING(100), defaultValue: '' },
    strength: { type: DataTypes.STRING(100), defaultValue: '' },
    packSize: { type: DataTypes.STRING(100), defaultValue: '' },
    sideEffects: { type: DataTypes.TEXT, defaultValue: '' },
    warnings: { type: DataTypes.TEXT, defaultValue: '' },
    dosageInstructions: { type: DataTypes.TEXT, defaultValue: '' },
    storageInstructions: { type: DataTypes.TEXT, defaultValue: '' },
    indications: { type: DataTypes.TEXT, defaultValue: '' },
    rating: { type: DataTypes.DECIMAL(3, 1), defaultValue: 0 },
    numReviews: { type: DataTypes.INTEGER, defaultValue: 0 },
    soldCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { sequelize, modelName: 'Medicine', tableName: 'medicines' }
);

export default Medicine;