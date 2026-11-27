const normalizeEmail = email => String(email || '').trim().toLowerCase();

export function getPasswordResetTestConfig(env = process.env) {
    return {
        enabled: env.NODE_ENV !== 'production',
        testEmail: normalizeEmail(env.TEST_RESET_EMAIL),
        mailOverrideTo: String(env.MAIL_OVERRIDE_TO || '').trim(),
        defaultPassword: String(env.TEST_RESET_PASSWORD || '')
    };
}

export function getPasswordResetDelivery(email, env = process.env) {
    const config = getPasswordResetTestConfig(env);
    const useOverride = config.enabled
        && Boolean(config.testEmail)
        && Boolean(config.mailOverrideTo)
        && normalizeEmail(email) === config.testEmail;

    return {
        to: useOverride ? config.mailOverrideTo : email,
        requestedAccount: useOverride ? email : undefined
    };
}

export function isTestResetAccount(email, env = process.env) {
    const config = getPasswordResetTestConfig(env);
    return config.enabled
        && Boolean(config.testEmail)
        && Boolean(config.defaultPassword)
        && normalizeEmail(email) === config.testEmail;
}
