import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('typerspace', 'JD', '', {
  host: 'localhost',
  dialect: 'postgres',
});

(async () => {
  await sequelize.sync();
  console.log('connected to db');
})();

export default sequelize;
