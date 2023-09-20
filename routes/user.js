const express = require('express');
const { loginUser, signUpUser, signUpAdmin, getProfile, updateProfile, verifyUser } = require('../controllers/userController');
const requireAuth = require('../middleware/requireAuth');


const router = express.Router();
router.get('/verify', verifyUser);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API endpoints for user management
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the user.
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *             required:
 *               - email
 *               - password
 *     responses:
 *       '200':
 *         description: Successful login
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               message: Incorrect email or password
 *       '500':
 *         description: Internal server error
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /api/users/sign-up:
 *   post:
 *     summary: Sign up a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the user.
 *               password:
 *                 type: string
 *                 description: The password of the user.
 *             required:
 *               - email
 *               - password
 *     responses:
 *       '201':
 *         description: User registered successfully
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             example:
 *               message: Weak password. Password must be at least 8 characters long and contain a mix of letters, numbers, and special characters.
 *       '409':
 *         description: Conflict
 *         content:
 *           application/json:
 *             example:
 *               message: Email already in use
 *       '500':
 *         description: Internal server error
 */
router.post('/sign-up', signUpUser);

/**
 * @swagger
 * /api/users/sign-up-admin:
 *   post:
 *     summary: Sign up a new admin user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address of the admin user.
 *               password:
 *                 type: string
 *                 description: The password of the admin user.
 *             required:
 *               - email
 *               - password
 *     responses:
 *       '201':
 *         description: Admin user registered successfully
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             example:
 *               message: Weak password. Password must be at least 8 characters long and contain a mix of letters, numbers, and special characters.
 *       '409':
 *         description: Conflict
 *         content:
 *           application/json:
 *             example:
 *               message: Email already in use
 *       '500':
 *         description: Internal server error
 */
router.post('/sign-up-admin', signUpAdmin);



router.use(requireAuth);
router.get('/profile', getProfile);
router.patch('/update-profile-info', updateProfile);

module.exports = router;