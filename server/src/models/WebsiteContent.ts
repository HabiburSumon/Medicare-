import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface WebsiteContentAttributes {
  id: number;
  section: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  items: string; // JSON array
  settings: string; // JSON object
}

type WebsiteContentCreationAttributes = Optional<WebsiteContentAttributes, 'id' | 'title' | 'subtitle' | 'description' | 'image' | 'items' | 'settings'>;

class WebsiteContent extends Model<WebsiteContentAttributes, WebsiteContentCreationAttributes> implements WebsiteContentAttributes {
  public id!: number;
  public section!: string;
  public title!: string;
  public subtitle!: string;
  public description!: string;
  public image!: string;
  public items!: string;
  public settings!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

WebsiteContent.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    section: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    title: { type: DataTypes.STRING(255), defaultValue: '' },
    subtitle: { type: DataTypes.STRING(255), defaultValue: '' },
    description: { type: DataTypes.TEXT, defaultValue: '' },
    image: { type: DataTypes.STRING(500), defaultValue: '' },
    items: { type: DataTypes.TEXT, defaultValue: '[]' },
    settings: { type: DataTypes.TEXT, defaultValue: '{}' },
  },
  { sequelize, modelName: 'WebsiteContent', tableName: 'website_contents' }
);

export default WebsiteContent;