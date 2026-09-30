import { NextResponse } from 'next/server';
import { createAdminToken, ADMIN_COOKIE_NAME, ADMIN_COOKIE_MAX_AGE_SEC } from '../../../../lib/adminAuth';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { password } = body || {};
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return NextResponse.json({ error: 'admin_not_configured' }, { status: 500 });
  }
  if (typeof password !== 'string' || password !== expected) {
    return NextResponse.json({ error: 'invalid_password' }, { status: 401 });
  }

  const token = createAdminToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_COOKIE_MAX_AGE_SEC,
  });
  return res;
}
