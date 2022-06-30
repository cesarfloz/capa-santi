/**
 * @version 1.0.0
 * @author Santiago Gonzalez Acevedo <santiago.gonzalez@netwconsulting.com>
 * @email santiago.gonzalez@netwconsulting.com
 * @copyright 2021 New Inntech S.A.S Todos los derechos reservados.
 */

/**
* @controller accounts.controller
* @description Funciones principales del controlador de autenticacion de usuarios
*/

const Joi = require('joi');
const validateRequest = require('../_middleware/validate-request');
const Role = require('../_helpers/role');
const accountService = require('./account.service');

// funcion validacion de esquema de autenticacion
function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

// function autentiacion login
function authenticate(req, res, next) {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    accountService.authenticate({ email, password, ipAddress })
        .then(({ refreshToken, ...account }) => {
            setTokenCookie(res, refreshToken);
            res.json(account);
        })
        .catch(next);
}

// Funcion permite refrescar token de seguridad
function refreshToken(req, res, next) {
    const token = req.cookies.refreshToken;
    const ipAddress = req.ip;
    accountService.refreshToken({ token, ipAddress })
        .then(({ refreshToken, ...account }) => {
            setTokenCookie(res, refreshToken);
            res.json(account);
        })
        .catch(next);
}

// Funcion permite validar esquema revocar token de seguridad
function revokeTokenSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().empty('')
    });
    validateRequest(req, next, schema);
}

// Funcion permite revocar token de seguridad
function revokeToken(req, res, next) {
    // accept token from request body or cookie
    const token = req.body.token || req.cookies.refreshToken;
    const ipAddress = req.ip;

    //Validacion de token requerida
    if (!token) return res.status(400).json({ message: 'Token is required' });

    // Usuarios pueden revocar el propio tomen y administrar y revocar cualquier token
    if (!req.user.ownsToken(token) && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    // Revocar token mediante IP y token a revocar
    accountService.revokeToken({ token, ipAddress })
        .then(() => res.json({ message: 'Token revoked' }))
        .catch(next);
}

// Permite validar registro de usuarios, formulario completo
function registerSchema(req, res, next) {
    const schema = Joi.object({
        title: Joi.string().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        phone: Joi.string().required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
        acceptTerms: Joi.boolean().valid(true).required()
    });
    validateRequest(req, next, schema);
}

// Permite registrar usuarios
function register(req, res, next) {
    accountService.register(req.body, req.get('origin'))
        .then(verificationToken => res.json({ verificationToken: verificationToken, message: 'Registro exitoso, revise su correo electrónico para obtener instrucciones de verificación' }))
        .catch(next);
}

// Permite verificar el E-mail, el esquema
function verifyEmailSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().required()
    });
    validateRequest(req, next, schema);
}
// Permite verificar el E-mail
function verifyEmail(req, res, next) {
    accountService.verifyEmail(req.body)
        .then(() => res.json({ message: 'Verificacion correcta, ya puedes ingresar' }))
        .catch(next);
}

//Olvido de Password, validar formulario de entrada
function forgotPasswordSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().email().required()
    });
    validateRequest(req, next, schema);
}

// Funcion para el olvido de Password
function forgotPassword(req, res, next) {
    accountService.forgotPassword(req.body, req.get('origin'))
        .then(() => res.json({ message: 'Please check your email for password reset instructions' }))
        .catch(next);
}

// Permite validar token Reset, esquema del formulario
function validateResetTokenSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().required()
    });
    validateRequest(req, next, schema);
}
// Funcion permite validar el token Reset
function validateResetToken(req, res, next) {
    accountService.validateResetToken(req.body)
        .then(() => res.json({ message: 'Token is valid' }))
        .catch(next);
}

// Esquema para cambiar password
function resetPasswordSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    });
    validateRequest(req, next, schema);
}
// Funcion permite cambiar password
function resetPassword(req, res, next) {
    accountService.resetPassword(req.body)
        .then(() => res.json({ message: 'Password cambiado correctamente, ahora puede ingresar' }))
        .catch(next);
}

// Permite obtener todas las cuentas registradas
function getAll(req, res, next) {
    accountService.getAll()
        .then(accounts => res.json(accounts))
        .catch(next);
}
// Permite obtener las cuentas registradas por ID
function getById(req, res, next) {
    // Usuarios pueden obtener su propia cuenta y los administrados pueden obtener cualquiera.
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'No autorizado' });
    }

    accountService.getById(req.params.id)
        .then(account => account ? res.json(account) : res.sendStatus(404))
        .catch(next);
}

// Permite crear el esquema, validar esquema datos formulario
function createSchema(req, res, next) {
    const schema = Joi.object({
        title: Joi.string().required(),
        phone: Joi.string().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
        role: Joi.string().valid(Role.Admin, Role.User).required()
    });
    validateRequest(req, next, schema);
}

// Permite crear el esquema
function create(req, res, next) {
    accountService.create(req.body)
        .then(account => res.json(account))
        .catch(next);
}

// Permite actualizar el esquema.
function updateSchema(req, res, next) {
    const schemaRules = {
        title: Joi.string().empty(''),
        firstName: Joi.string().empty(''),
        lastName: Joi.string().empty(''),
        email: Joi.string().email().empty(''),
        password: Joi.string().min(6).empty(''),
        confirmPassword: Joi.string().valid(Joi.ref('password')).empty('')
    };

    // Solo los administradores pueden actualizar el role
    if (req.user.role === Role.Admin) {
        schemaRules.role = Joi.string().valid(Role.Admin, Role.User).empty('');
    }

    const schema = Joi.object(schemaRules).with('password', 'confirmPassword');
    validateRequest(req, next, schema);
}
// Funcion permite actualizar su propia cuenta y los administradores pueden actualizar cualquier cuenta.
function update(req, res, next) {
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    accountService.update(req.params.id, req.body)
        .then(account => res.json(account))
        .catch(next);
}

// Funcion eliminar cuenta
function _delete(req, res, next) {
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    accountService.delete(req.params.id)
        .then(() => res.json({ message: 'Account deleted successfully' }))
        .catch(next);
}

// Permite crear la Cookie para el token JWT
function setTokenCookie(res, token) {
    // Crear cookie con Refresh token que expira en 7 dias
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
    res.cookie('refreshToken', token, cookieOptions);
}

module.exports = {
    setTokenCookie,
    _delete,
    update,
    updateSchema,
    create,
    createSchema,
    getById,
    getAll,
    resetPassword,
    validateResetToken,
    validateResetTokenSchema,
    forgotPassword,
    forgotPasswordSchema,
    resetPasswordSchema,
    verifyEmail,
    verifyEmailSchema,
    register,
    registerSchema,
    revokeToken,
    revokeTokenSchema,
    refreshToken,
    authenticate,
    authenticateSchema
}