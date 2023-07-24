const express = require('express');
const { searchBooks } = require('../controllers/booksController');

const router = express.Router();


router.get('/', (req, res) => {
    res.send('Welcome to the Book Search API');
});


router.post('/search-book-title', searchBooks);

module.exports = router;