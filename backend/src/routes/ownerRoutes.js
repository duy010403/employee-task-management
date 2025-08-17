// backend/src/routes/ownerRoutes.js
const express = require('express');
const router = express.Router();
const {
  createNewAccessCode,
  validateAccessCode,
  getEmployee,
  createEmployee,
  deleteEmployee
} = require('../controllers/ownerController');

// Owner authentication routes
router.post('/create-access-code', createNewAccessCode);
router.post('/validate-access-code', validateAccessCode);

// Employee management routes
router.post('/get-employee', getEmployee);
router.post('/create-employee', createEmployee);
router.post('/delete-employee', deleteEmployee);

module.exports = router;