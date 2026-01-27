import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
    transport: !isProduction
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                ignore: 'pid,hostname',
                translateTime: 'SYS:standard',
            },
        }
        : undefined,
    base: {
        env: process.env.NODE_ENV,
        service: 'prosektorweb',
    },
    formatters: {
        level: (label) => {
            return { level: label };
        },
    },
    redact: {
        paths: [
            'password', 'token', 'secret', 'authorization', 'cookie',
            'apiKey', 'api_key', 'accessToken', 'refreshToken',
            'ssn', 'creditCard', 'cvv', 'email', 'phone', 'mobile',
            'address', 'user.email', 'user.phone', 'user.password',
            '*.password', '*.token', '*.secret'
        ],
        remove: true
    },
    serializers: {
        error: pino.stdSerializers.err,
        err: pino.stdSerializers.err,
        req: pino.stdSerializers.req,
        res: pino.stdSerializers.res,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
});

