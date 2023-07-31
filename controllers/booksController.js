const axios = require('axios');
const dotenv = require('dotenv');
const BookModel = require('../models/bookModel');
const LibraryBookModel = require('../models/libraryBookModel');
const User = require('../models/userModel');
dotenv.config();


let KEY = process.env.KEY


const searchBooks = async (req, res, next) => {
    try {
        const { title, startIndex, maxResults } = req.body;
        const url = `https://www.googleapis.com/books/v1/volumes?q=${title}&startIndex=${startIndex}&maxResults=${maxResults}&printType=books&key=${KEY}`;
        const response = await axios.get(url);

        const books = response.data.items;
        const totalItems = response.data.totalItems;
        res.status(200).json({ books, totalItems });
    } catch (error) {
        console.error('Error fetching books:', error.message);
        res.status(500).json({ error: 'Error fetching books from the Google Books API' });
    }
}

const getUserLibrary = (req, res) => {
    res.json({ "message": "congarts, you made a protected route" })
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
    } = req.body;


    const user = await User.findOne({ email: userEmail });
    let userId;
    if (!user) {
        console.log('No such user in DB');
    } else {
        userId = user._id.toString();
    }

    try {
        const book = await BookModel.createBook(bookApiId, title, authors, description, publisher, thumbnail, categories, pageCount);
        if (book) {
            try {
                const library = await LibraryBookModel.createLibraryBook(userId, book._id, [], 0, 0);
                res.status(200).json({ book, library });
            } catch (error) {
                console.log(error.message);
                res.status(400).json({ error: error.message });
            }
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    }
}

module.exports = {
    searchBooks,
    getUserLibrary,
    addToShelf
}