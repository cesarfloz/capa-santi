'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const { dbConfig } = require('../../config/config');
const db = {};
  
// Datos de conexion base de datos
const host = dbConfig.host;
const port = dbConfig.port;
const password = dbConfig.password;
const database = dbConfig.database;
const user = dbConfig.user;
const dialect = dbConfig.dialect;


connect();

async function connect() {
  const sequelize = new Sequelize(database, user, password, {
    host: host, 
    port: port, 
    dialect: dialect,
    pool: {
      max: 1,//Maximo una conexion por Lambda
      min: 0,
      acquire: 30000,
      idle: 10000 //Tiempo que dura la conexion, buena practica
    }
  });  
  
  fs
    .readdirSync(__dirname)
    .filter(file => {
      return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
      const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
      db[model.name] = model;
    });
  
  Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });
  
  db.sequelize = sequelize;
  db.Sequelize = Sequelize;
  
  return db;
}

module.exports = db;