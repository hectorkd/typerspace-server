import { DataTypes, Model } from 'sequelize';
import sequelize from '../models/index';

class Paragraph extends Model {}

Paragraph.init(
  {
    text: DataTypes.STRING(1000),
    difficultyRating: DataTypes.STRING,
    characterLength: DataTypes.STRING,
  },
  { sequelize, modelName: 'paragraph' },
);

export default Paragraph;
