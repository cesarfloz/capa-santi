/**
 * @version 1.0.0
 * @author Santiago Gonzalez Acevedo <mailto:santiago.gonzalez@netwconsulting.com>
 * @email mailto:santiago.gonzalez@netwconsulting.com
 * @copyright 2021 New Inntech S.A.S Todos los derechos reservados.
 */

 /**
 * @controller routes.js
 * @description Rutas de microservicios para la autenticacion con JWT
 */
  const express = require('express');
  const router = express.Router();
  const authorize = require('../_middleware/authorize');
  const Role = require('../_helpers/role');
  const accountController = require('./account.controller');
  
  // Rutas
  router.post('/authenticate', accountController.authenticateSchema, accountController.authenticate);
  router.post('/refresh-token', accountController.refreshToken);
  router.post('/revoke-token', authorize(), accountController.revokeTokenSchema, accountController.revokeToken);
  router.post('/register', accountController.registerSchema, accountController.register);
  router.post('/verify-email', accountController.verifyEmailSchema, accountController.verifyEmail);
  router.post('/forgot-password', accountController.forgotPasswordSchema, accountController.forgotPassword);
  router.post('/validate-reset-token', accountController.validateResetTokenSchema, accountController.validateResetToken);
  router.post('/reset-password', accountController.resetPasswordSchema, accountController.resetPassword);
  router.get('/', authorize(Role.Admin), accountController.getAll);
  router.get('/:id', authorize(), accountController.getById);
  router.post('/', authorize(Role.Admin), accountController.createSchema, accountController.create);
  router.put('/:id', authorize(), accountController.updateSchema, accountController.update);
  router.delete('/:id', authorize(), accountController._delete);
  
  module.exports = router;