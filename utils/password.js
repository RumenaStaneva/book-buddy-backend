const crypto = require('crypto');
const bcrypt = require('bcrypt');

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

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt);

    return hash;
}

module.exports = { generateRandomPassword, hashPassword };
