import crypto from 'crypto';
import bcrypt from 'bcrypt';
import validator from 'validator';


const generateRandomPassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?';

    const randomBytes = crypto.randomBytes(length);
    let password = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = randomBytes[i] % charset.length;
        password += charset.charAt(randomIndex);
    }

    return password;
};

const hashPassword = async (password: string) => {
    if (!validator.isStrongPassword(password)) {
        throw Error('Password not strong enough');
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt);

    return hash;
}

const comparePasswords = async (newPassword: string, storedHashedPassword: string) => {
    try {
        const isMatch = await bcrypt.compare(newPassword, storedHashedPassword);
        return isMatch;
    } catch (error) {
        console.error('Error comparing passwords:', error);
        return false;
    }
};

export { generateRandomPassword, hashPassword, comparePasswords };