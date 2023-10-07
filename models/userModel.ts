import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';
import { generateVerificationToken, sendVerificationEmail } from '../utils/email';


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

// defines the shape of a user document DB collection, specifies the fields and their data types that a user document should have- email, password, isAdmin, bio, etc. 
// This interface helps you ensure that when you create or update user documents in your application, they conform to this structure
export interface User extends Document {
    email: string;
    password: string;
    isAdmin: boolean;
    bio?: string | null;
    userId?: string | null;
    username: string;
    isVerified: boolean;
    verificationToken: string | null;
    verificationTokenExpiry: Date | null;
    resetToken: string | null;
    resetTokenExpiry: Date | null;
    profilePicture: string | null;
}

// includes all the properties of the User interface but also includes some additional fields provided by Mongoose - _id, __v, and any 
//  When you retrieve a user document from the database using Mongoose methods like .find(), .findOne(), etc., it will have the structure defined in the UserDocument interface.
export interface UserDocument extends mongoose.Document {
    email: string;
    password: string;
    isAdmin: boolean;
    bio?: string | null;
    userId?: string | null;
    username: string;
    isVerified: boolean;
    verificationToken: string | null;
    verificationTokenExpiry: Date | null;
    resetToken: string | null;
    resetTokenExpiry: Date | null;
    profilePicture: string | null;
}

// represents the entire collection of users in your database and provides access to methods that can be performed on the entire collection - find, findOne, create, update, etc. It also includes any static methods you define on your model - signup and login.
export interface UserModel extends mongoose.Model<UserDocument> {
    signup(email: string, password: string, isAdmin: boolean, bio: string, username: string): Promise<UserDocument>;
    login(emailOrUsername: string, password: string): Promise<UserDocument>;
    signUpWithGoogleAuth(userId: string, userEmail: string): Promise<UserDocument>;
    loginWithGoogleAuth(userId: string, userEmail: string): Promise<UserDocument>;
}
const userSchema: Schema<UserDocument, UserModel> = new Schema({
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
    userId: {
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
        type: String,
        default: null
    },
    verificationTokenExpiry: {
        type: Date,
        default: null,
    },
    resetToken: {
        type: String,
        default: null,
    },
    resetTokenExpiry: {
        type: Date,
        default: null,
    },
    profilePicture: {
        type: String,
        default: null
    }
});

//static signup method for users
userSchema.statics.signup = async function (email: string, password: string, isAdmin: boolean, bio: string, username: string) {
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
    const verificationTokenExpiry = new Date().getTime() + 60 * 60 * 1000;

    const user = await this.create({ email, password: hash, isAdmin, bio, username, verificationToken, verificationTokenExpiry: new Date(verificationTokenExpiry) });

    return user;
};

userSchema.statics.signUpWithGoogleAuth = async function (userId: string, userEmail: string) {
    const username = userEmail.split('@')[0];
    let userExisting = await this.findOne({ userId: userId });
    if (userExisting) {
        throw Error('User already exists');
    }
    const user = await this.create({
        userId: userId,
        email: userEmail,
        username: username,
        isVerified: true,
        isAdmin: false,
        password: 'signed with google'
    });
    return user;

};
//static login method for users
userSchema.statics.login = async function (emailOrUsername: string, password: string): Promise<User> {
    //validation
    if (!emailOrUsername || !password) {
        throw Error('All fields must be filled');
    }

    const isEmail = validator.isEmail(emailOrUsername);

    // Define a query object to search by either email or username
    const query = isEmail ? { email: emailOrUsername } : { username: emailOrUsername };

    const user = await this.findOne(query)
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

userSchema.statics.loginWithGoogleAuth = async function (userId: string, userEmail: string) {
    const user = await this.findOne({ userId, email: userEmail })
    if (!user) {
        throw Error('User not does not exist, please signup first');
    }
    return user;
}

// export default mongoose.model<UserDocument, UserModel>('User', userSchema);
const User = mongoose.model<UserDocument, UserModel>('User', userSchema);
export default User;