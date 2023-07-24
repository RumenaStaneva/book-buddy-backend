const User = require('../models/userModel');

const loginUser = async (req, res) => {
    res.json({ mssg: 'login user' });

}

const signUpUser = async (req, res) => {
    const { email, password } = req.body;
    const isAdmin = false;

    try {
        const user = await User.signup(email, password, isAdmin);
        res.status(200).json({ email, user });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }

}

const signUpAdmin = async (req, res) => {
    const { email, password } = req.body;
    const isAdmin = true;
    try {
        const userAdmin = await User.signup(email, password, isAdmin);
        res.status(200).json({ email, userAdmin });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }

}

module.exports = {
    loginUser,
    signUpUser,
    signUpAdmin,
}