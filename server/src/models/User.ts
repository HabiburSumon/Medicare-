import { DataTypes, Model, Optional } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database';

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor' | 'admin' | 'pharmacist';
  phone: string;
  avatar: string;
  isVerified: boolean;
  isActive: boolean;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'avatar' | 'isVerified' | 'isActive' | 'phone'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: 'patient' | 'doctor' | 'admin' | 'pharmacist';
  public phone!: string;
  public avatar!: string;
  public isVerified!: boolean;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { notEmpty: true },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { len: [6, 255] },
    },
    role: {
      type: DataTypes.ENUM('patient', 'doctor', 'admin', 'pharmacist'),
      defaultValue: 'patient',
    },
    phone: {
      type: DataTypes.STRING(20),
      defaultValue: '',
    },
    avatar: {
      type: DataTypes.STRING(500),
      defaultValue: '',
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] },
      },
    },
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

export default User;