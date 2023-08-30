const axios = require('axios');
const dotenv = require('dotenv');
const NoteModel = require('../models/noteModel');
const BookModel = require('../models/bookModel');

dotenv.config();

const createNote = async (req, res) => {
    const userId = req.user._id;
    const { bookId, noteText } = req.body;
    try {
        console.log(userId, bookId, noteText);
        const note = await NoteModel.createNote({ bookId, userId, noteText });
        res.status(200).json({ note });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const getNotes = async (req, res) => {
    const userId = req.user._id;
    const bookId = req.query.bookId;
    try {
        const book = await BookModel.findOne({ owner: userId, _id: bookId });
        if (!book) {
            return res.status(400).json({ error: 'Book does not exist' });
        }
        const notes = await NoteModel.find({ userId, bookId });
        console.log(notes);
        res.status(200).json({ notes });
    } catch (error) {
        res.status(400).json({ error: 'Error while book`s notes' });
    }
}

module.exports = {
    createNote,
    getNotes
}