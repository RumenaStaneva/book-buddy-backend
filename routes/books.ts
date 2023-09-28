import { Request, Response, Router } from 'express';
import { getUserLibrary, addToShelf, getAllBooksOnShelf, updateBook, getBookDetails, deleteBook } from '../controllers/booksController';
import requireAuth from '../middleware/requireAuth';

const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
    res.send('Welcome to the Book Search API');
});

router.use(requireAuth);
//fire this middleware before everything bellow so that thwy are protected
//require auth for all books routes
router.get('/library', getUserLibrary)

router.post('/add-to-shelf', addToShelf);

router.get('/see-all', getAllBooksOnShelf);
router.put('/update-book', updateBook);
router.get('/book-details', getBookDetails);
router.delete('/delete-book', deleteBook);


export default router;