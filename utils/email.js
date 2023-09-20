const nodemailer = require('nodemailer');
require('dotenv').config();

const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'Gmail',
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.GOOGLE_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    });
}

const sendVerificationEmail = async (email, verificationToken) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Account Verification',
        text: `Please click on the following link to verify your account: ${process.env.VERIFICATION_URL}/${verificationToken}`,
    };

    await transporter.sendMail(mailOptions);
}

const generateVerificationToken = (length = 32) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        token += charset[randomIndex];
    }

    return token;
}

module.exports = {
    sendVerificationEmail,
    generateVerificationToken,
};
