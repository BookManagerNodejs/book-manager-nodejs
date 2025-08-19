const env = require('../config/env');

function generateOtp(length = env.otp.length) {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

module.exports = { generateOtp };
