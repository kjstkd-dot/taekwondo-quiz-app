export const dynamic = 'force-dynamic';

export default function ScoringPracticePage() {
  return (
    <div>
      <div className="hero" style={{ background: 'linear-gradient(135deg,#146C6C,#0F4C4C)' }}>
        <div className="eyebrow">JUDGE · SCORING PRACTICE</div>
        <h1 style={{ fontSize: 22 }}>심판 채점실습</h1>
        <p>실전 경기 영상을 보고 실제 심판처럼 채점을 연습하는 공간이에요.</p>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '48px 22px' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🚧</div>
        <h3 style={{ marginBottom: 8 }}>콘텐츠 준비 중입니다</h3>
        <p style={{ fontSize: 13.5, color: 'var(--text-mute)', lineHeight: 1.6, margin: 0 }}>
          곧 실전 채점 실습 콘텐츠가 이곳에 추가될 예정이에요. 조금만 기다려주세요!
        </p>
      </div>
    </div>
  );
}
