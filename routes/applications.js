const express = require('express');
const router = express.Router();
const {
  createApplication,
  getApplications,
  getApplication,
  updateApplication,
  deleteApplication
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createApplication)
  .get(protect, getApplications);

router.route('/:id')
  .get(protect, getApplication)
  .put(protect, updateApplication)
  .delete(protect, deleteApplication);

module.exports = router;