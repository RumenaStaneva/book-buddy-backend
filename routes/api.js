const express = require('express');
const { searchBooks } = require('../controllers/booksController');

const router = express.Router();
/**
 * @swagger
 * /search-book-title:
 *   get:
 *     summary: Get data from Google Books API.
 *     responses:
 *       200:
 *         description: Successful response.
 */
router.post('/search-book-title', searchBooks);

module.exports = router;