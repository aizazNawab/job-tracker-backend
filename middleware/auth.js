// middleware/auth.js - JWT Authentication Middleware

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ============================================
// PROTECT MIDDLEWARE
// ============================================

// This middleware protects routes by verifying JWT tokens
// It runs BEFORE the route handler to check if user is authenticated

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if authorization header exists and starts with 'Bearer'
    // Format: "Authorization: Bearer <token>"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Extract token from header
      // "Bearer abc123xyz" -> ["Bearer", "abc123xyz"]
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token found, user is not authenticated
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please login.'
      });
    }

    try {
      // Verify token using JWT_SECRET
      // If token is valid, it returns the decoded payload (user ID)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID from token payload
      // Attach user to request object so route handlers can access it
      req.user = await User.findById(decoded.id);

      // Check if user still exists (in case user was deleted after token was issued)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists'
        });
      }

      // User is authenticated, proceed to next middleware/route handler
      next();

    } catch (error) {
      // Token is invalid or expired
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please login again.'
      });
    }

  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication',
      error: error.message
    });
  }
};

// ============================================
// HOW THIS WORKS:
// ============================================

/*
Flow of Protected Route:

1. Client sends request with token in header:
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

2. This middleware intercepts the request

3. Extracts and verifies token

4. If valid: Attaches user to req.user and calls next()

5. Route handler can now access req.user

Example usage in routes:
router.get('/protected-route', protect, (req, res) => {
  // req.user is available here!
  console.log(req.user.id);
  console.log(req.user.email);
});
*/