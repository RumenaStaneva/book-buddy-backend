import { Router } from 'express';

import { createNote, getNotes, updateNote, deleteNote } from '../controllers/notesController';
import requireAuth from '../middleware/requireAuth';

const router = Router();


router.use(requireAuth);

router.post('/add-note', createNote);
router.get('/book-notes', getNotes);
router.put('/update-note', updateNote);
router.delete('/delete-note', deleteNote);


export default router;