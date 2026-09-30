import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { DISCIPLINES } from '../../../lib/disciplines';
import { buildSessionQuestions } from '../../../lib/quiz';
import { STUDENT_COOKIE_NAME, verifyStudentToken } from '../../../lib/studentAuth';
import { getSupabaseAdmin } from '../../../lib/supabaseAdmin';
import QuizRunner from '../../../components/QuizRunner';

export const dynamic = 'force-dynamic';

export default async function QuizDisciplinePage({ params }) {
  const disc = DISCIPLINES[params.discipline];
  if (!disc) notFound();

  const token = cookies().get(STUDENT_COOKIE_NAME)?.value;
  const session = verifyStudentToken(token);
  if (!session) redirect('/login');

  let studentName = '';
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.from('students').select('name').eq('student_id', session.studentId).maybeSingle();
    studentName = data?.name || '';
  } catch (e) {
    console.error(e);
  }

  const questions = buildSessionQuestions(disc.bank, 20);
  const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return (
    <QuizRunner
      key={sessionId}
      disciplineKey={disc.key}
      disciplineKo={disc.ko}
      disciplineEn={disc.en}
      bankSize={disc.bank.length}
      questions={questions}
      studentId={session.studentId}
      studentName={studentName}
    />
  );
}
