import { DataTypes, Model } from 'sequelize';
import sequelize from '../models/index';

class Text extends Model {}

Text.init(
  {
    paragraph: DataTypes.STRING,
    difficultyRating: DataTypes.INTEGER,
    characterLength: DataTypes.STRING,
  },
  { sequelize, modelName: 'text' },
);

export default Text;
