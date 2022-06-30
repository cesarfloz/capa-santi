/**
 * @version 1.0.0
 * @author Santiago Gonzalez Acevedo <santiago.gonzalez@netwconsulting.com>
 * @email santiago.gonzalez@netwconsulting.com
 * @copyright 2021 New Inntech S.A.S Todos los derechos reservados.
 */

/**
* @controller account.service
* @description Funciones principales para la administracion de cuentas
*/
const { secret } = require('../config/config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const { Op } = require('sequelize');
const sendEmail = require('../_helpers/send-email');
const Role = require('../_helpers/role');
const models = require('../db/models');

//Funciones a ser exportadas
module.exports = {
    authenticate,
    refreshToken,
    revokeToken,
    register,
    verifyEmail,
    forgotPassword,
    validateResetToken,
    resetPassword,
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

// Funcion principal autenticacion
async function authenticate({ email, password, ipAddress }) {
    const account = await models.account.scope('withHash').findOne({ where: { email } });

    if (!account || !account.isVerified || !(await bcrypt.compare(password, account.passwordHash))) {
        throw 'Email or password is incorrect';
    }

    // Autenticacion creada correctamente para generar el JWT y Refresh token
    const jwtToken = generateJwtToken(account);
    const refreshToken = await generateRefreshToken(account, ipAddress);

    // Guardar Refresh token
    await refreshToken.save();
  

    // Retorna informacion basica del token
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: refreshToken.token
    };
}

// Funcion principal RefreshToken
async function refreshToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);
    const account = await refreshToken.getAccount();

    // Reemplazar el viejo Refresh token con uno nuevo para ser guardado.
    const newRefreshToken = generateRefreshToken(account, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();

    // Generar nuevo JWT
    const jwtToken = generateJwtToken(account);

    // Retorna informacion basica del JWT
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: newRefreshToken.token
    };
}

// Funcion principal revocar token
async function revokeToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);

    // Revocar token
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
}

// Funcion principal registrar usuarios
async function register(params, origin) {

    // Validar si el usuario ya existe filtrando por celular y correo
    if (await models.account.findOne({ where: {[Op.and]: [
        { email: params.email },
        { phone: params.phone }] }})) {
        return await sendAlreadyRegisteredEmail(params.email, origin);
    }
 
    // Crear un objeto Accoint
    const account = new models.account(params);

    // Se registra la primera cuenta como administradora
    const isFirstAccount = (await models.account.count()) === 0;
    account.role = isFirstAccount ? Role.Admin : Role.User;
    account.verificationToken = randomTokenString();

    // hash password
    account.passwordHash = await hash(params.password);

    // Guardar cuenta
    await account.save();

    // Enviar email
    await sendVerificationEmail(account, origin); // CONFIGURACION CORREO

    return account.verificationToken;
}

// Funcion principal Verificacion de correo
async function verifyEmail({ token }) {
    const account = await models.account.findOne({ where: { verificationToken: token } });

    if (!account) throw 'Verification failed';

    account.verified = Date.now();
    account.verificationToken = null;
    await account.save();
}

// Funcion principal olvido de Password
async function forgotPassword({ email }, origin) {
    const account = await models.account.findOne({ where: { email } });

    //Siempre retorna Ok en la respuesta
    if (!account) return;
    // Crear un Reset token que expira despues de 24 horas
    account.resetToken = randomTokenString();
    account.resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await account.save();

    // Enviar email
    await sendPasswordResetEmail(account, origin);
}

// Permite validar el Reset Token
async function validateResetToken({ token }) {

    const account = await models.account.findOne({
        where: {
            resetToken: token,
            resetTokenExpires: { [Op.gt]: Date.now() }
        }
    });

    if (!account) throw 'Token invalido';

    return account;
}

// Funcion principal para Reset Password
async function resetPassword({ token, password }) {
    const account = await validateResetToken({ token });

    // Permite actualizar el Password y remover el reset token
    account.passwordHash = await hash(password);
    account.passwordReset = Date.now();
    account.resetToken = null;
    await account.save();
}

// Funcion principal para obetener todas las cuentas.
async function getAll() {

    const accounts = await models.account.findAll();
    return accounts.map(x => basicDetails(x));
}
// Funcion principal para obtener o consultar cuentas por ID
async function getById(id) {
    const account = await getAccount(id);
    return basicDetails(account);
}

// Permite crear cuenta nuevas
async function create(params) {

    // validate
    if (await models.account.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" El E-mail ya esta registrado';
    }

    const account = new models.account(params);
    account.verified = Date.now();

    // hash password
    account.passwordHash = await hash(params.password);

    // Guardar cuenta
    await account.save();

    return basicDetails(account);
}

// Permite actualizar cuentas
async function update(id, params) {
    const account = await getAccount(id);

    // Validar si el correo es cambiado
    if (params.email && account.email !== params.email && await models.account.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already taken';
    }

    if (params.password) {
        params.passwordHash = await hash(params.password);
    }

    // Copiar parametros a la cuenta y guardar
    Object.assign(account, params);
    account.updated = Date.now();
    account.role = params.role;
    await account.save();

    return basicDetails(account);
}

// Funcion principal que permite eliminar cuentas
async function _delete(id) {
    const account = await getAccount(id);
    await account.destroy();
}

// Funciones de ayuda

// Permite obtener cuentas por Id
async function getAccount(id) {
    const account = await models.account.findByPk(id);
    if (!account) throw 'Cuenta no encontrada';
    return account;
}

// Permite refrescar el token
async function getRefreshToken(token) {
    const refreshToken = await models.refreshToken.findOne({ where: { token } });
    if (!refreshToken || !refreshToken.isActive) throw 'Token invalido';
    return refreshToken;
}

// Permite generar el Hash para el Password
async function hash(password) {
    return await bcrypt.hash(password, 10);
}

// Permite generar correctamente el JWT
function generateJwtToken(account) {
    // create a jwt token containing the account id that expires in 15 minutes
    return jwt.sign({ sub: account.id, id: account.id }, secret, { expiresIn: '15m' });
}

// Permite generar correctamente el Refresh token
async function generateRefreshToken(account, ipAddress) {
    // Crear un Refresh Token que expire en 7 dias
    return new models.refreshToken({
        accountId: account.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdByIp: ipAddress
    });
}

// Permite crear un aleatorio para el token
function randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}

function basicDetails(account) {
    const { id, title, firstName, lastName, email, phone, role, created, updated, isVerified } = account;
    return { id, title, firstName, lastName, email, phone, role, created, updated, isVerified };
}

// Funcion que permite enviar el cuerpo del correo correctamente
async function sendVerificationEmail(account, origin) {
    let message;
    if (origin) {
        const verifyUrl = `${origin}/#/user-access/verify-email/${account.verificationToken}`;
        message = `<p>Haga clic en el enlace a continuación para verificar su dirección de correo electrónico:</p>
                   <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
    } else {
        message = `<p>Utilice el token a continuación para verificar su dirección de correo electrónico con el <code>/account/verify-email</code> api route:</p>
                   <p><code>${account.verificationToken}</code></p>`;
    }

    await sendEmail({
        to: account.email,
        subject: 'API de verificación de registro: verificar correo electrónico',
        html: `<h4>Verificar Email</h4>
               <p>Gracias por el registro!</p>
               ${message}`
    });
}
// Funcion para enviar correo Email ya registrado
async function sendAlreadyRegisteredEmail(email, origin) {
    let message;
    if (origin) {
        message = `<p>Si no conoce su contraseña, visite la pagina <a href="${origin}/account/forgot-password">Has olvidado tu contraseña</a></p>`;
    } else {
        message = `<p>Si no conoce su contraseña, puede restablecerla a través de <code>/account/forgot-password</code> api route.</p>`;
    }

    await sendEmail({
        to: email,
        subject: 'API de verificación de registro: correo electrónico ya registrado',
        html: `<h4>Correo electrónico ya registrado</h4>
               <p>Tu Correo <strong>${email}</strong> ya esta registrado.</p>
               ${message}`
    });
}

// Funcion para enviar correo para Reset Password
async function sendPasswordResetEmail(account, origin) {
    let message;
    if (origin) {
        const resetUrl = `${origin}/#/user-access/reset/${account.resetToken}`;
        message = `<p>Haga clic en el enlace de abajo para restablecer su contraseña, el enlace será válido por 1 día:</p>
                   <p><a href="${resetUrl}">${resetUrl}</a></p>`;
    } else {
        message = `<p>Utilice el token a continuación para restablecer su contraseña con el <code>/account/reset-password</code> api route:</p>
                   <p><code>${account.resetToken}</code></p>`;
    }

    await sendEmail({
        to: account.email,
        subject: 'API de verificación de registro - Restablecer contraseña',
        html: `<h4>Restablecer contraseña de correo electrónico</h4>
               ${message}`
    });
}