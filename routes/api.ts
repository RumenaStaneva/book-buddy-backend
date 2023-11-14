import { Router } from 'express';
import { searchBooks, nytBooks } from '../controllers/booksController';

const router = Router();
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
router.post('/popular-books', nytBooks);


export default router;