// models/Application.js - Job Application Schema

const mongoose = require('mongoose');

// ============================================
// APPLICATION SCHEMA DEFINITION
// ============================================

const applicationSchema = new mongoose.Schema({
  // Reference to the user who owns this application
  // This links each job application to a specific user
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // References the User model
    required: true
  },

  // Company name
  companyName: {
    type: String,
    required: [true, 'Please provide company name'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },

  // Job position/title
  position: {
    type: String,
    required: [true, 'Please provide job position'],
    trim: true,
    maxlength: [100, 'Position cannot exceed 100 characters']
  },

  // Application status
  status: {
    type: String,
    enum: {
      values: ['Applied', 'Interview', 'Offer', 'Rejected', 'Accepted', 'Withdrawn'],
      message: '{VALUE} is not a valid status'
    },
    default: 'Applied'
  },

  // Job listing URL
  jobUrl: {
    type: String,
    trim: true,
    match: [
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
      'Please provide a valid URL'
    ]
  },

  // Location of the job
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },

  // Salary information (optional)
  salary: {
    type: String,
    trim: true
  },

  // Date when application was submitted
  appliedDate: {
    type: Date,
    default: Date.now
  },

  // Interview or follow-up deadline
  deadline: {
    type: Date
  },
  // Interview date and time
interviewDateTime: {
  type: Date
},

  // Additional notes about the application
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },

  // Contact person details (array of objects)
  contacts: [{
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      trim: true
    }
  }],

  // Timestamps (createdAt and updatedAt)
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// ============================================
// MIDDLEWARE: Update 'updatedAt' on Save
// ============================================

// Automatically update the 'updatedAt' field whenever document is modified
applicationSchema.pre('save', function() {
  this.updatedAt = Date.now();
  
});

// ============================================
// INDEXES for Better Query Performance
// ============================================

// Index on user field for faster queries when fetching user's applications
applicationSchema.index({ user: 1 });

// Compound index for searching by user and status
applicationSchema.index({ user: 1, status: 1 });

// Index on appliedDate for sorting
applicationSchema.index({ appliedDate: -1 });

// ============================================
// EXPORT MODEL
// ============================================

module.exports = mongoose.model('Application', applicationSchema);