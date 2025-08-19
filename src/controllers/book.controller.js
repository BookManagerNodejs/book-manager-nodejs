const asyncHandler = require('../middlewares/asyncHandler');
const { ok, created } = require('../utils/responses');
const bookService = require('../services/book.service');

const listCtrl = asyncHandler(async (req, res) => {
    const { minPrice, maxPrice } = req.query;
    const data = await bookService.listBooks({ minPrice, maxPrice });
    return ok(res, { items: data, total: data.length });
});

const createCtrl = asyncHandler(async (req, res) => {
    const payload = req.body; // đã qua validator
    const createdBook = await bookService.addBook(payload);
    return created(res, createdBook, 'Thêm sách thành công');
});

const softDeleteCtrl = asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const result = await bookService.softDeleteBook(id);
    return ok(res, result, 'Xóa mềm sách thành công');
});

const restoreCtrl = asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const result = await bookService.restoreBook(id);
    return ok(res, result, 'Khôi phục sách thành công');
});

const detailCtrl = asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const b = await require('../models/book.model').getById(id);
    if (!b) {
        const err = new Error('Sách không tồn tại');
        err.statusCode = 404;
        throw err;
    }
    return ok(res, b);
});


const uploadImageCtrl = asyncHandler(async (req, res) => {
    if (!req.file) {
        const err = new Error('Không tìm thấy file');
        err.statusCode = 400;
        throw err;
    }

    const folder = process.env.CLOUDINARY_FOLDER || 'book-manager';
    const buffer = req.file.buffer;

    const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (err, data) => (err ? reject(err) : resolve(data))
        );
        stream.end(buffer);
    });

    return res.status(201).json({
        success: true,
        message: 'Upload thành công',
        data: { url: result.secure_url, public_id: result.public_id }
    });
});


module.exports = {
    listCtrl,
    createCtrl,
    uploadImageCtrl,
    softDeleteCtrl,
    restoreCtrl,
    detailCtrl
};
