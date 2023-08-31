const axios = require('axios');
const dotenv = require('dotenv');
const NoteModel = require('../models/noteModel');
const BookModel = require('../models/bookModel');

dotenv.config();

const createNote = async (req, res) => {
    const userId = req.user._id;
    const { bookId, noteText } = req.body;
    try {
        // console.log(userId, bookId, noteText);
        const note = await NoteModel.createNote({ bookId, userId, noteText });
        res.status(200).json({ note });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const getNotes = async (req, res) => {
    const userId = req.user._id;
    const bookId = req.query.bookId;
    const offset = parseInt(req.query.offset) || 0;
    const limit = 10;

    try {
        const book = await BookModel.findOne({ owner: userId, _id: bookId });
        if (!book) {
            return res.status(400).json({ error: 'Book does not exist' });
        }

        const notes = await NoteModel.find({ userId, bookId })
            .skip(offset)
            .limit(limit);

        res.status(200).json({ notes });
    } catch (error) {
        res.status(400).json({ error: 'Error while fetching book\'s notes' });
    }
};


module.exports = {
    createNote,
    getNotes
}