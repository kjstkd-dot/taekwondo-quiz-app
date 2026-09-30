import crypto from 'crypto';

export const ADMIN_COOKIE_NAME = 'tkd_admin';

const MAX_AGE_MS = 1000 * 60 * 60 * 12; // 12시간
export const ADMIN_COOKIE_MAX_AGE_SEC = Math.floor(MAX_AGE_MS / 1000);

function sign(payload) {
  const secret = process.env.COOKIE_SECRET || 'dev-secret-change-me';
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export function createAdminToken() {
  const expires = Date.now() + MAX_AGE_MS;
  const payload = `admin:${expires}`;
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export function verifyAdminToken(token) {
  if (!token || typeof token !== 'string') return false;
  const idx = token.lastIndexOf('.');
  if (idx < 0) return false;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expectedSig = sign(payload);
  if (sig.length !== expectedSig.length) return false;
  const ok = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
  if (!ok) return false;
  const [tag, expiresStr] = payload.split(':');
  if (tag !== 'admin') return false;
  const expires = Number(expiresStr);
  if (!expires || Date.now() > expires) return false;
  return true;
}
