const express = require('express');
const { loginUser, signUpUser, signUpAdmin } = require('../controllers/userController');

const router = express.Router();

router.post('/login', loginUser);
router.post('/sign-up', signUpUser);
router.post('/sign-up-admin', signUpAdmin);

module.exports = router;