const express = require('express');
const router = express.Router();
const { signupCtrl, verifyOtpCtrl, resendOtpCtrl } = require('../controllers/auth.controller');
const { handleValidation } = require('../middlewares/validate');
const { loginCtrl, meCtrl, logoutCtrl, googleCallbackCtrl } = require('../controllers/auth.controller');
const { signupRules, verifyOtpRules, resendOtpRules, loginRules } = require('../validators/auth.validators');
const passport = require('passport');

router.post('/signup', signupRules, handleValidation, signupCtrl);
router.post('/verify-otp', verifyOtpRules, handleValidation, verifyOtpCtrl);
router.post('/resend-otp', resendOtpRules, handleValidation, resendOtpCtrl);

router.post('/login', loginRules, handleValidation, loginCtrl);

router.get('/me', meCtrl);
router.get('/logout', logoutCtrl);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login?error=google' }),
    googleCallbackCtrl
);
module.exports = router;
