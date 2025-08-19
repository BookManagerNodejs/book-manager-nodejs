const asyncHandler = require('../middlewares/asyncHandler');
const { ok, created } = require('../utils/responses');
const { signup, verifyOtp, resendOtp } = require('../services/auth.service');
const { loginWithEmailPassword } = require('../services/login.service');

const signupCtrl = asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;
    const result = await signup({ email, password, name });
    return created(res, result, 'Đăng ký thành công. Vui lòng kiểm tra email để nhận OTP.');
});

const verifyOtpCtrl = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const result = await verifyOtp({ email, otp });
    return ok(res, result, 'Xác thực thành công. Tài khoản đã được kích hoạt.');
});

const resendOtpCtrl = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await resendOtp({ email });
    return ok(res, result, 'OTP mới đã được gửi.');
});

const loginCtrl = asyncHandler(async (req, res) => {
    const { email, password, rememberEmail } = req.body;

    const sessionUser = await loginWithEmailPassword({ email, password });
    req.session.user = sessionUser;
    if (rememberEmail) {
        res.cookie('remember_email', sessionUser.email, {
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
            sameSite: 'lax',
            secure: false, // bật true nếu HTTPS
        });
    } else {
        res.clearCookie('remember_email');
    }
    return ok(res, { user: sessionUser }, 'Đăng nhập thành công');
});
const meCtrl = asyncHandler(async (req, res) => {
    return ok(res, { user: req.session.user || null });
});
const logoutCtrl = asyncHandler(async (req, res) => {
    req.session.destroy(() => {
        res.clearCookie(process.env.SESSION_NAME || 'sid');
        return ok(res, {}, 'Đã đăng xuất');
    });
});
const googleCallbackCtrl = asyncHandler(async (req, res) => {
    if (!req.user) return res.redirect('/login.html?error=google');
    const u = req.user;
    req.session.user = { id: u.id, email: u.email, name: u.name, role: u.role };
    const to = req.session.oauth_redirect || process.env.SUCCESS_REDIRECT_URL || '/admin.html';
    delete req.session.oauth_redirect;

    return res.redirect(to);
});
module.exports = { signupCtrl, verifyOtpCtrl, resendOtpCtrl, loginCtrl, meCtrl, logoutCtrl, googleCallbackCtrl };
