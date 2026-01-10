// resetPassword.js
const crypto = require('crypto');

// Store reset tokens in memory (for production, use Redis or database)
const resetTokens = new Map();

// Generate OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Store reset token
const storeResetToken = (email, otp) => {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  resetTokens.set(email, { otp, expiresAt });
  
  // Auto-cleanup after expiration
  setTimeout(() => {
    resetTokens.delete(email);
  }, 10 * 60 * 1000);
  
  return otp;
};

// Verify reset token
const verifyResetToken = (email, otp) => {
  const stored = resetTokens.get(email);
  
  if (!stored) {
    return { valid: false, message: 'OTP not found or expired' };
  }
  
  if (Date.now() > stored.expiresAt) {
    resetTokens.delete(email);
    return { valid: false, message: 'OTP has expired' };
  }
  
  if (stored.otp !== otp) {
    return { valid: false, message: 'Invalid OTP' };
  }
  
  return { valid: true };
};

// Delete reset token after successful password reset
const deleteResetToken = (email) => {
  resetTokens.delete(email);
};

module.exports = {
  generateOTP,
  storeResetToken,
  verifyResetToken,
  deleteResetToken
};