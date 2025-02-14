import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();

const sendEmail = async (email, subject, message) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        text: message,
    };

    await transporter.sendMail(mailOptions);
};

export default sendEmail;
