/**
 * @controller route.js
 * @description rutas microservicios aplicacion operaciones
 */

const express = require('express');
const router = express.Router();
const operacionesController= require('./operaciones.controller')

router.post('/suma', operacionesController.suma);
router.post('/resta', operacionesController.resta);
router.post('/division', operacionesController.division);
router.post('/multiplicacion', operacionesController.multiplicacion);
//router.post('/todos', operacionesController.todos);

module.exports = router;
