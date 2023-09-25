const nodemailer = require('nodemailer');
const fs = require('fs');
const ejs = require('ejs');
const path = require('path');

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

const sendVerificationEmail = async (email, verificationToken, username) => {
    const transporter = createTransporter();
    const templatePath = path.join(__dirname, '..', 'emailTemplates', 'confirmation_email.ejs');

    const template = fs.readFileSync(templatePath, 'utf8');

    const emailContent = ejs.render(template, {
        verificationUrl: `${process.env.VERIFICATION_URL}/${verificationToken}`,
        username: username
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Account Verification',
        html: emailContent
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

const resetPasswordEmail = async (email, resetToken) => {
    const transporter = createTransporter();
    const templatePath = path.join(__dirname, '..', 'emailTemplates', 'reset_password_email.ejs');

    const template = fs.readFileSync(templatePath, 'utf8');

    const emailContent = ejs.render(template, {
        resetUrl: `${process.env.RESET_PASSWORD_URL}/${resetToken}`
    });
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Password Reset',
        html: emailContent,
    };

    await transporter.sendMail(mailOptions);
}

module.exports = {
    sendVerificationEmail,
    generateVerificationToken,
    resetPasswordEmail
};
