import mongoose, { Schema, Model } from 'mongoose';
import ShelfType from '../enums/shelfTypes';
import CategoryType from '../enums/categoryTypes';
import { body } from 'express-validator';
import { validationResult } from 'express-validator';
import { uploadThumbnailImageToStorage, uploadImageByUrlToStorage } from '../utils/googlestorage'

interface BookModel extends Model<BookDocument> {
    createBook(data: BookData): Promise<BookDocument>;
}


interface BookData {
    bookApiId: string;
    owner: string;
    title?: string;
    authors: string[];
    description: string;
    publisher?: string;
    thumbnail?: string;
    category?: string;
    pageCount: number;
    progress?: number;
    shelf: number;
    notes?: string[];
}

interface BookDocument extends mongoose.Document {
    bookApiId: string;
    owner: string;
    title?: string;
    authors: string[];
    description: string;
    publisher?: string;
    thumbnail?: string;
    category?: string;
    pageCount: number;
    progress?: number;
    shelf: number;
    notes?: string[];
}
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
        default: 'No title'
    },
    authors: {
        type: Array,
        required: true,
    },
    description: {
        type: String,
        required: true,
        validate: {
            validator: function (value: any) {
                return value !== 'undefined' && typeof value !== 'undefined';
            },
            message: 'Description cannot be empty'
        }
    },
    publisher: {
        type: String || undefined,
    },
    thumbnail: {
        type: String,
    },
    category: {
        type: String,
        required: true,
        enum: CategoryType,
        default: 'Not specified'
    },
    pageCount: {
        type: Number,
        required: [true, 'Page count is required'],
        min: [1, 'Page count must be a positive integer'],
        validate: {
            validator: function (value: number) {
                return value !== 0;
            },
            message: 'Page count must be greater than 0',
        },
    },
    progress: {
        type: Number,
    },
    shelf: {
        type: Number,
        required: true,
        enum: ShelfType,
        default: ShelfType.WANT_TO_READ,
    },
});

bookSchema.statics.createBook = async function (data) {

    const { bookApiId, owner, title, authors, description, publisher, category, pageCount, progress, shelf } = data;
    // console.log('description', typeof description);

    try {
        await Promise.all([
            body(bookApiId).notEmpty().withMessage('Book API ID is required').trim().run(this),
            body(owner).notEmpty().withMessage('Owner ID is required').trim().run(this),
            body(title).trim().run(this),
            body('description')
                .notEmpty().withMessage('Description is required')
                .isString().withMessage('Description must be a string')
                .custom((value, { req }) => {
                    if (value === 'undefined') {
                        throw new Error('Description cannot be "undefined"');
                    }
                    return true;
                }),
            body(category).notEmpty().withMessage('Category is required').isIn(Object.values(CategoryType)).run(this),
            body(pageCount).notEmpty().withMessage('Page count is required').isInt({ min: 1 }).withMessage('Page count must be a positive integer'),
            body(progress).isNumeric().run(this),
            body(shelf).notEmpty().withMessage('Shelf is required').isIn(Object.values(ShelfType)).run(this),
        ]);

        const existingBook = await this.findOne({ bookApiId, owner })

        if (existingBook) {
            throw new Error('Book already exists in your shelf');
        } else {
            if (description === undefined || description === 'undefined' || description.trim() === '') {
                throw new Error('Description cannot be empty');
            }

            if (pageCount === undefined || pageCount <= 0) {
                throw new Error('Page count must be a positive integer');
            }

            if (!Object.values(ShelfType).includes(Number(shelf))) {
                throw new Error('Invalid shelf');
            }

            if (!Object.values(CategoryType).includes(category)) {
                throw new Error('Invalid category');
            }

            const book = await this.create({ bookApiId, owner, title, authors: authors != 'undefined' ? authors : undefined, description, publisher: publisher != 'undefined' ? publisher : undefined, thumbnail: '', category, pageCount, progress, shelf })
            return book;
        }

    } catch (error: any) {
        console.error('Error creating book:', error);
        throw error;
    }

};


const Book = mongoose.model<BookDocument, BookModel>('Book', bookSchema);
export default Book;