const { body } = require('express-validator');
const env = require('../config/env');

const signupRules = [
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu tối thiểu 6 ký tự'),
    body('name').notEmpty().withMessage('Tên không được để trống'),
];

const verifyOtpRules = [
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('otp')
        .isLength({ min: env.otp.length, max: env.otp.length })
        .isNumeric()
        .withMessage(`OTP phải là ${env.otp.length} chữ số`),
];

const resendOtpRules = [
    body('email').isEmail().withMessage('Email không hợp lệ'),
];

const loginRules = [
    body('email').isEmail().withMessage('Email không hợp lệ'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu tối thiểu 6 ký tự'),
    body('rememberEmail').optional().isBoolean().withMessage('rememberEmail phải là boolean')
];
module.exports = { signupRules, verifyOtpRules, resendOtpRules, loginRules };
