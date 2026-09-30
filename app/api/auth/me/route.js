import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { STUDENT_COOKIE_NAME, verifyStudentToken } from '../../../../lib/studentAuth';
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function GET() {
  const token = cookies().get(STUDENT_COOKIE_NAME)?.value;
  const session = verifyStudentToken(token);
  if (!session) {
    return NextResponse.json({ loggedIn: false });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('students')
      .select('name')
      .eq('student_id', session.studentId)
      .maybeSingle();
    return NextResponse.json({ loggedIn: true, studentId: session.studentId, name: data?.name || '' });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ loggedIn: false });
  }
}
