require('dotenv').config();

const env = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    mysql: {
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT) || 3306,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DB
    },

    redisUrl: process.env.REDIS_URL,

    smtp: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        from: process.env.MAIL_FROM
    },

    otp: {
        ttl: Number(process.env.OTP_TTL_SECONDS) || 300,
        length: Number(process.env.OTP_LENGTH) || 6,
        maxAttempts: Number(process.env.OTP_MAX_ATTEMPTS) || 4
    }
};

module.exports = env;
