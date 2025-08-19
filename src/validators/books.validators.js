const { body, param, query } = require('express-validator');

const createBookRules = [
    body('title').notEmpty().withMessage('title không được để trống'),
    body('author').notEmpty().withMessage('author không được để trống'),
    body('price').isFloat({ min: 0 }).withMessage('price phải >= 0'),
    body('image').notEmpty().withMessage('image không được để trống'),
    body('description').notEmpty().withMessage('description không được để trống'),
    body('stock').isInt({ min: 0 }).withMessage('stock phải là số nguyên >= 0'),
    body('sold').optional().isInt({ min: 0 }).withMessage('sold phải là số nguyên >= 0'),
    body('category_id').isInt({ min: 1 }).withMessage('category_id không hợp lệ'),
];

const idParamRule = [
    param('id').isInt({ min: 1 }).withMessage('id không hợp lệ'),
];

const listQueryRules = [
    query('minPrice').optional().isFloat({ min: 0 }).withMessage('minPrice phải >= 0'),
    query('maxPrice').optional().isFloat({ min: 0 }).withMessage('maxPrice phải >= 0'),
];

module.exports = { createBookRules, idParamRule, listQueryRules };
