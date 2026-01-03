// server.js - Main server file

// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// ============================================
// MIDDLEWARE SETUP
// ============================================

// 1. CORS - Allows your React app (different port) to communicate with this server
// Without this, browser blocks requests from localhost:3000 to localhost:5000
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// 2. JSON Parser - Converts incoming JSON data to JavaScript objects
// When React sends { "companyName": "Google" }, this makes it usable
app.use(express.json());

// 3. URL Encoded - Parses URL-encoded data (form submissions)
app.use(express.urlencoded({ extended: true }));

// ============================================
// MONGODB CONNECTION
// ============================================

// Connect to MongoDB using connection string from .env file
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
  })
  .catch((error) => {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1); // Exit if database connection fails
  });

// ============================================
// TEST ROUTE
// ============================================

// Simple route to test if server is running
app.get('/', (req, res) => {
  res.json({ message: 'Job Tracker API is running!' });
});

// ============================================
// API ROUTES
// ============================================

// Import routes
const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/applications');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// Catch-all for undefined routes (404 errors)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler - catches all errors in the app
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Access at: http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please use a different port or stop the process using this port.`);
  } else if (err.code === 'EPERM') {
    console.error(`❌ Permission denied to use port ${PORT}. Try using a different port (like 3001) or run with appropriate permissions.`);
  } else {
    console.error(`❌ Server error:`, err.message);
  }
  process.exit(1);
});