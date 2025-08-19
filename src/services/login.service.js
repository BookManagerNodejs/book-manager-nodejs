const bcrypt = require('bcrypt');
const userModel = require('../models/user.model');

async function loginWithEmailPassword({ email, password }) {
    const user = await userModel.findByEmail(email);
    if (!user) {
        const err = new Error('Email chưa được đăng ký');
        err.statusCode = 400;
        throw err;
    }

    if (user.deleted) {
        const err = new Error('Tài khoản đã bị khóa');
        err.statusCode = 403;
        throw err;
    }

    if (!user.password) {
        // user đăng ký bằng Google -> không có password
        const err = new Error('Tài khoản này đăng nhập bằng Google. Vui lòng chọn Đăng nhập bằng Google.');
        err.statusCode = 400;
        throw err;
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
        const err = new Error('Mật khẩu không đúng');
        err.statusCode = 400;
        throw err;
    }

    if (user.status !== 'ACTIVE') {
        const err = new Error('Tài khoản chưa kích hoạt. Vui lòng nhập OTP để kích hoạt trước khi đăng nhập.');
        err.statusCode = 400;
        throw err;
    }
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
    };
}

module.exports = { loginWithEmailPassword };
