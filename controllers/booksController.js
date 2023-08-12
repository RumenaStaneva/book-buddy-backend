const axios = require('axios');
const dotenv = require('dotenv');
const BookModel = require('../models/bookModel');
const User = require('../models/userModel');
dotenv.config();

let KEY = process.env.KEY

const searchBooks = async (req, res, next) => {
    try {
        const { title, startIndex, maxResults } = req.body;
        const url = `https://www.googleapis.com/books/v1/volumes?q=${title}&startIndex=${startIndex}&maxResults=${maxResults}&printType=books&key=${KEY}`;
        const response = await axios.get(url);
        res.json(response.data);

    } catch (error) {
        console.error('Error fetching books:', error.message);
        res.status(500).json({ error: 'Error fetching books from the Google Books API' });
    }
}

const getUserLibrary = async (req, res) => {
    const userId = req.user._id;

    const user = await User.findOne({ _id: userId });
    if (user) {
        try {
            const wantToReadBooks = await BookModel.find({ owner: userId, shelf: 0 })
                .sort({ _id: -1 })
                .limit(5);
            const currntlyReadingBooks = await BookModel.find({ owner: userId, shelf: 1 })
                .sort({ _id: -1 })
                .limit(5);
            const readBooks = await BookModel.find({ owner: userId, shelf: 2 })
                .sort({ _id: -1 })
                .limit(5);
            res.status(200).json({ wantToReadBooks, currntlyReadingBooks, readBooks });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    } else {
        res.status(400).json({ error: 'User does not exist' });
    }
}

const addToShelf = async (req, res) => {
    const {
        userEmail,
        bookApiId,
        title,
        authors,
        description,
        publisher,
        thumbnail,
        categories,
        pageCount,
        notes,
        progress,
        shelf
    } = req.body;

    const user = await User.findOne({ email: userEmail });
    let owner;
    if (!user) {
        console.log('No such user in DB');
    } else {
        owner = user._id.toString();
    }


    try {
        const book = await BookModel.createBook({ bookApiId, owner, title, authors, description, publisher, thumbnail, categories, pageCount, notes, progress, shelf });
        res.status(200).json({ book });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const updateBookProgress = async (req, res) => {
    const userId = req.user._id;
    const user = await User.findOne({ _id: userId });
    if (user) {
        const bookId = req.body.bookId;
        const book = await BookModel.findOne({ owner: userId, _id: bookId });
        if (book) {
            const updatedProgress = req.body.progress;
            try {
                book.progress = updatedProgress;
                await book.save();
                res.status(200).json({ book });
            } catch (error) {
                res.status(400).json({ error: error.message });
            }
        } else {
            res.status(400).json({ error: 'Book does not exist' });
        }
    } else {
        res.status(400).json({ error: 'User does not exist' });
    }
}

module.exports = {
    searchBooks,
    getUserLibrary,
    addToShelf,
    updateBookProgress
}