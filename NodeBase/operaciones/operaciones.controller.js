const operacionesService = require('./operaciones.service');

async function suma(req, res, next){

    const {num1, num2} = req.body;
    operacionesService.suma({num1,num2})
    .then(result => res.json({ result: result}))
    .catch(next)
}
async function resta(req, res, next){

    const {num1, num2} = req.body;
    operacionesService.resta({num1,num2})
    .then(result => res.json({ result: result}))
    .catch(next)
}

async function division(req, res, next){

    const {num1, num2} = req.body;
    operacionesService.division({num1,num2})
    .then(result => res.json({ result: result}))
    .catch(next)
}

async function multiplicacion(req, res, next){

    const {num1, num2} = req.body;
    operacionesService.multiplicacion({num1,num2})
    .then(result => res.json({ result: result}))
    .catch(next)
}

/**
 * async function todos(req, res, next){

    const {num1, num2} = req.body;
    operacionesService.todos({num1,num2})
    .then(result => res.json({ result: result}))
    .catch(next)
}
 */

module.exports = {suma, resta, division, multiplicacion, //todos
}