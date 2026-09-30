import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin';
import { createStudentToken, STUDENT_COOKIE_NAME, STUDENT_COOKIE_MAX_AGE_SEC } from '../../../../lib/studentAuth';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const studentId = String(body?.studentId || '').trim().slice(0, 40);
  const name = String(body?.name || '').trim().slice(0, 60);
  const password = String(body?.password || '');

  if (!studentId || !name || password.length < 4) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: existing } = await supabase
      .from('students')
      .select('student_id')
      .eq('student_id', studentId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'already_registered' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { error } = await supabase.from('students').insert({
      student_id: studentId,
      name,
      password_hash: passwordHash,
    });

    if (error) {
      console.error('register insert error', error);
      return NextResponse.json({ error: 'db_error' }, { status: 500 });
    }

    const token = createStudentToken(studentId);
    const res = NextResponse.json({ ok: true, studentId, name });
    res.cookies.set(STUDENT_COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: STUDENT_COOKIE_MAX_AGE_SEC,
    });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
