const asyncHandler = require('../middlewares/asyncHandler');
const { ok } = require('../utils/responses');
const Category = require('../models/category.model');

const listCtrl = asyncHandler(async (req, res) => {
    const items = await Category.listAll();
    return ok(res, { items });
});

module.exports = { listCtrl };
