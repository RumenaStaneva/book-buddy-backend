const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const Schema = mongoose.Schema;
const { generateVerificationToken, sendVerificationEmail } = require('../utils/email')

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The email address of the user.
 *         password:
 *           type: string
 *           description: The password of the user.
 *         isAdmin:
 *           type: boolean
 *           description: Indicates whether the user is an admin or not.
 *       required:
 *         - email
 *         - password
 *         - isAdmin
 */

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        required: true,
    },
    bio: {
        type: String
    },
    username: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String
    }
});

//static signup method for users
userSchema.statics.signup = async function (email, password, isAdmin, bio, username) {
    //validation
    if (!email || !password || !username) {
        throw Error('All fields must be filled');
    }
    if (!validator.isEmail(email)) {
        throw Error('Please provide valid email');
    }
    if (!validator.isStrongPassword(password)) {
        throw Error('Password not strong enough');
    }

    const existsEmail = await this.findOne({ email })
    if (existsEmail) {
        throw Error('Email already in use')
    }

    const usernameExists = await this.findOne({ username });
    if (usernameExists) {
        throw Error('Username already in use');
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt);
    const verificationToken = generateVerificationToken();

    await sendVerificationEmail(email, verificationToken, username);

    const user = await this.create({ email, password: hash, isAdmin, bio, username, verificationToken });

    return user;
};

//static login method for users
userSchema.statics.login = async function (email, password) {
    //validation
    if (!email || !password) {
        throw Error('All fields must be filled');
    }

    const user = await this.findOne({ email })
    if (!user) {
        throw Error('Invalid login credentials!');
    }

    if (!user.isVerified) {
        throw Error('User is not verified, please check your email for verification link or contact support.');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        throw Error('Invalid login credentials!');
    }

    return user;
};

module.exports = mongoose.model('User', userSchema);