import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { IGetUserAuthInfoRequest } from '../types/express';
const SECRET: string = process.env.SECRET || '';
import User, { User as UserType } from '../models/userModel';
// import type { User } from '../models/userModel';



const requireAuth = async (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {

    //verify authentication
    const { authorization } = req.headers;

    //check if header exists
    if (!authorization) {
        return res.status(401).json({ error: 'Authorization token required' });
    };

    const token = authorization.split(' ')[1];

    try {
        const payload = jwt.verify(token, SECRET) as JwtPayload;

        if (typeof payload === 'string') {
            res.status(401).json({ error: 'Request is not authorized' });
        } else {
            const { _id } = payload;
            const user = await User.findOne({ _id }).select('_id');
            if (!user) {
                res.status(401).json({ error: 'Request is not authorized' });
            }
            req.user = user as UserType;
            next();
        }
    } catch (error) {
        res.status(401).json({ error: 'Request is not authorized' });
    }
}

export default requireAuth;