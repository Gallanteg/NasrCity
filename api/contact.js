const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again later.'
});

export default async (req, res) => {
    // Apply rate limiting
    limiter(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).send({ message: 'Only POST requests allowed' });
        }

        const { name, email, message, images } = req.body;

        // Validate request data
        if (!name || !email || !message || !images) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }

        // Validate images
        if (!Array.isArray(images) || images.some(img => !img.filename || !img.content || !img.contentType)) {
            return res.status(400).json({ success: false, message: 'Invalid images format' });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const attachments = images.map((image) => ({
            filename: image.filename,
            content: Buffer.from(image.content, 'base64'),
            contentType: image.contentType
        }));

        const mailOptions = {
            from: email,
            to: process.env.EMAIL_USER,
            subject: `Contact Form Submission from ${name}`,
            text: message,
            attachments: attachments
        };

        try {
            await transporter.sendMail(mailOptions);
            res.status(200).json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
        }
    });
};
