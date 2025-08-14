import express from 'express';
import { db, FieldValue } from '../services/firebaseAdmin.js';
import { sendSMS } from '../services/smsService.js';

const router = express.Router();

const gen6 = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Helper: tìm user owner theo phone
 */
async function findOwnerByPhone(phoneNumber) {
  const snap = await db
    .collection('users')
    .where('role', '==', 'owner')
    .where('phone', '==', phoneNumber)
    .limit(1)
    .get();

  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

/**
 * POST /owner/create-access-code
 * body: { phoneNumber }
 * return: { code }  // theo yêu cầu đề bài (không khuyến nghị cho production)
 */
router.post('/create-access-code', async (req, res) => {
  try {
    const { phoneNumber } = req.body || {};
    if (!phoneNumber) return res.status(400).json({ error: 'phoneNumber required' });

    const user = await findOwnerByPhone(phoneNumber);
    if (!user) return res.status(404).json({ error: 'Owner phone not found in DB' });

    const now = Date.now();
    // Chống spam đơn giản: nếu vừa gửi < 60s thì chặn
    if (user.otpLastSentAt && now - user.otpLastSentAt < 60_000) {
      return res.status(429).json({ error: 'Please wait before requesting another code' });
    }

    const code = gen6();
    const expiresAt = now + 5 * 60_000; // 5 phút

    await db.collection('users').doc(user.id).update({
      otpCode: code,
      otpExpiresAt: expiresAt,
      otpLastSentAt: now,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Gửi SMS
    await sendSMS(phoneNumber, `Your access code: ${code}`);

    // Trả code theo yêu cầu bài (nhắc lại: production không nên trả về)
    return res.json({ code });
  } catch (e) {
    console.error('create-access-code error', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

/**
 * POST /owner/validate-access-code
 * body: { phoneNumber, accessCode }
 * return: { success: true, userId, role }
 * Other: set otpCode="" sau khi validate
 */
router.post('/validate-access-code', async (req, res) => {
  try {
    const { phoneNumber, accessCode } = req.body || {};
    if (!phoneNumber || !accessCode) {
      return res.status(400).json({ error: 'phoneNumber & accessCode required' });
    }

    const user = await findOwnerByPhone(phoneNumber);
    if (!user) return res.status(404).json({ error: 'Owner not found' });

    if (!user.otpCode || !user.otpExpiresAt) {
      return res.status(400).json({ error: 'No active code. Request a new one.' });
    }
    if (Date.now() > Number(user.otpExpiresAt)) {
      return res.status(400).json({ error: 'Code expired' });
    }
    if (String(accessCode) !== String(user.otpCode)) {
      return res.status(401).json({ error: 'Invalid code' });
    }

    await db.collection('users').doc(user.id).update({
      otpCode: '',
      otpExpiresAt: 0,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res.json({ success: true, userId: user.id, role: user.role || 'owner' });
  } catch (e) {
    console.error('validate-access-code error', e);
    return res.status(500).json({ error: 'internal_error' });
  }
});

/**
 * Các endpoint CRUD employee sẽ làm sau:
 * - POST /owner/create-employee
 * - POST /owner/delete-employee
 * - POST /owner/get-employee
 */
export default router;
