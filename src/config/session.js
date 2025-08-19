const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { getRedis } = require('./redis');
const env = require('./env');

function buildSession() {
    const redis = getRedis();
    const store = new RedisStore({ client: redis, prefix: 'sess:' });

    const isProd = env.nodeEnv === 'production';
    return session({
        name: process.env.SESSION_NAME || 'sid',
        secret: process.env.SESSION_SECRET || 'change_me',
        store,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: 'lax',
            secure: isProd && process.env.COOKIE_SECURE === 'true',
            maxAge: Number(process.env.SESSION_MAX_AGE_MS) || 7 * 24 * 60 * 60 * 1000,
        }
    });
}
module.exports = { buildSession };
