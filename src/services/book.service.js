const bookModel = require('../models/book.model');

async function listBooks({ minPrice, maxPrice }) {
    const min = (minPrice !== undefined) ? Number(minPrice) : null;
    const max = (maxPrice !== undefined) ? Number(maxPrice) : null;

    if (min !== null && max !== null && min > max) {
        const err = new Error('minPrice không được lớn hơn maxPrice');
        err.statusCode = 400;
        throw err;
    }

    const rows = await bookModel.listAllWithPriceRange({ minPrice: min, maxPrice: max });
    return rows;
}

async function addBook(payload) {
    const cateOk = await bookModel.categoryExists(payload.category_id);
    if (!cateOk) {
        const err = new Error('category_id không tồn tại');
        err.statusCode = 400;
        throw err;
    }
    const id = await bookModel.create(payload);
    const created = await bookModel.getById(id);
    return created;
}

async function softDeleteBook(id) {
    const affected = await bookModel.softDelete(id);
    if (affected === 0) {
        const book = await bookModel.getById(id);
        if (!book) {
            const err = new Error('Sách không tồn tại');
            err.statusCode = 404;
            throw err;
        }
        if (book.deleted) {
            const err = new Error('Sách đã bị xóa mềm trước đó');
            err.statusCode = 400;
            throw err;
        }
        const err = new Error('Không thể xóa sách');
        err.statusCode = 400;
        throw err;
    }
    return { id, deleted: true };
}

async function restoreBook(id) {
    const affected = await bookModel.restore(id);
    if (affected === 0) {
        const book = await bookModel.getById(id);
        if (!book) {
            const err = new Error('Sách không tồn tại');
            err.statusCode = 404;
            throw err;
        }
        if (!book.deleted) {
            const err = new Error('Sách hiện không bị xóa mềm');
            err.statusCode = 400;
            throw err;
        }
        const err = new Error('Không thể khôi phục sách');
        err.statusCode = 400;
        throw err;
    }
    const restored = await bookModel.getById(id);
    return restored;
}
module.exports = {
    listBooks,
    addBook,
    softDeleteBook,
    restoreBook,
};
