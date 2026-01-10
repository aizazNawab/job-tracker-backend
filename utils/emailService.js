// emailService.js
const { Resend } = require('resend');

// Initialize Resend client
let resend;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

const sendOTPEmail = async (email, otp) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      return {
        success: false,
        error: 'Email service not configured. Please set RESEND_API_KEY in .env'
      };
    }

    if (!resend) {
      resend = new Resend(process.env.RESEND_API_KEY);
    }

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

const sendDeadlineReminder = async (userEmail, userName, application) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      return { success: false, error: 'Email service not configured' };
    }

    if (!resend) {
      resend = new Resend(process.env.RESEND_API_KEY);
    }

    const fromEmail = process.env.RESEND_FROM || 'noreply@arbimotion.com';
    const daysUntilDeadline = Math.ceil(
      (new Date(application.deadline) - new Date()) / (1000 * 60 * 60 * 24)
    );

    const response = await resend.emails.send({
      from: fromEmail,
      to: userEmail,
      subject: `Reminder: ${application.companyName} Application Deadline Approaching`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Application Deadline Reminder</h2>
          <p>Hi ${userName},</p>
          <p>This is a reminder that your application deadline is approaching:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">Application Details</h3>
            <p><strong>Company:</strong> ${application.companyName}</p>
            <p><strong>Position:</strong> ${application.position}</p>
            <p><strong>Status:</strong> ${application.status}</p>
            <p><strong>Deadline:</strong> ${new Date(application.deadline).toLocaleDateString()}</p>
            <p><strong>Days Remaining:</strong> ${daysUntilDeadline} day${daysUntilDeadline !== 1 ? 's' : ''}</p>
          </div>

          ${application.notes ? `<p><strong>Notes:</strong> ${application.notes}</p>` : ''}
          
          <p>Don't forget to follow up!</p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This is an automated reminder from Job Application Tracker
          </p>
        </div>
      `
    });

    if (response.error) {
      console.error('❌ Resend API error:', response.error);
      return { success: false, error: response.error.message };
    }

    console.log('✅ Deadline reminder sent to:', userEmail);
    return { success: true, messageId: response.data?.id };
  } catch (error) {
    console.error('Failed to send deadline reminder:', error.message);
    return { success: false, error: error.message };
  }
};

const sendInterviewReminder = async (userEmail, userName, application) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      return { success: false, error: 'Email service not configured' };
    }

    if (!resend) {
      resend = new Resend(process.env.RESEND_API_KEY);
    }

    const fromEmail = process.env.RESEND_FROM || 'noreply@arbimotion.com';
    const interviewTime = new Date(application.interviewDateTime).toLocaleString();

    const response = await resend.emails.send({
      from: fromEmail,
      to: userEmail,
      subject: `🎯 Interview Reminder: ${application.companyName} in 10 minutes!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Interview Reminder</h2>
          <p>Hi ${userName},</p>
          <p><strong>Your interview is starting in 10 minutes!</strong></p>
          
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="margin-top: 0; color: #1f2937;">Interview Details</h3>
            <p><strong>Company:</strong> ${application.companyName}</p>
            <p><strong>Position:</strong> ${application.position}</p>
            <p><strong>Time:</strong> ${interviewTime}</p>
            ${application.location ? `<p><strong>Location:</strong> ${application.location}</p>` : ''}
            ${application.jobUrl ? `<p><strong>Job Link:</strong> <a href="${application.jobUrl}">${application.jobUrl}</a></p>` : ''}
          </div>

          ${application.notes ? `<p><strong>Your Notes:</strong><br>${application.notes}</p>` : ''}
          
          <p style="margin-top: 30px;">Good luck with your interview! 🚀</p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            This is an automated reminder from Job Application Tracker
          </p>
        </div>
      `
    });

    if (response.error) {
      console.error('❌ Resend API error:', response.error);
      return { success: false, error: response.error.message };
    }

    console.log('✅ Interview reminder sent to:', userEmail);
    return { success: true, messageId: response.data?.id };
  } catch (error) {
    console.error('Failed to send interview reminder:', error.message);
    return { success: false, error: error.message };
  }
};

const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('Email service not configured');
      return { success: false, error: 'Email service not configured' };
    }

    if (!resend) {
      resend = new Resend(process.env.RESEND_API_KEY);
    }

    const fromEmail = process.env.RESEND_FROM || 'noreply@arbimotion.com';

    const response = await resend.emails.send({
      from: fromEmail,
      to: userEmail,
      subject: 'Welcome to Job Application Tracker!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to Job Application Tracker!</h2>
          <p>Hi ${userName},</p>
          <p>Thank you for registering. We're here to help you organize your job search efficiently.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Getting Started</h3>
            <ul>
              <li>Add your job applications and track their status</li>
              <li>Set interview times and receive email reminders</li>
              <li>Keep notes and contact information organized</li>
              <li>View statistics about your job search</li>
            </ul>
          </div>
          
          <p>Good luck with your job search!</p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Best regards,<br>
            Job Application Tracker Team
          </p>
        </div>
      `
    });

    if (response.error) {
      console.error('Error sending welcome email:', response.error);
      return { success: false, error: response.error.message };
    }

    console.log('✅ Welcome email sent to:', userEmail);
    return { success: true, messageId: response.data?.id };
  } catch (error) {
    console.error('Error sending welcome email:', error.message);
    return { success: false, error: error.message };
  }
};
const sendPasswordResetOTP = async (email, otp) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      return {
        success: false,
        error: 'Email service not configured. Please set RESEND_API_KEY in .env'
      };
    }

    if (!resend) {
      resend = new Resend(process.env.RESEND_API_KEY);
    }

    const fromEmail = process.env.RESEND_FROM || 'noreply@arbimotion.com';

    const response = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Reset Your Password - Job Application Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Password Reset Request</h2>
          <p>We received a request to reset your password.</p>
          <p>Your password reset code is:</p>
          <div style="background-color: #F3F4F6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #4F46E5; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p><strong>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</strong></p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
          <p style="color: #6B7280; font-size: 12px;">Job Application Tracker</p>
        </div>
      `
    });

    console.log('✅ Password reset email sent to:', email);
    console.log('📧 Resend response:', JSON.stringify(response, null, 2));

    if (response.error) {
      console.error('❌ Resend API error:', response.error);
      return { success: false, error: response.error.message || 'Email sending failed' };
    }

    return { success: true, messageId: response.data?.id };
  } catch (error) {
    console.error('Failed to send password reset email:', error.message || error);
    return { success: false, error: error.message || 'Email sending failed' };
  }
};
module.exports = {
  sendOTPEmail,
  sendDeadlineReminder,
  sendInterviewReminder,
  sendWelcomeEmail,
  sendPasswordResetOTP
};