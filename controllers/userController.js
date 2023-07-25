const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const SECRET = process.env.SECRET;

//_id of mongodb
const createToken = (_id) => {
    return jwt.sign({ _id }, SECRET, { expiresIn: '3d' })
}

const loginUser = async (req, res) => {
    res.json({ mssg: 'login user' });

}

const signUpUser = async (req, res) => {
    const { email, password } = req.body;
    const isAdmin = false;

    try {
        const user = await User.signup(email, password, isAdmin);

        const token = createToken(user._id);
        res.status(200).json({ email, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }

}

const signUpAdmin = async (req, res) => {
    const { email, password } = req.body;
    const isAdmin = true;
    try {
        const userAdmin = await User.signup(email, password, isAdmin);
        const token = createToken(userAdmin._id);
        res.status(200).json({ email, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }

}

module.exports = {
    loginUser,
    signUpUser,
    signUpAdmin,
}