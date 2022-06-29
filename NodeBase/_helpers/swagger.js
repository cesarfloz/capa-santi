/**
 * @version 1.0.0
 * @author Santiago Gonzalez Acevedo <santiago.gonzalez@netwconsulting.com>
 * @email santiago.gonzalez@netwconsulting.com
 * @copyright 2021 New Inntech S.A.S Todos los derechos reservados.
 */

 /**
 * @description Controlador principal para la documentacion de Swagger
 */
  const express = require('express');
  const router = express.Router();
  const swaggerUi = require('swagger-ui-express');
  const YAML = require('yamljs');
  const swaggerDocument = YAML.load('./swagger.yaml'); //Ruta archivo Swagger
  
  router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); //Creacion Endpoint Swagger
  
  module.exports = router;
  