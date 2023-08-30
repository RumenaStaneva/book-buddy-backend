const express = require('express');
const { createNote, getNotes } = require('../controllers/notesController');
const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

router.use(requireAuth);

router.post('/add-note', createNote);
router.get('/book-notes', getNotes);


module.exports = router;