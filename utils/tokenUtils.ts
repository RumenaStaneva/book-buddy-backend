import User from '../models/userModel';

async function cleanExpiredVerificationTokens() {
    try {
        await User.updateMany(
            { verificationTokenExpiry: { $lt: new Date() } },
            { $unset: { verificationToken: null, verificationTokenExpiry: null } }
        );
        console.log('Expired email verification tokens cleaned up.');
    } catch (error) {
        console.error('Error cleaning up expired email verification tokens:', error);
    }
}

async function cleanExpiredResetTokens() {
    try {
        await User.updateMany(
            { resetTokenExpiry: { $lt: new Date() } },
            { $set: { resetToken: null, resetTokenExpiry: null } }
        );
        console.log('Expired reset tokens cleaned up.');
    } catch (error) {
        console.error('Error cleaning up expired reset tokens:', error);
    }
}

export { cleanExpiredVerificationTokens, cleanExpiredResetTokens };
