import nodemailer from 'nodemailer';
import { MailtrapClient, MailtrapTransport } from 'mailtrap';
import dotenv from 'dotenv';

dotenv.config();

// Retrieve your Mailtrap credentials from environment variables
const mailtrapUser = process.env.MAILTRAP_USERNAME; 
const mailtrapPass = process.env.MAILTRAP_PASSWORD;

const TOKEN = process.env.MAILTRAP_TOKEN;
const ENDPOINT = process.env.MAILTRAP_ENDPOINT;

// Ensure your sender email is a Mailtrap-provided email
export const sender = '"Sprit & Spirits Liquors" <hello@demomailtrap.com>'; // Use your Mailtrap sender email

// Create a Nodemailer transport
const transport = nodemailer.createTransport({
    host: "live.smtp.mailtrap.io",
    port: 587,
    auth: {
        user: mailtrapUser,
        pass: mailtrapPass,
    },
});

// Send an email
export const sendEmail = async (to, subject, html) => {
    const mailOptions = {
        from: sender,
        to,
        subject,
        html,
    };

    try {
        const info = await transport.sendMail(mailOptions);
        console.log('Email sent:', info);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error(`Error sending email: ${error.message}`);
    }
};

//  ===================== Email Testing =====================
// const transport1 = nodemailer.createTransport(
//     MailtrapTransport({
//       token: TOKEN,
//       endpoint: ENDPOINT,
//     })
//   );

// const sender1 = {
//     address: "hello@demomailtrap.com",
//     name: "Mailtrap Test",
//   };
// const recipients1 = [
//     "kylasalardaa@gmail.com",
//   ];
  
// transport1
// .sendMail({
//       from: sender1,
//       to: recipients1,
//       subject: "You are awesome!",
//       text: "Congrats for sending test email with Mailtrap!",
//       category: "Integration Test",
// })
// .then(console.log, console.error);


