/**
 * librerias:
 * 1. express= microservicios
 * 2.body-parser= Realizar operaciones con json
 * 3.coockie-parser= manejo de cookies
 * 4.cors= Origen peticiones de la API
 * 5.sequelize=  Base de datos
 * 6.dotenv= carga variables de un entorno .env
 * 7. nodemon(subdependencia)= corredor de server auto, hace que todo se actualice
*/
const express = require('express');
const bodyparser = require('body-parser');
const cookieParser =  require('cookie-parser');
const cors = require('cors');

//esto siemrpe va, instancia de la librerias
const app= express();
app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json())
app.use(cookieParser())

app.use(cors({origin:'*', credentials:true, optionsSuccessStatus:200}))
app.use('/operaciones',require('./operaciones/routes'))

module.exports = app;