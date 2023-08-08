const mongoose = require('mongoose');
const ShelfType = require('../enums/shelfTypes');
const CategoryType = require('../enums/CategoryTypes');
const { body } = require('express-validator');

const Schema = mongoose.Schema;


/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       properties:
 *         bookApiId:
 *           type: string
 *           description: The unique identifier for the book.
 *         owner:
 *           type: string
 *           description: The owner of the book.
 *         title:
 *           type: string
 *           description: The title of the book.
 *         authors:
 *           type: array
 *           items:
 *             type: string
 *           description: The authors of the book.
 *         description:
 *           type: string
 *           description: The description of the book.
 *         publisher:
 *           type: string
 *           description: The publisher of the book.
 *         thumbnail:
 *           type: string
 *           description: The URL of the book's thumbnail.
 *         category:
 *           type: string
 *           description: The category of the book.
 *         pageCount:
 *           type: string
 *           description: The number of pages in the book.
 *         progress:
 *           type: number
 *           description: The reading progress of the book.
 *         shelf:
 *           type: number
 *           description: The shelf where the book is placed.
 *           enum: [0, 1, 2]  # Example values for ShelfType
 *           default: 1  # Default value for the shelf.
 *       required:
 *         - bookApiId
 *         - owner
 *         - title
 *         - authors
 *         - description
 *         - pageCount
 *         - shelf
 */

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

bookSchema.statics.createBook = async function (data) {

    const { bookApiId, owner, title, authors, description, publisher, thumbnail, categories, pageCount, notes, progress, shelf } = data;
    try {
        // Additional validation using express-validator
        await Promise.all([
            body(bookApiId).notEmpty().withMessage('Book API ID is required').trim().run(this),
            body(owner).notEmpty().withMessage('Owner ID is required').trim().run(this),
            body(title).notEmpty().withMessage('Title is required').trim().run(this),
            body(authors).notEmpty().withMessage('Authors are required').isArray().run(this),
            body(description).notEmpty().withMessage('Description is required').trim().run(this),
            body(publisher).trim().run(this),
            body(thumbnail).notEmpty().withMessage('Please upload an image').trim().run(this),
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