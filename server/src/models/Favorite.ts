import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface FavoriteAttributes {
  id: number;
  patientId: number;
  doctorId: number;
}

type FavoriteCreationAttributes = Optional<FavoriteAttributes, 'id'>;

class Favorite extends Model<FavoriteAttributes, FavoriteCreationAttributes> implements FavoriteAttributes {
  public id!: number;
  public patientId!: number;
  public doctorId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Favorite.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    patientId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
    doctorId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } },
  },
  { sequelize, modelName: 'Favorite', tableName: 'favorites', indexes: [{ unique: true, fields: ['patientId', 'doctorId'] }] }
);

export default Favorite;