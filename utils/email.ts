import nodemailer from 'nodemailer';
import fs from 'fs';
import ejs from 'ejs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

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

const sendVerificationEmail = async (email: string, verificationToken: string, username: string) => {
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

const resetPasswordEmail = async (email: string, resetToken: string) => {
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

export { sendVerificationEmail, generateVerificationToken, resetPasswordEmail };
