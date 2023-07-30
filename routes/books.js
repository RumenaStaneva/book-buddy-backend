const express = require('express');
const { searchBooks, getUserLibrary, addToShelf } = require('../controllers/booksController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();


router.get('/', (req, res) => {
    res.send('Welcome to the Book Search API');
});

router.use(requireAuth);
//fire this middleware before everything bellow so that thwy are protected
//require auth for all books routes

router.post('/search-book-title', searchBooks);

router.get('/library/:id', getUserLibrary)

router.post('/add-to-shelf', addToShelf)

module.exports = router;