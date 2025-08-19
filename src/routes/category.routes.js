const express = require('express');
const router = express.Router();
const { ensureAuth, requireRole } = require('../middlewares/authz');
const { listCtrl } = require('../controllers/category.controller');

router.use(ensureAuth, requireRole('ADMIN')); // chỉ ADMIN gọi
router.get('/', listCtrl);
module.exports = router;
