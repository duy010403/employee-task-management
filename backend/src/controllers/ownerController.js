// backend/src/controllers/ownerController.js
const Owner = require('../models/Owner');
const Employee = require('../models/Employee');
const { generateAccessCode, validatePhoneNumber } = require('../utils/generators');

const createNewAccessCode = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    if (!validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    const accessCode = generateAccessCode();

    // Find or create owner
    let owner = await Owner.findByPhone(phoneNumber);
    if (owner) {
      await owner.updateAccessCode(accessCode);
    } else {
      owner = await Owner.create(phoneNumber, accessCode);
    }

    console.log(`🔑 Access code generated for ${phoneNumber}: ${accessCode}`);

    res.json({ 
      success: true,
      accessCode,
      message: 'Access code generated successfully'
    });

  } catch (error) {
    console.error('❌ Error creating access code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const validateAccessCode = async (req, res) => {
  try {
    const { accessCode, phoneNumber } = req.body;

    if (!accessCode || !phoneNumber) {
      return res.status(400).json({ error: 'Access code and phone number are required' });
    }

    const owner = await Owner.findByPhone(phoneNumber);
    if (!owner) {
      return res.status(404).json({ error: 'Owner not found' });
    }

    if (owner.accessCode !== accessCode) {
      return res.status(401).json({ error: 'Invalid access code' });
    }

    // Clear access code after successful validation
    await owner.clearAccessCode();

    console.log(`✅ Access code validated for ${phoneNumber}`);

    res.json({ 
      success: true,
      message: 'Access code validated successfully'
    });

  } catch (error) {
    console.error('❌ Error validating access code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getEmployee = async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ error: 'Employee ID is required' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({
      success: true,
      employee: employee.toJSON()
    });

  } catch (error) {
    console.error('❌ Error getting employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createEmployee = async (req, res) => {
  try {
    const { name, email, department } = req.body;

    if (!name || !email || !department) {
      return res.status(400).json({ error: 'Name, email, and department are required' });
    }

    // Check if employee with this email already exists
    const existingEmployee = await Employee.findByEmail(email);
    if (existingEmployee) {
      return res.status(409).json({ error: 'Employee with this email already exists' });
    }

    const employee = await Employee.create(name, email, department);

    console.log(`👤 Employee created: ${employee.employeeId}`);

    res.status(201).json({
      success: true,
      employeeId: employee.employeeId,
      message: 'Employee created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ error: 'Employee ID is required' });
    }

    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    await Employee.delete(employeeId);

    console.log(`🗑️ Employee deleted: ${employeeId}`);

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createNewAccessCode,
  validateAccessCode,
  getEmployee,
  createEmployee,
  deleteEmployee
};