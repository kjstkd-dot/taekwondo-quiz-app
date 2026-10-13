export const dynamic = 'force-dynamic';

export default function SurveyPage() {
  return (
    <div>
      <div className="hero" style={{ background: 'linear-gradient(135deg,#B8541D,#8A3D12)', color: '#fff' }}>
        <div className="eyebrow" style={{ color: 'rgba(255,255,255,.8)' }}>
          SURVEY
        </div>
        <h1 style={{ fontSize: 22, color: '#fff' }}>설문하기</h1>
        <p style={{ color: 'rgba(255,255,255,.9)' }}>수업과 앱에 대한 여러분의 의견을 들려주세요.</p>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '48px 22px' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🚧</div>
        <h3 style={{ marginBottom: 8 }}>설문 준비 중입니다</h3>
        <p style={{ fontSize: 13.5, color: 'var(--text-mute)', lineHeight: 1.6, margin: 0 }}>
          곧 설문이 열릴 예정이에요. 조금만 기다려주세요!
        </p>
      </div>
    </div>
  );
}
