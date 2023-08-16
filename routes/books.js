const express = require('express');
const { getUserLibrary, addToShelf, updateBookProgress, getAllBooksOnShelf, updateBook } = require('../controllers/booksController');
const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Welcome to the Book Search API');
});

router.use(requireAuth);
//fire this middleware before everything bellow so that thwy are protected
//require auth for all books routes
router.get('/library', getUserLibrary)

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Create a new book and add to shelf
 *     tags:
 *       - Books
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book' 
 *     responses:
 *       '201':
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book' 
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */
router.post('/add-to-shelf', addToShelf);

router.post('/update-book-progress', updateBookProgress);
router.get('/see-all', getAllBooksOnShelf);
router.put('/update-book', updateBook);


module.exports = router;