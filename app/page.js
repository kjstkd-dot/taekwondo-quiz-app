import Link from 'next/link';
import { cookies } from 'next/headers';
import { STUDENT_COOKIE_NAME, verifyStudentToken } from '../lib/studentAuth';
import { getSupabaseAdmin } from '../lib/supabaseAdmin';

const EXTERNAL_NOTES_URL = 'https://class-reflection-kjs.kjstkd.chatgpt.site/';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const token = cookies().get(STUDENT_COOKIE_NAME)?.value;
  const session = verifyStudentToken(token);
  let studentName = '';
  if (session) {
    try {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase.from('students').select('name').eq('student_id', session.studentId).maybeSingle();
      studentName = data?.name || '';
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div>
      <div className="hero hero-cover">
        <div className="content">
          <div className="eyebrow">2026 태권도경기규칙및심판법</div>
          <h1>
            겨루기 · 품새 · 격파
            <br />
            세 종목의 경기 규칙을 한 곳에서
          </h1>
          <p>
            {session
              ? `${studentName}님, 환영합니다. 경기 규칙 퀴즈로 점검하고, 매 수업 성찰노트를 남기고, 내 결과에서 점수 기록을 확인하세요.`
              : '학번으로 로그인하면 경기 규칙 퀴즈를 풀고 내 점수 기록을 확인할 수 있어요.'}
          </p>
          <div className="disc-legend">
            <span className="pill gyeorugi">겨루기</span>
            <span className="pill pumsae">품새</span>
            <span className="pill gyeokpa">격파</span>
          </div>
        </div>
      </div>

      <div className="section-label">바로가기</div>

      {!session && (
        <Link className="navcard" href="/login">
          <span className="badge" style={{ background: 'var(--accent)' }}>
            로
          </span>
          <span className="body">
            <span className="ttl">학생 로그인 / 시작하기</span>
            <span className="desc">학번과 비밀번호로 로그인하고 퀴즈를 시작하세요</span>
          </span>
          <span className="chev">›</span>
        </Link>
      )}

      <Link className="navcard" href="/quiz">
        <span
          className="badge"
          style={{ background: 'linear-gradient(135deg,var(--c-gyeorugi),var(--c-pumsae),var(--c-gyeokpa))' }}
        >
          규
        </span>
        <span className="body">
          <span className="ttl">경기 규칙 퀴즈</span>
          <span className="desc">겨루기·품새·격파 — 종목별 300문항 이상 은행에서 매번 새로운 20문제</span>
        </span>
        <span className="chev">›</span>
      </Link>
      <a className="navcard" href={EXTERNAL_NOTES_URL} target="_blank" rel="noopener noreferrer">
        <span className="badge" style={{ background: 'var(--gold-ink)' }}>
          노
        </span>
        <span className="body">
          <span className="ttl">강의 성찰노트</span>
          <span className="desc">주차별 소감을 정리하는 성찰노트 페이지로 이동 (새 창)</span>
        </span>
        <span className="chev">›</span>
      </a>
      <Link className="navcard" href="/my-results">
        <span className="badge" style={{ background: '#1F7A4D' }}>
          결
        </span>
        <span className="body">
          <span className="ttl">내 결과 확인</span>
          <span className="desc">로그인한 계정 기준 — 매 응시 기록과 오답을 확인해요</span>
        </span>
        <span className="chev">›</span>
      </Link>

      <div className="section-label" style={{ marginTop: 32 }}>
        교수자
      </div>
      <Link className="navcard" href="/admin">
        <span className="badge" style={{ background: '#4A4636' }}>
          🔒
        </span>
        <span className="body">
          <span className="ttl">관리자 로그인</span>
          <span className="desc">전체 학생 응시 현황을 시계열로 모니터링해요</span>
        </span>
        <span className="chev">›</span>
      </Link>
    </div>
  );
}
