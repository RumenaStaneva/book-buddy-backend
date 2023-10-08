import { Request, Response } from 'express';
import User from '../models/userModel';
import jwt, { JwtPayload } from 'jsonwebtoken';
const SECRET: string = process.env.SECRET || '';
import { generateVerificationToken, resetPasswordEmail } from '../utils/email';
import { hashPassword, comparePasswords } from '../utils/password';
import { IGetUserAuthInfoRequest } from '../types/express';
import { verifyGoogleToken } from './authController';
import uploadImageToStorage from '../utils/googlestorage';

const createToken = (_id: string): string => {
    return jwt.sign({ _id }, SECRET, { expiresIn: '3d' })
}

const loginUser = async (req: Request, res: Response) => {
    const { emailOrUsername, password } = req.body;
    try {
        const user = await User.login(emailOrUsername, password);
        const email = user.email;
        const username = user.username;
        const isVerified = user.isVerified;
        const profilePictureUrl = user.profilePicture;
        if (user) {
            const token = createToken(user._id);
            res.status(200).json({ email, token, username, isVerified, profilePicture: profilePictureUrl });
        }
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }

}

const signUpUser = async (req: Request, res: Response) => {
    const { email, password, username } = req.body;
    const isAdmin = false;
    const bio = '';

    try {
        const user = await User.signup(email, password, isAdmin, bio, username);
        res.status(200).json(null);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }

}

const signUpAdmin = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const isAdmin = true;
    const bio = '';
    const username = '';

    try {
        const userAdmin = await User.signup(email, password, isAdmin, bio, username);
        res.status(200).json({ message: 'User admin registered successfully. Please check your email for verification.' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }

}

const verifyUser = async (req: Request, res: Response) => {
    const { token } = req.params;

    try {
        const user = await User.findOneAndUpdate(
            {
                verificationToken: token,
                verificationTokenExpiry: { $gt: new Date() },
            },
            { isVerified: true },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ error: 'Invalid/expired token or user is already verified' });
        }

        res.status(200).json({ message: 'Email verification successful.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const getProfile = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const userId = req.user?._id;
    const userProfile = await User.findOne({ _id: userId })

    try {
        if (userProfile) {
            res.json({ userProfile });
        } else {
            res.status(404).json({ error: 'User profile not found' });
        }
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

const updateProfile = async (req: IGetUserAuthInfoRequest, res: Response) => {
    const { bio, username } = req.body;
    const userId = req.user?._id;

    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(400).json({ error: 'Username is already in use' });
    }

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
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
}

const uploadProfilePicture = async (req: IGetUserAuthInfoRequest, res: Response) => {
    console.log('yes');

    const userId = req.user?._id;
    console.log(userId);
    const existingUser = await User.findOne({ _id: userId });
    if (!existingUser) {
        return res.status(400).json({ error: 'User does not exist' });
    }
    try {
        const encodedImage = req.body.profilePicture;
        const uploadedFile = await uploadImageToStorage(encodedImage);
        const profilePictureUrl = uploadedFile.publicUrl();
        existingUser.profilePicture = profilePictureUrl;
        await existingUser.save();
        return res.status(200).json({ user: existingUser })
    } catch (error) {
        return res.status(404).json({ error });
    }
};

const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
        const resetToken = generateVerificationToken();

        const resetTokenExpiry = new Date().getTime() + 60 * 60 * 1000;
        const user = await User.findOneAndUpdate(
            { email },
            {
                resetToken,
                resetTokenExpiry: new Date(resetTokenExpiry)
            },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        };

        resetPasswordEmail(email, resetToken);
        res.status(200).json({ message: 'Email with link sent' })
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: new Date() },
        });

        if (!user) {
            return res.status(404).json({ error: 'Invalid or expired reset token.' });
        }

        const isPasswordMatch = await comparePasswords(newPassword, user.password);

        if (isPasswordMatch) {
            return res.status(400).json({ error: 'New password can\'t be the same as the previous password.' });
        }

        const hashedPassword = await hashPassword(newPassword);

        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const signupWithGoogle = async (req: Request, res: Response) => {
    const { clientId, credential } = req.body;
    try {
        const userIsVerified = await verifyGoogleToken(credential, clientId);
        if (userIsVerified) {
            let user;
            const existingUser = await User.findOne({ email: userIsVerified.userEmail });

            if (existingUser) {
                existingUser.userId = userIsVerified.userId;
                await existingUser.save();
                const email = existingUser.email;
                const username = existingUser.username;
                const isVerified = existingUser.isVerified;
                const token = createToken(existingUser._id);
                res.status(200).json({ email, token, username, isVerified });
            } else {
                user = await User.signUpWithGoogleAuth(userIsVerified.userId, userIsVerified.userEmail!);
                res.status(200).json({ user });
            }
        }
    } catch (error: any) {
        console.error('google create user error', error);
        res.status(400).json({ error: error.message });
    }
}

const loginWithGoogle = async (req: Request, res: Response) => {
    const { clientId, credential } = req.body;

    try {
        const userIsVerified = await verifyGoogleToken(credential, clientId);
        if (userIsVerified) {
            const user = await User.loginWithGoogleAuth(userIsVerified.userId, userIsVerified.userEmail!);
            const email = user.email;
            const username = user.username;
            const isVerified = user.isVerified;
            if (user) {
                const token = createToken(user._id);
                res.status(200).json({ email, token, username, isVerified });
            }
        }
    } catch (error: any) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
}

export {
    loginUser,
    signUpUser,
    signUpAdmin,
    getProfile,
    updateProfile,
    verifyUser,
    forgotPassword,
    resetPassword,
    signupWithGoogle,
    loginWithGoogle,
    uploadProfilePicture
}