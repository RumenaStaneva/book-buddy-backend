

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BookModel = require('../models/bookModel');

const noteSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    bookId: {
        type: String,
        required: true,
    },
    noteText: {
        type: String,
        required: true,
    },
});

noteSchema.statics.createNote = async function (data) {
    const { userId, bookId, noteText } = data;
    try {
        const existingBook = await BookModel.findOne({ _id: bookId, owner: userId });
        if (existingBook) {
            const note = await this.create({ bookId, userId, noteText })
            return note;
        } else {
            throw new Error('Book does not exists');
        }
    } catch (error) {
        console.error('Error creating note:', error);
        throw error;
    }
};

module.exports = mongoose.model('Note', noteSchema);