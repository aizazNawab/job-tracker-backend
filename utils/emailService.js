// emailService.js
const { Resend } = require('resend'); // CommonJS import

// Initialize Resend client
let resend;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

exports.sendOTPEmail = async (email, otp) => {
  try {
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      return {
        success: false,
        error: 'Email service not configured. Please set RESEND_API_KEY in .env'
      };
    }

    // Initialize Resend if not already initialized
    if (!resend) {
      resend = new Resend(process.env.RESEND_API_KEY);
    }

    // Resend email configuration
    // Option 1: Use onboarding@resend.dev (works without domain verification - for testing)
    // Option 2: Use your verified domain (for production - e.g., noreply@yourdomain.com)
   
const fromEmail = process.env.RESEND_FROM || 'noreply@arbimotion.com';

    const response = await resend.emails.send({
      from: fromEmail,
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
    });

    console.log('✅ Email sent successfully to:', email);
    console.log('📧 Resend response:', JSON.stringify(response, null, 2));

    // Check if response has error
    if (response.error) {
      console.error('❌ Resend API error:', response.error);
      return { success: false, error: response.error.message || 'Email sending failed' };
    }

    return { success: true, messageId: response.data?.id };
  } catch (error) {
    console.error('Failed to send email:', error.message || error);
    return { success: false, error: error.message || 'Email sending failed' };
  }
};

