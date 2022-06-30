/**
 * @version 1.0.0
 * @author Santiago Gonzalez Acevedo <santiago.gonzalez@netwconsulting.com>
 * @email santiago.gonzalez@netwconsulting.com
 * @copyright 2021 New Inntech S.A.S Todos los derechos reservados.
 */

 /**
 * @controller error-handler
 * @description Permite controlar los errores del servicio
 */
  module.exports = errorHandler;

  function errorHandler(err, req, res, next) {
      switch (true) {
          case typeof err === 'string':
              // errores personalizados de la aplicacion
              const is404 = err.toLowerCase().endsWith('not found');
              const statusCode = is404 ? 404 : 400;
              return res.status(statusCode).json({ message: err });
          case err.name === 'UnauthorizedError':
              // jwt error autenticacion
              return res.status(401).json({ message: 'Unauthorized' });
          default:
              return res.status(500).json({ message: err.message });
      }
  }