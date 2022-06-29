/**
 * @version 1.0.0
 * @author New Inntech S.A.S <gerencia@newinntech.com>
 * @email gerencia@newinntech.com
 * @copyright 2022 New Inntech S.A.S Todos los derechos reservados.
 */

 require('dotenv').config(); // this is important!

 module.exports = {
    secret: "NEWINNTECH S.A.S pryecto AWS API GATEWAY REPO BASE",
    dbConfig: {
      user: process.env.USER,
      password: process.env.ROOT_PASSWORD,
      host: process.env.HOST,
      port: process.env.DB_PORT,
      database: process.env.DATABASE,
      dialect: process.env.DIALECT
    },
    smtpOptions: {
      host: process.env.SMTP,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      emailFrom: {
        name: '[AUDIT-PROCESS] AMARILO',
        address: process.env.SMTP_EMAILFROM
      },
      
    },
    
    scopes: {
      internal_three_legged: ['data:read', 'data:write', 'data:create', 'account:read'],
      internal_two_legged: ['data:read', 'data:write', 'data:create', 'account:read'],
      public: ['viewables:read']
    },
    encryptNewInntech: {
      algorithm: process.env.ALGORITHM
    }
  
  };