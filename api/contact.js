require('dotenv').config();
const nodemailer = require('nodemailer');

// CORS middleware
const corsMiddleware = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Update this to your specific origin if needed
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return true;
    }
    return false;
};

export default async (req, res) => {
    if (corsMiddleware(req, res)) return; // Handle CORS preflight

    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).send({ message: 'Only POST requests allowed' });
    }

    const { name, email, message, images } = req.body;

    console.log('Received request data:', { name, email, message, images });

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

    const attachments = images.map(image => ({
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
        console.log('Email sent successfully.');
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
    }
};
