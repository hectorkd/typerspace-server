import { DataTypes, Model } from 'sequelize';
import sequelize from '../models/index';

class Paragraph extends Model {
  'text': string;
  'difficultyRating': string;
  'characterLength': string;
  'characterLengthNumeric': number;
}

Paragraph.init(
  {
    text: DataTypes.STRING(1000),
    difficultyRating: DataTypes.STRING,
    characterLength: DataTypes.STRING,
    characterLengthNumeric: DataTypes.INTEGER,
  },
  { sequelize, modelName: 'paragraph' },
);

export default Paragraph;
