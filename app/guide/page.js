const STEPS = [
  {
    img: '/guide/01-home.jpg',
    title: '① 홈 화면',
    desc: '하단 탭(홈·퀴즈·성찰노트·내 결과)으로 모든 기능을 오갈 수 있어요. "학생 로그인 / 시작하기"를 눌러 시작하세요.',
  },
  {
    img: '/guide/02-login.jpg',
    title: '② 학생 로그인',
    desc: '처음이라면 학번·이름·비밀번호를 입력해 회원가입하고, 이후에는 같은 학번·비밀번호로 로그인해요.',
  },
  {
    img: '/guide/03-quiz-select.jpg',
    title: '③ 종목 선택',
    desc: '겨루기·품새·격파 중 풀고 싶은 종목을 선택해요. 각 종목은 300문항 이상의 문제은행을 갖고 있어요.',
  },
  {
    img: '/guide/04-quiz-question.jpg',
    title: '④ 퀴즈 풀이',
    desc: '매번 20문제가 무작위로 출제되고, 보기 순서도 매번 새롭게 섞여요. 정답을 고르면 바로 다음 문제로 넘어가요.',
  },
  {
    img: '/guide/05-result.jpg',
    title: '⑤ 결과 확인',
    desc: '점수와 정답률을 바로 확인하고, 틀린 문제는 정답과 해설까지 함께 볼 수 있어요.',
  },
  {
    img: '/guide/06-my-results.jpg',
    title: '⑥ 내 결과',
    desc: '종목별 방사형 그래프로 내 실력을 한눈에 보고, 지금까지의 모든 응시 기록을 다시 확인할 수 있어요.',
  },
];

function GuideImage({ src, alt }) {
  return (
    <div
      style={{
        background: 'var(--surface-2)',
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 12,
        border: '1px solid var(--border)',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} style={{ display: 'block', width: '100%', height: 'auto' }} />
    </div>
  );
}

export default function GuidePage() {
  return (
    <div>
      <div className="hero" style={{ marginBottom: 20 }}>
        <div className="eyebrow">사용 안내</div>
        <h1 style={{ fontSize: 20 }}>화면으로 보는 사용법</h1>
        <p>처음 사용하시나요? 아래 순서대로 따라 하면 바로 시작할 수 있어요.</p>
      </div>

      {STEPS.map((step) => (
        <div key={step.img} className="card">
          <GuideImage src={step.img} alt={step.title} />
          <h3 style={{ fontSize: 15, marginBottom: 6 }}>{step.title}</h3>
          <p style={{ fontSize: 13.5, color: 'var(--text-mute)', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
        </div>
      ))}
    </div>
  );
}
