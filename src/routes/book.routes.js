const express = require('express');
const router = express.Router();

const { ensureAuth, requireRole } = require('../middlewares/authz');
const { handleValidation } = require('../middlewares/validate');

const ctrl = require('../controllers/book.controller');
const { createBookRules, idParamRule, listQueryRules } = require('../validators/books.validators');

router.use(ensureAuth, requireRole('ADMIN'));

router.get('/', listQueryRules, handleValidation, ctrl.listCtrl);

router.get('/:id', idParamRule, handleValidation, ctrl.detailCtrl);

router.post('/', createBookRules, handleValidation, ctrl.createCtrl);

router.delete('/:id', idParamRule, handleValidation, ctrl.softDeleteCtrl);

router.patch('/:id/restore', idParamRule, handleValidation, ctrl.restoreCtrl);

module.exports = router;
