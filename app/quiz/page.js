import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { DISCIPLINES, DISCIPLINE_KEYS } from '../../lib/disciplines';
import { STUDENT_COOKIE_NAME, verifyStudentToken } from '../../lib/studentAuth';

export const dynamic = 'force-dynamic';

export default function QuizSelectPage() {
  const token = cookies().get(STUDENT_COOKIE_NAME)?.value;
  const session = verifyStudentToken(token);
  if (!session) redirect('/login');

  return (
    <div>
      <div className="section-label">종목 선택</div>
      {DISCIPLINE_KEYS.map((key) => {
        const d = DISCIPLINES[key];
        return (
          <Link key={key} href={`/quiz/${key}`} className={`navcard disc-${key}`}>
            <span className="badge" style={{ background: d.primary }}>
              {d.ko[0]}
            </span>
            <span className="body">
              <span className="ttl">{d.ko} 규칙</span>
              <span className="desc">문제은행 {d.bank.length}문항 중 랜덤 20문 · 객관식</span>
            </span>
            <span className="chev">›</span>
          </Link>
        );
      })}
      <div className="small-note" style={{ textAlign: 'left', marginTop: 16 }}>
        풀 때마다, 다시 풀 때마다 문제와 보기 순서가 새롭게 섞여서 출제됩니다.
      </div>
    </div>
  );
}
