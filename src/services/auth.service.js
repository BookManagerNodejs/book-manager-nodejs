const bcrypt = require('bcrypt');
const env = require('../config/env');
const { findByEmail, createUser, activateUserByEmail } = require('../models/user.model');
const { createOtp, getOtp, getAttempts, increaseAttempts, clearOtp, getOtpTtl } = require('./otp.service');
const { sendMail } = require('../config/mailer');

async function signup({ email, password, name }) {
    const existed = await findByEmail(email);
    if (existed) {
        const err = new Error('Email đã tồn tại');
        err.statusCode = 400;
        throw err;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await createUser({ email, passwordHash, name });
    const created = await createOtp(email);
    if (!created.created) {

        const err = new Error(`OTP hiện có hiệu lực thêm ${created.ttl}s, hãy kiểm tra email`);
        err.statusCode = 400;
        throw err;
    }

    await sendMail({
        to: email,
        subject: 'Xác thực đăng ký tài khoản Book Manager',
        html: `
      <p>Xin chào ${name},</p>
      <p>Mã xác thực (OTP) của bạn là: <b>${created.otp}</b></p>
      <p>Mã có hiệu lực trong ${env.otp.ttl/60} phút.</p>
    `
    });

    return { userId, ttl: created.ttl };
}

async function verifyOtp({ email, otp }) {
    const user = await findByEmail(email);
    if (!user) {
        const err = new Error('Email chưa đăng ký');
        err.statusCode = 400;
        throw err;
    }

    if (user.deleted) {
        const err = new Error('Tài khoản đã bị xóa');
        err.statusCode = 400;
        throw err;
    }

    const stored = await getOtp(email);
    if (!stored) {
        const err = new Error('OTP hết hạn hoặc không tồn tại');
        err.statusCode = 400;
        throw err;
    }

    if (String(stored) !== String(otp)) {
        const attempts = await increaseAttempts(email);
        const remain = Math.max(0, env.otp.maxAttempts - attempts);
        if (attempts >= env.otp.maxAttempts) {
            await clearOtp(email);
            const err = new Error('Bạn đã nhập sai quá số lần cho phép. Vui lòng yêu cầu gửi lại OTP.');
            err.statusCode = 400;
            throw err;
        }
        const err = new Error(`OTP không đúng. Bạn còn ${remain} lần thử.`);
        err.statusCode = 400;
        throw err;
    }
    await activateUserByEmail(email);
    await clearOtp(email);
    return { activated: true };
}

async function resendOtp({ email }) {
    const user = await findByEmail(email);
    if (!user) {
        const err = new Error('Email chưa đăng ký');
        err.statusCode = 400;
        throw err;
    }
    if (user.deleted) {
        const err = new Error('Tài khoản đã bị xóa');
        err.statusCode = 400;
        throw err;
    }

    const ttl = await getOtpTtl(email);
    if (ttl > 0) {
        const err = new Error(`OTP hiện còn hiệu lực ${ttl}s. Vui lòng kiểm tra email.`);
        err.statusCode = 400;
        throw err;
    }

    const created = await createOtp(email);
    if (!created.created) {
        const err = new Error(`OTP hiện còn hiệu lực ${created.ttl}s. Vui lòng kiểm tra email.`);
        err.statusCode = 400;
        throw err;
    }

    await sendMail({
        to: email,
        subject: 'OTP mới cho tài khoản Book Manager',
        html: `
      <p>Xin chào ${user.name || ''},</p>
      <p>Mã OTP mới của bạn là: <b>${created.otp}</b></p>
      <p>Mã có hiệu lực trong ${env.otp.ttl/60} phút.</p>
    `
    });

    return { ttl: created.ttl };
}

module.exports = { signup, verifyOtp, resendOtp };
