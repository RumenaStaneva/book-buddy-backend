const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET;

//_id of mongodb
const createToken = (_id) => {
    return jwt.sign({ _id }, SECRET, { expiresIn: '3d' })
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.login(email, password);
        const username = user.username;
        const isVerified = user.isVerified;
        if (user) {
            const token = createToken(user._id);
            res.status(200).json({ email, token, username, isVerified });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }

}

const signUpUser = async (req, res) => {
    const { email, password, username } = req.body;
    const isAdmin = false;
    const bio = '';

    try {
        const user = await User.signup(email, password, isAdmin, bio, username);
        res.status(200).json(null);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }

}

//todo add email vefification
const signUpAdmin = async (req, res) => {
    const { email, password } = req.body;
    const isAdmin = true;
    const bio = '';
    const username = '';

    try {
        const userAdmin = await User.signup(email, password, isAdmin, bio, username);
        // const token = createToken(userAdmin._id);
        // res.status(200).json({ email, token, username });
        console.log('user ', userAdmin);
        res.status(200).json({ message: 'User admin registered successfully. Please check your email for verification.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }

}

const verifyUser = async (req, res) => {
    const { token } = req.params;
    try {
        const user = await User.findOneAndUpdate(
            { verificationToken: token },
            { isVerified: true },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ error: 'Invalid token or user is already verified' });
        }

        res.status(200).json({ message: 'Email verification successful.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const getProfile = async (req, res) => {
    const userId = req.user._id;
    const userProfile = await User.findOne({ _id: userId })

    try {
        if (userProfile) {
            res.json({ userProfile });
        } else {
            res.status(404).json({ error: 'User profile not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const updateProfile = async (req, res) => {
    const { bio, username } = req.body;
    const userId = req.user._id;
    try {
        const updatedProfile = await User.findOneAndUpdate(
            { _id: userId },
            { bio, username },
            { new: true }
        );

        if (updatedProfile) {
            res.status(200).json({ message: 'Profile updated successfully', profile: updatedProfile });
        } else {
            res.status(404).json({ error: 'User profile not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = {
    loginUser,
    signUpUser,
    signUpAdmin,
    getProfile,
    updateProfile,
    verifyUser
}