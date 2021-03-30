import { DataTypes, Model } from 'sequelize';
import sequelize from '../models/index';

class ScrapedElement extends Model {}

ScrapedElement.init(
  {
    text: DataTypes.STRING(1000),
    difficultyRating: DataTypes.STRING,
    characterLength: DataTypes.STRING,
    characterLengthNumeric: DataTypes.INTEGER,
  },
  { sequelize, modelName: 'ScrapedElement' },
);

export default ScrapedElement;
