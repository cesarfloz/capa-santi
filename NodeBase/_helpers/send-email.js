/**
 * @version 1.0.0
 * @author Santiago Gonzalez Acevedo <santiago.gonzalez@netwconsulting.com>
 * @email santiago.gonzalez@netwconsulting.com
 * @copyright 2021 New Inntech S.A.S Todos los derechos reservados.
 */

 /**
 * @description Controlador principal para el envio de correo electronico, confirmacion de usuario
 */
  const nodemailer = require('nodemailer'); //Libreria para envio de correo
  //traer smtpOptions de config que está en la ruta
  const { smtpOptions } = require('../config/config');
  module.exports = sendEmail;
  
  //Configuracion envio correo
  async function sendEmail({ to, subject, html, from = smtpOptions.emailFrom}) {
      const transporter = nodemailer.createTransport(smtpOptions);
      await transporter.sendMail({ from, to, subject, html });
  }