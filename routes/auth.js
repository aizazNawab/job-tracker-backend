const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP, register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { generateOTP, storeResetToken, verifyResetToken, deleteResetToken } = require('../utils/resetPassword');
const { sendPasswordResetOTP } = require('../utils/emailService');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Password Reset Routes

// Request password reset (send OTP)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
   const user = await User.findOne({ email }).select('+password');
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ 
        message: 'If an account exists with this email, you will receive a password reset code.' 
      });
    }

    // Generate OTP
    const otp = generateOTP();
    storeResetToken(email, otp);

    // Send OTP via email
    const emailResult = await sendPasswordResetOTP(email, otp);

    if (!emailResult.success) {
      return res.status(500).json({ 
        message: 'Failed to send reset code. Please try again.' 
      });
    }

    res.json({ 
      message: 'Password reset code sent to your email',
      expiresIn: '10 minutes'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP
router.post('/verify-reset-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const verification = verifyResetToken(email, otp);

    if (!verification.valid) {
      return res.status(400).json({ message: verification.message });
    }

    res.json({ 
      message: 'OTP verified successfully',
      verified: true 
    });
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password
// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    console.log('🔐 Reset password attempt for:', email);
    console.log('📧 OTP provided:', otp);
    console.log('🔑 New password length:', newPassword?.length);

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ 
        message: 'Email, OTP, and new password are required' 
      });
    }

    // Verify OTP
    const verification = verifyResetToken(email, otp);
    console.log('✅ OTP verification:', verification);
    
    if (!verification.valid) {
      return res.status(400).json({ message: verification.message });
    }

    // Find user and explicitly select password field
    const user = await User.findOne({ email }).select('+password');
    console.log('👤 User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('🔒 Old password hash:', user.password);

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Set new password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();
    
    console.log('💾 Password saved successfully');

    // Delete the reset token
    deleteResetToken(email);

    res.json({ 
      message: 'Password reset successfully',
      success: true 
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;