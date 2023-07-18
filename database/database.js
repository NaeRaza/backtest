const { Sequelize } = require('sequelize');

//Initialisation de la connexion à la base de donnée
const sequelize = new Sequelize(
  'intranet', 
  'root', 
  ''
  , {
    host: 'localhost',
    dialect: 'mysql'
  });

module.exports = sequelize