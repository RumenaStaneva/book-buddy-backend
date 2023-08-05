const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET;
const User = require('../models/userModel');

const requireAuth = async (req, res, next) => {

    //verify authentication
    const { authorization } = req.headers;

    //check if header exists
    if (!authorization) {
        return res.status(401).json({ error: 'Authorization token required' });
    };

    const token = authorization.split(' ')[1];

    try {
        const { _id } = jwt.verify(token, SECRET);

        //attach the user property to request, so that when we go to one of the next middleware /some router functions/ 
        req.user = await User.findOne({ _id }).select('_id'); //with select we choose which property to be returned from the found user
        next();
    } catch (error) {
        res.status(401).json({ error: 'Request is not authorized' });
    }
}

module.exports = requireAuth;