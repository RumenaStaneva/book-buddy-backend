import { Router } from 'express';
import { searchBooks } from '../controllers/booksController';

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


export default router;