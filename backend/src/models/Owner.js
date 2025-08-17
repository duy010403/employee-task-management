// backend/src/models/Owner.js
const { db } = require('../config/firebase');

class Owner {
  constructor(data) {
    this.phoneNumber = data.phoneNumber;
    this.accessCode = data.accessCode || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static async findByPhone(phoneNumber) {
    try {
      const doc = await db.collection('owners').doc(phoneNumber).get();
      return doc.exists ? new Owner({ phoneNumber, ...doc.data() }) : null;
    } catch (error) {
      throw new Error(`Error finding owner: ${error.message}`);
    }
  }

  static async create(phoneNumber, accessCode) {
    try {
      const ownerData = {
        accessCode,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('owners').doc(phoneNumber).set(ownerData);
      return new Owner({ phoneNumber, ...ownerData });
    } catch (error) {
      throw new Error(`Error creating owner: ${error.message}`);
    }
  }

  async updateAccessCode(accessCode) {
    try {
      await db.collection('owners').doc(this.phoneNumber).update({
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
}

module.exports = Owner;