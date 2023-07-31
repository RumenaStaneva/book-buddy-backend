const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bookSchema = new Schema({
    bookApiId: {
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
    categories: {
        type: Array,
        default: ['Not specified']
    },
    pageCount: {
        type: String,
        required: true,
    },
});

bookSchema.statics.createBook = async function (bookApiId, title, authors, description, publisher, thumbnail, categories, pageCount) {
    //validation
    console.log(bookApiId, title, authors, description, publisher, thumbnail, categories, pageCount);
    if (!bookApiId || !title || !authors || !description || !publisher || !thumbnail || !pageCount) {
        throw Error('All fields must be filled');
    }


    const existingBook = await this.findOne({ bookApiId })
    if (existingBook) {
        return existingBook;
    } else {
        const book = await this.create({ bookApiId, title, authors, description, publisher, thumbnail, categories, pageCount })
        return book;
    }


};


module.exports = mongoose.model('Book', bookSchema);