// backend/src/controllers/employeeController.js
const Employee = require('../models/Employee');
const { generateAccessCode, validateEmail } = require('../utils/generators');
const { sendEmail } = require('../config/email');

const loginEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Find employee by email
    const employee = await Employee.findByEmail(email);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const accessCode = generateAccessCode();

    // Update employee access code
    await employee.updateAccessCode(accessCode);

    // Send email with access code
    const emailSubject = 'Your Login Access Code';
    const emailText = `Hello ${employee.name},\n\nYour login access code is: ${accessCode}\n\nThis code will expire after use.\n\nBest regards,\nYour HR Team`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; text-align: center; margin-bottom: 30px;">Login Access Code</h2>
          <p style="color: #666; font-size: 16px;">Hello <strong>${employee.name}</strong>,</p>
          <p style="color: #666; font-size: 16px;">Your login access code is:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 36px; font-weight: bold; color: #4CAF50; background-color: #f8f8f8; padding: 15px 30px; border-radius: 8px; border: 2px dashed #4CAF50;">${accessCode}</span>
          </div>
          <p style="color: #666; font-size: 14px; text-align: center;">This code will expire after use.</p>
          <hr style="border: none; height: 1px; background-color: #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">Best regards,<br>Your HR Team</p>
        </div>
      </div>
    `;

    await sendEmail(email, emailSubject, emailText, emailHtml);

    console.log(`📧 Access code sent to employee: ${email}`);

    res.json({
      success: true,
      accessCode, // For development/testing purposes
      message: 'Access code sent to your email successfully'
    });

  } catch (error) {
    console.error('❌ Error sending login email:', error);
    
    // Check if it's an email sending error
    if (error.message.includes('Email')) {
      return res.status(503).json({ 
        error: 'Email service unavailable', 
        message: 'Unable to send access code. Please try again later.' 
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

const validateAccessCode = async (req, res) => {
  try {
    const { accessCode, email } = req.body;

    if (!accessCode || !email) {
      return res.status(400).json({ error: 'Access code and email are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Find employee by email
    const employee = await Employee.findByEmail(email);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    if (employee.accessCode !== accessCode) {
      return res.status(401).json({ error: 'Invalid access code' });
    }

    // Clear access code after successful validation
    await employee.clearAccessCode();

    console.log(`✅ Employee access code validated: ${email}`);

    res.json({
      success: true,
      employee: employee.toJSON(),
      message: 'Access code validated successfully'
    });

  } catch (error) {
    console.error('❌ Error validating employee access code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  loginEmail,
  validateAccessCode
};