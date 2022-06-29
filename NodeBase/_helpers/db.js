/**
 * @version 1.0.0
 * @author Santiago Gonzalez Acevedo <santiago.gonzalez@netwconsulting.com>
 * @email santiago.gonzalez@netwconsulting.com
 * @copyright 2021 New Inntech S.A.S Todos los derechos reservados.
 */

 /**
 * @controller Base de datos MySQL
 * @description Permite crear el modelo de base de datos y la conexion
 */
  const express = require('express');
  const router = express.Router();
  const mysql = require('mysql2/promise');
  const { Sequelize } = require('sequelize');
  const models = require('../db/models');
  const { dbConfig } = require('../config/config');

  
  // Datos de conexion base de datos
  const host = dbConfig.host;
  const port = dbConfig.port;
  const password = dbConfig.password;
  const database = dbConfig.database;
  const user = dbConfig.user;
  
  module.exports = router.head('/sync',async function(req,res){
      await initialize();
      res.json()
  })
 //ejercuta la estructura de la base de datos normal como el index,
 //la diferencia está en que cuando se agregue un nuevo campo a l ase de datos
 //este va actualizarlo el nuevo campo pero el del index no.
  initialize();
  async function initialize() {
      const connection = await mysql.createPool({ host: host, port: port, user: user, password: password, database: database }); //Conexion para crear tablas
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`); //Creacion de base de datos si no existe
      //Conexion dinamica sequelize (Mejora para rendimiento con Lambda Functions)
      await models.sequelize.sync({alter:true});
    
  }