const userModel = require('../models/user.model');

async function upsertGoogleUser({ email, name, googleId }) {
    if (!email) {
        const err = new Error('Google không trả về email. Không thể đăng nhập.');
        err.statusCode = 400;
        throw err;
    }

    const existed = await userModel.findByEmail(email);
    if (!existed) {
        const created = await userModel.createUserWithGoogle({ email, name, googleId });
        return created;
    }

    if (existed.deleted) {
        const err = new Error('Tài khoản đã bị khóa');
        err.statusCode = 403;
        throw err;
    }
    if (existed.status !== 'ACTIVE') {
        const updated = await userModel.updateGoogleIdAndActivate({ email, googleId });
        return updated;
    }

    if (!existed.google_id) {
        const updated = await userModel.updateGoogleIdAndActivate({ email, googleId });
        return updated;
    }
    return existed;
}

module.exports = { upsertGoogleUser };
