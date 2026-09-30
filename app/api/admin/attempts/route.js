import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin';
import { ADMIN_COOKIE_NAME, verifyAdminToken } from '../../../../lib/adminAuth';

export async function GET() {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('attempts')
      .select('id, name, student_id, discipline, score, total, percentage, created_at')
      .order('created_at', { ascending: false })
      .limit(2000);

    if (error) {
      console.error('admin attempts select error', error);
      return NextResponse.json({ error: 'db_error' }, { status: 500 });
    }
    return NextResponse.json({ attempts: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
