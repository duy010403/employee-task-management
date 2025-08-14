const express = require('express');
const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Auth routes (sẽ implement sau)
// router.use('/auth', require('./auth'));

// Employee routes (sẽ implement sau) 
// router.use('/employees', require('./employees'));

module.exports = router;