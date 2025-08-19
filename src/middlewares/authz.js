const { unauthorized, badRequest } = require('../utils/responses');

function ensureAuth(req, res, next) {
    if (!req.session || !req.session.user) {
        return unauthorized(res, 'Bạn chưa đăng nhập');
    }
    next();
}

function requireRole(role) {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            return unauthorized(res, 'Bạn chưa đăng nhập');
        }
        if (req.session.user.role !== role) {
            return badRequest(res, 'Bạn không có quyền thực hiện chức năng này');
        }
        next();
    };
}
module.exports = { ensureAuth, requireRole };
