// backend/src/utils/generators.js
const generateAccessCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateEmployeeId = () => {
  return 'emp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

const validatePhoneNumber = (phoneNumber) => {
  // Basic phone validation - starts with + and contains 10-15 digits
  const phoneRegex = /^\+[1-9]\d{9,14}$/;
  return phoneRegex.test(phoneNumber);
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = {
  generateAccessCode,
  generateEmployeeId,
  validatePhoneNumber,
  validateEmail
};