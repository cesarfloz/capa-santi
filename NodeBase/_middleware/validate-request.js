/**
 * @version 1.0.0
 * @author Santiago Gonzalez Acevedo <santiago.gonzalez@netwconsulting.com>
 * @email santiago.gonzalez@netwconsulting.com
 * @copyright 2021 New Inntech S.A.S Todos los derechos reservados.
 */

 /**
 * @controller validate-request
 * @description permite validar campos obligatorios que vengan del Body
 */
module.exports = validateRequest;

function validateRequest(req, next, schema) {
    const options = {
        abortEarly: false, // Incluir todos los errores
        allowUnknown: true, // ignorar propiedades desconocidas
        stripUnknown: true // Eliminar propiedades desconocidas
    };
    const { error, value } = schema.validate(req.body, options);
    if (error) {
        next(`Validation error: ${error.details.map(x => x.message).join(', ')}`);
    } else {
        req.body = value;
        next();
    }
}