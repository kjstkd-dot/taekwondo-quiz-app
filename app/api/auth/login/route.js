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
  const password = String(body?.password || '');

  if (!studentId || !password) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: student, error } = await supabase
      .from('students')
      .select('student_id, name, password_hash')
      .eq('student_id', studentId)
      .maybeSingle();

    if (error || !student) {
      return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, student.password_hash);
    if (!ok) {
      return NextResponse.json({ error: 'invalid_credentials' }, { status: 401 });
    }

    const token = createStudentToken(studentId);
    const res = NextResponse.json({ ok: true, studentId, name: student.name });
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
