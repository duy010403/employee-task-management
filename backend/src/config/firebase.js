// src/config/firebase.js
require('dotenv').config();
const admin = require('firebase-admin');

// Sử dụng environment variables thay vì file JSON
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "49be12c2dc5c13df70251a49795de0cf92514c3a",
  private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : null,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID || "115284254074250768824",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL || `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`,
  universe_domain: "googleapis.com"
};

// Kiểm tra các env variables cần thiết
if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
  console.error('Missing required Firebase environment variables!');
  console.log('Required variables:');
  console.log('- FIREBASE_PROJECT_ID');
  console.log('- FIREBASE_PRIVATE_KEY');
  console.log('- FIREBASE_CLIENT_EMAIL');
  process.exit(1);
}

try {
  // Khởi tạo Firebase Admin SDK
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`
  });
  
  console.log('✅ Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
  process.exit(1);
}

// Export các services
const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };