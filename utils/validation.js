// Password validation: at least 8 characters, must contain numbers, letters, and special characters
exports.validatePassword = (password) => {
  const minLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!minLength) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!hasNumber) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!hasLetter) {
    return { valid: false, message: 'Password must contain at least one letter' };
  }
  if (!hasSpecialChar) {
    return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*...)' };
  }

  return { valid: true };
};

// Email format validation
exports.validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please provide a valid email address' };
  }
  return { valid: true };
};

// Generate 6-digit OTP
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

