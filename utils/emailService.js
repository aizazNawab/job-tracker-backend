const nodemailer = require('nodemailer');

// Create transporter
// For production, use real SMTP credentials
// For development, you can use Gmail or other services
const createTransporter = () => {
  // If SMTP credentials are not configured, return null
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  // If using Gmail, you need to:
  // 1. Enable "Less secure app access" or use App Password
  // 2. Or use OAuth2

  // For now, using a simple SMTP setup
  // You'll need to configure these in .env file
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

exports.sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();

    // If transporter is not configured, return error
    if (!transporter) {
      return {
        success: false,
        error: 'Email service not configured. Please set SMTP_USER and SMTP_PASS in .env file'
      };
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Verify Your Email - Job Application Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Email Verification</h2>
          <p>Thank you for registering with Job Application Tracker!</p>
          <p>Your verification code is:</p>
          <div style="background-color: #F3F4F6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #4F46E5; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
          <p style="color: #6B7280; font-size: 12px;">Job Application Tracker</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

