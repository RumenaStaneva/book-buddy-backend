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
    const thumbnail = req.file ? req.file.filename : req.body.thumbnail;
    const {
        bookApiId,
        userEmail,
        title,
        authors,
        description,
        publisher,
        category,
        pageCount,
        notes,
        progress,
        shelf
    } = req.body;
    const user = await User.findOne({ email: userEmail });
    let owner;
    if (!user) {
        console.log('No such user in DB');
        return res.status(401).json({ error: 'No such user in DB' });
    } else {
        owner = user._id.toString();
    }

    try {
        const book = await BookModel.createBook({ bookApiId, owner, title, authors, description, publisher, thumbnail, category, pageCount, notes, progress, shelf });
        res.status(200).json({ book });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const updateBook = async (req, res) => {
    const userId = req.user._id;
    const {
        _id,
        title,
        authors,
        description,
        thumbnail,
        category,
        progress,
        shelf,
        pageCount
    } = req.body.book;
    try {
        const book = await BookModel.findOne({ owner: userId, _id: _id });
        if (!book) {
            return res.status(400).json({ error: 'Book does not exist' });
        }

        const updatedProgress = progress;

        book.progress = updatedProgress;

        if (book.pageCount === updatedProgress) {
            book.shelf = 2;
        } else {
            book.shelf = shelf;
        }

        book.title = title;
        book.authors = authors;
        book.description = description;
        book.category = category;
        book.pageCount = pageCount;
        book.thumbnail = thumbnail;
        await book.save();
        res.status(200).json({ book });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }

}

const getAllBooksOnShelf = async (req, res) => {
    const userId = req.user._id;
    const shelf = req.query.shelf;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const filterCategory = req.query.category;
    const searchQuery = req.query.search;

    try {
        let query = { owner: userId, shelf: shelf };
        if (filterCategory) {
            query.category = filterCategory;
        }

        if (searchQuery) {
            query.title = { $regex: searchQuery, $options: 'i' };
        }

        const books = await BookModel.find(query)
            .skip(skip)
            .limit(limit)
            .exec();

        const totalBooks = await BookModel.countDocuments(query);
        const totalPages = Math.ceil(totalBooks / limit);

        res.status(200).json({ books, totalPages });
    } catch (error) {
        res.status(400).json({ error: 'Error while fetching all books on shelf' });
    }
}

const getBookDetails = async (req, res) => {
    const userId = req.user._id;
    const bookId = req.query.bookId;

    try {
        const book = await BookModel.findOne({ owner: userId, _id: bookId });
        if (!book) {
            return res.status(400).json({ error: 'Book does not exist' });
        }
        // console.log(book);
        res.status(200).json({ book });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = {
    searchBooks,
    getUserLibrary,
    addToShelf,
    getAllBooksOnShelf,
    updateBook,
    getBookDetails
}