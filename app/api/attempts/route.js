import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin';
import { DISCIPLINE_KEYS } from '../../../lib/disciplines';
import { STUDENT_COOKIE_NAME, verifyStudentToken } from '../../../lib/studentAuth';

export async function POST(request) {
  const token = cookies().get(STUDENT_COOKIE_NAME)?.value;
  const session = verifyStudentToken(token);
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { discipline, score, total, percentage, items } = body || {};

  if (
    !DISCIPLINE_KEYS.includes(discipline) ||
    typeof score !== 'number' ||
    typeof total !== 'number' ||
    typeof percentage !== 'number' ||
    !Array.isArray(items)
  ) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const safeItems = items.slice(0, 30).map((it) => ({
    q: String(it?.q || '').slice(0, 500),
    choices: Array.isArray(it?.choices) ? it.choices.slice(0, 4).map((c) => String(c).slice(0, 300)) : [],
    correctIdx: Number.isInteger(it?.correctIdx) ? it.correctIdx : 0,
    myIdx: it?.myIdx === null || it?.myIdx === undefined ? null : Number(it.myIdx),
    note: String(it?.note || '').slice(0, 800),
  }));

  try {
    const supabase = getSupabaseAdmin();
    const { data: student } = await supabase
      .from('students')
      .select('name')
      .eq('student_id', session.studentId)
      .maybeSingle();

    const { error } = await supabase.from('attempts').insert({
      name: student?.name || '',
      student_id: session.studentId,
      discipline,
      score,
      total,
      percentage,
      items: safeItems,
    });

    if (error) {
      console.error('attempts insert error', error);
      return NextResponse.json({ error: 'db_error' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
