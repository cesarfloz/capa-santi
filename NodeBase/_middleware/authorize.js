/**
 * @version 1.0.0
 * @author Santiago Gonzalez Acevedo <santiago.gonzalez@netwconsulting.com>
 * @email santiago.gonzalez@netwconsulting.com
 * @copyright 2021 New Inntech S.A.S Todos los derechos reservados.
 */

 /**
 * @controller authorize
 * @description Controlador principal que permite realizar la autenticacion y dependiendo del role
 */
  const jwt = require('express-jwt');
  const { secret } = require('../config/config');
  const { encryptNewInntech } = require('../config/config');
  const models = require('../db/models');
  
  module.exports = authorize;
  
  function authorize(roles = []) {
      // Parametro de Role (ej: role.user, role.admin)
      if (typeof roles === 'string') {
          roles = [roles];
      }
  
      return [
          // Autenticacion JWT Token y se le asigna al usuario
          jwt({ secret, algorithms: [encryptNewInntech.algorithm] }),
  
          //Autorizacion basada en roles
          async (req, res, next) => {
                //findByPk buscar por primarykey req.user.id (buscar si el usuario existe)
              const account = await models.account.findByPk(req.user.id);
  
              if (!account || (roles.length && !roles.includes(account.role))) {
                  // Si la cuenta no existe o no tiene el role autorizado
                  return res.status(401).json({ message: 'Unauthorized' });
              }
              // Autenticacion realizada correctamente
              req.user.role = account.role;
              const refreshTokens = await account.getRefreshTokens();
              req.user.ownsToken = token => !!refreshTokens.find(x => x.token === token);
              next();
          }
      ];
  }