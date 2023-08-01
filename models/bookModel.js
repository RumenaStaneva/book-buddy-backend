const mongoose = require('mongoose');
const ShelfType = require('../enums/shelfTypes');
const CategoryType = require('../enums/CategoryTypes');
const { body } = require('express-validator');

const Schema = mongoose.Schema;

const bookSchema = new Schema({
    bookApiId: {
        type: String,
        required: true,
    },
    owner: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    authors: {
        type: Array,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    publisher: {
        type: String,
    },
    thumbnail: {
        type: String,
    },
    category: {
        type: String,
        default: 'Not specified'
    },
    pageCount: {
        type: String,
        required: true,
    },
    notes: {
        type: Array,
    },
    progress: {
        type: Number,
    },
    shelf: {
        type: Number,
        required: true,
        enum: Object.values(ShelfType),
        default: ShelfType.WANT_TO_READ,
    },
});

bookSchema.statics.createBook = async function (bookApiId, owner, title, authors, description, publisher, thumbnail, categories, pageCount, notes, progress, shelf) {

    console.log(title);

    try {
        // Additional validation using express-validator
        await Promise.all([
            body(bookApiId).notEmpty().withMessage('Book API ID is required').trim().run(this),
            body(owner).notEmpty().withMessage('Owner ID is required').trim().run(this),
            body(title).notEmpty().withMessage('Title is required').trim().run(this),
            body(authors).notEmpty().withMessage('Authors are required').isArray().run(this),
            body(description).notEmpty().withMessage('Description is required').trim().run(this),
            body(publisher).trim().run(this),
            body(thumbnail).trim().run(this),
            body(categories).notEmpty().withMessage('Category is required').isIn(Object.values(CategoryType)).run(this),
            body(pageCount).notEmpty().withMessage('Page count is required').trim().run(this),
            body(notes).isArray().run(this),
            body(progress).isNumeric().run(this),
            body(shelf).notEmpty().withMessage('Shelf is required').isIn(Object.values(ShelfType)).run(this),
        ]);

        const existingBook = await this.findOne({ bookApiId, owner })
        if (existingBook) {
            throw new Error('Book already exists in your shelf');
        } else {
            const book = await this.create({ bookApiId, owner, title, authors, description, publisher, thumbnail, categories, pageCount, notes, progress, shelf })
            return book;
        }

    } catch (error) {
        console.error('Error creating book:', error);
        throw error;
    }



};


module.exports = mongoose.model('Book', bookSchema);