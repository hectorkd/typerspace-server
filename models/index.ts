import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  `${process.env.NAME}`,
  `${process.env.USERNAME}`,
  `${process.env.PASSWORD}`,
  {
    host: `${process.env.HOST}`,
    dialect: 'postgres',
  },
);

(async () => {
  await sequelize.sync();
  console.log('connected to db');
})();

export default sequelize;
