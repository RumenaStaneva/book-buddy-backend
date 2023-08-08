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

const getUserLibrary = (req, res) => {
    res.json({ "message": "congarts, you made a protected route" })
}

const addToShelf = async (req, res) => {
    // console.log(req.file);
    // console.log(req.body);
    // console.log(req.body);
    // const imageName = req.file.filename;
    // console.log(imageName);

    // if (!req.file && !req.body.thumbnail) {
    //     return res.status(400).json({ error: 'Please upload a file' });
    // }

    const thumbnail = req.file ? req.file.filename : req.body.thumbnail;

    const {
        bookApiId,
        userEmail,
        title,
        authors,
        description,
        publisher,
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
        return res.status(401).json({ error: 'No such user in DB' });
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

const getBookDetails = async (req, res) => {
    console.log('1');
    // try {
    //     const book = await Book.findById(req.params.id);
    //     if (!book) {
    //         return res.status(404).json({ error: 'Book not found' });
    //     }
    //     res.json(book);
    // } catch (error) {
    //     res.status(500).json({ error: 'Internal server error' });
    // }
}

module.exports = {
    searchBooks,
    getUserLibrary,
    addToShelf,
    getBookDetails
}