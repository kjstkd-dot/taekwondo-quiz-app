import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { STUDENT_COOKIE_NAME, verifyStudentToken } from '../../lib/studentAuth';
import { getSupabaseAdmin } from '../../lib/supabaseAdmin';
import MyResultsClient from '../../components/MyResultsClient';

export const dynamic = 'force-dynamic';

export default async function MyResultsPage() {
  const token = cookies().get(STUDENT_COOKIE_NAME)?.value;
  const session = verifyStudentToken(token);
  if (!session) redirect('/login');

  let studentName = '';
  let attempts = [];
  try {
    const supabase = getSupabaseAdmin();
    const { data: student } = await supabase
      .from('students')
      .select('name')
      .eq('student_id', session.studentId)
      .maybeSingle();
    studentName = student?.name || '';

    const { data, error } = await supabase
      .from('attempts')
      .select('id, discipline, score, total, percentage, items, created_at')
      .eq('student_id', session.studentId)
      .order('created_at', { ascending: false })
      .limit(200);
    if (!error) attempts = data || [];
  } catch (e) {
    console.error(e);
  }

  return <MyResultsClient studentName={studentName} studentId={session.studentId} attempts={attempts} />;
}
