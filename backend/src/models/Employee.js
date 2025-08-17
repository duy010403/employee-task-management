// backend/src/models/Employee.js
const { db } = require('../config/firebase');
const { generateEmployeeId } = require('../utils/generators');

class Employee {
  constructor(data) {
    this.employeeId = data.employeeId;
    this.name = data.name;
    this.email = data.email;
    this.department = data.department;
    this.accessCode = data.accessCode || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static async findById(employeeId) {
    try {
      const doc = await db.collection('employees').doc(employeeId).get();
      return doc.exists ? new Employee({ employeeId, ...doc.data() }) : null;
    } catch (error) {
      throw new Error(`Error finding employee: ${error.message}`);
    }
  }

  static async findByEmail(email) {
    try {
      const snapshot = await db.collection('employees').where('email', '==', email).get();
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      return new Employee({ employeeId: doc.id, ...doc.data() });
    } catch (error) {
      throw new Error(`Error finding employee by email: ${error.message}`);
    }
  }

  static async create(name, email, department) {
    try {
      const employeeId = generateEmployeeId();
      const employeeData = {
        name,
        email,
        department,
        accessCode: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('employees').doc(employeeId).set(employeeData);
      return new Employee({ employeeId, ...employeeData });
    } catch (error) {
      throw new Error(`Error creating employee: ${error.message}`);
    }
  }

  static async delete(employeeId) {
    try {
      await db.collection('employees').doc(employeeId).delete();
      return { success: true };
    } catch (error) {
      throw new Error(`Error deleting employee: ${error.message}`);
    }
  }

  async updateAccessCode(accessCode) {
    try {
      await db.collection('employees').doc(this.employeeId).update({
        accessCode,
        updatedAt: new Date()
      });
      this.accessCode = accessCode;
      this.updatedAt = new Date();
    } catch (error) {
      throw new Error(`Error updating access code: ${error.message}`);
    }
  }

  async clearAccessCode() {
    await this.updateAccessCode('');
  }

  toJSON() {
    return {
      employeeId: this.employeeId,
      name: this.name,
      email: this.email,
      department: this.department,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Employee;