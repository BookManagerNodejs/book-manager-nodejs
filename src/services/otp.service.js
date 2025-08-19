const { getRedis } = require('../config/redis');
const { generateOtp } = require('../utils/otp');
const env = require('../config/env');

const KEY = {
    otp: (email) => `otp:${email}`,
    attempts: (email) => `otp_attempts:${email}`,
    cooldown: (email) => `otp_cooldown:${email}` // optional: nếu muốn chặn spam gửi liên tục
};

async function createOtp(email) {
    const redis = getRedis();

    const exists = await redis.ttl(KEY.otp(email));
    if (exists > 0) {
        return { created: false, ttl: exists };
    }

    const otp = generateOtp(env.otp.length);
    await redis.set(KEY.otp(email), otp, 'EX', env.otp.ttl);
    await redis.set(KEY.attempts(email), '0', 'EX', env.otp.ttl);

    return { created: true, otp, ttl: env.otp.ttl };
}

async function getOtp(email) {
    const redis = getRedis();
    return redis.get(KEY.otp(email));
}

async function getAttempts(email) {
    const redis = getRedis();
    const val = await redis.get(KEY.attempts(email));
    return Number(val || 0);
}

async function increaseAttempts(email) {
    const redis = getRedis();
    const cur = await redis.incr(KEY.attempts(email));
    const ttl = await redis.ttl(KEY.otp(email));
    if (ttl > 0) await redis.expire(KEY.attempts(email), ttl);
    return cur;
}

async function clearOtp(email) {
    const redis = getRedis();
    await redis.del(KEY.otp(email));
    await redis.del(KEY.attempts(email));
}

async function getOtpTtl(email) {
    const redis = getRedis();
    return redis.ttl(KEY.otp(email));
}

module.exports = {
    createOtp,
    getOtp,
    getAttempts,
    increaseAttempts,
    clearOtp,
    getOtpTtl,
    KEY
};
