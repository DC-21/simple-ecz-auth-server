const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('mydatabase', 'postgres', 'Cholah@2104', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: true,
});
module.exports=sequelize;