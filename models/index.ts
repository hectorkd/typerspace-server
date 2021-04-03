import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  'postgres://thseyuzazqdyyy:beabaadbed772f34190e9bf82ff6ff27b351484708979eeb90b30efb6ea43b34@ec2-107-22-245-82.compute-1.amazonaws.com:5432/ddq5r7di07mekt',
  {
    protocol: 'postgres',
    dialect: 'postgres',
    dialectOptions: { ssl: { rejectUnauthorized: false } },
  },
);

(async () => {
  await sequelize.sync();
  console.log('connected to db');
})();

export default sequelize;
