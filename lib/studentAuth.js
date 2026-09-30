import crypto from 'crypto';

export const STUDENT_COOKIE_NAME = 'tkd_student';

const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30일
export const STUDENT_COOKIE_MAX_AGE_SEC = Math.floor(MAX_AGE_MS / 1000);

function sign(payload) {
  const secret = process.env.COOKIE_SECRET || 'dev-secret-change-me';
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export function createStudentToken(studentId) {
  const expires = Date.now() + MAX_AGE_MS;
  const payload = `student:${studentId}:${expires}`;
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export function verifyStudentToken(token) {
  if (!token || typeof token !== 'string') return null;
  const idx = token.lastIndexOf('.');
  if (idx < 0) return null;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expectedSig = sign(payload);
  if (sig.length !== expectedSig.length) return null;
  const ok = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
  if (!ok) return null;

  const parts = payload.split(':');
  if (parts.length !== 3 || parts[0] !== 'student') return null;
  const studentId = parts[1];
  const expires = Number(parts[2]);
  if (!expires || Date.now() > expires) return null;

  return { studentId };
}
