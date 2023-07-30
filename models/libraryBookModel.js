const mongoose = require('mongoose');
const ShelfType = require('../enums/shelfTypes');

const Schema = mongoose.Schema;

const libraryBookSchema = new Schema({
    owner: {
        type: String,
        required: true,
    },
    book: {
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

libraryBookSchema.statics.createLibraryBook = async function (owner, book, notes, progress, shelf) {
    //validation

    //todo make it to search for user's book
    //const exists = await this.findOne({ book })
    // if (exists) {
    //     throw Error('book already exists')
    // }


    const libraryBook = await this.create({ owner, book, notes, progress, shelf })

    return libraryBook;
};

module.exports = mongoose.model('LibraryBook', libraryBookSchema);