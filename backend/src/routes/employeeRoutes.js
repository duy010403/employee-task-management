// backend/src/routes/employeeRoutes.js
const express = require('express');
const router = express.Router();
const {
  loginEmail,
  validateAccessCode
} = require('../controllers/employeeController');

// Employee authentication routes
router.post('/login-email', loginEmail);
router.post('/validate-access-code', validateAccessCode);

module.exports = router;