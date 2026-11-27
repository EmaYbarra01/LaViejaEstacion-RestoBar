import { pool } from '../database/mysql/pool.js';
import { passwordResetService } from '../services/mysql/passwordReset.js';
import { endpoint } from '../services/mysql/modulosHelpers.js';
import {
    getPasswordResetDelivery,
    getPasswordResetTestConfig,
    isTestResetAccount
} from '../services/passwordResetEnvironment.js';
import { sendPasswordResetEmail, sendPasswordChangedEmail } from '../config/nodemailer.config.js';

const sendResetEmail = (email, token, username) => {
    const delivery = getPasswordResetDelivery(email);
    return sendPasswordResetEmail(
        process.env.MAIL_OVERRIDE_TO || delivery.to,
        token,
        username,
        delivery.requestedAccount || email
    );
};

const passwordReset = passwordResetService(pool, {
    sendReset: sendResetEmail,
    sendChanged: sendPasswordChangedEmail
});

export const forgotPassword = endpoint(async req => {
    const result = await passwordReset.solicitar(req.body?.email);
    const testConfig = getPasswordResetTestConfig();
    const testOverrideConfigured = testConfig.enabled
        && Boolean(testConfig.testEmail)
        && Boolean(testConfig.mailOverrideTo);

    if (testOverrideConfigured) {
        return {
            body: {
                ...result,
                mensaje: `${result.mensaje}. Si la solicitud corresponde a la cuenta de prueba configurada, el enlace se redirige a la casilla administrativa de pruebas.`
            }
        };
    }

    return { body: result };
});

export const resetPassword = endpoint(async req => {
    let newPassword = req.body?.newPassword;
    const testConfig = getPasswordResetTestConfig();

    if (!newPassword) {
        if (testConfig.enabled && testConfig.defaultPassword && testConfig.testEmail) {
            const { email } = await passwordReset.verificar(req.body?.token);
            if (!isTestResetAccount(email)) {
                const error = new Error('Ingresá una contraseña para esta cuenta.');
                error.status = 400;
                throw error;
            }
            newPassword = testConfig.defaultPassword;
        } else {
            const error = new Error('La nueva contraseña es requerida.');
            error.status = 400;
            throw error;
        }
    }

    return { body: await passwordReset.restablecer(req.body?.token, newPassword) };
});

export const verifyResetToken = endpoint(async req => ({
    body: await passwordReset.verificar(req.params.token)
}));
