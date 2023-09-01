const express = require('express');
const { createNote, getNotes, updateNote } = require('../controllers/notesController');
const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

router.use(requireAuth);

router.post('/add-note', createNote);
router.get('/book-notes', getNotes);
router.put('/update-note', updateNote)


module.exports = router;