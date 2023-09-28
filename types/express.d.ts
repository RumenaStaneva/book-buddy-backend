import { User } from '../models/userModel';
import { Request } from "express"
export interface IGetUserAuthInfoRequest extends Request {
    user?: User;
}
