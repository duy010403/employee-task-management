// src/config/email.js
require('dotenv').config();
const nodemailer = require('nodemailer');

// Sửa từ createTransporter thành createTransport
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Kiểm tra config email (optional)
const verifyEmailConfig = async () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('⚠️  Email configuration not complete. Email features will be disabled.');
    return false;
  }

  try {
    await transporter.verify();
    console.log('✅ Email transporter ready');
    return true;
  } catch (error) {
    console.log('⚠️  Email verification failed:', error.message);
    console.log('Email features will be disabled.');
    return false;
  }
};

// Verify khi khởi tạo (không bắt buộc)
verifyEmailConfig().catch(() => {
  // Ignore errors for now
});

module.exports = transporter;