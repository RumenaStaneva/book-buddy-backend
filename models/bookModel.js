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
        required: true,
    },
    pageCount: {
        type: String,
        required: true,
    },
});

bookSchema.statics.createBook = async function (bookApiId, title, authors, description, publisher, thumbnail, categories, pageCount) {
    //validation for everything
    if (!bookApiId || !title) {
        throw Error('All fields must be filled');
    }

    //todo make it to search for user's book
    //const exists = await this.findOne({ book })
    // if (exists) {
    //     throw Error('book already exists')
    // }


    const book = await this.create({ bookApiId, title, authors, description, publisher, thumbnail, categories, pageCount })

    return book;
};


module.exports = mongoose.model('Book', bookSchema);