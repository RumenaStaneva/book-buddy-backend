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

const sendVerificationEmail = async (email, verificationToken) => {
    const transporter = createTransporter();
    // const htmlTemplate = fs.readFileSync('./../email/templates/confirmation_email.html', 'utf8');
    // const templatePath = '../emailTemplates/confirmation_email.ejs'; // Path to the EJS template
    const templatePath = path.join(__dirname, '..', 'emailTemplates', 'confirmation_email.ejs');


    // Read the EJS template file
    const template = fs.readFileSync(templatePath, 'utf8');

    // Compile the EJS template with dynamic data
    const emailContent = ejs.render(template, {
        verificationUrl: `${process.env.VERIFICATION_URL}/${verificationToken}` // Pass dynamic data here
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Account Verification',
        html: emailContent //${process.env.VERIFICATION_URL}/${verificationToken}
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
