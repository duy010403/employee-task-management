// backend/src/middleware/errorHandler.js
const errorHandler = (error, req, res, next) => {
  console.error('❌ Error:', error);

  // Firebase errors
  if (error.code && error.code.startsWith('permission-denied')) {
    return res.status(403).json({ 
      error: 'Permission denied', 
      message: 'You do not have permission to perform this action' 
    });
  }

  if (error.code && error.code.startsWith('not-found')) {
    return res.status(404).json({ 
      error: 'Not found', 
      message: 'The requested resource was not found' 
    });
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation Error', 
      message: error.message 
    });
  }

  // Default server error
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
};

module.exports = errorHandler;