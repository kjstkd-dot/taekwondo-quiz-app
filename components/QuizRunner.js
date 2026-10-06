'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TutorChat from './TutorChat';

export default function QuizRunner({ disciplineKey, disciplineKo, disciplineEn, bankSize, questions, studentId, studentName }) {
  const router = useRouter();
  const [stage, setStage] = useState('ready'); // ready | question | result
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState(() => new Array(questions.length).fill(null));
  const [locked, setLocked] = useState(false);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error

  function selectAnswer(choiceIdx) {
    if (locked) return;
    setLocked(true);
    setAnswers((prev) => {
      const next = prev.slice();
      next[idx] = choiceIdx;
      return next;
    });
  }

  function goNext() {
    if (idx === questions.length - 1) {
      finishQuiz();
    } else {
      setIdx((i) => i + 1);
      setLocked(false);
    }
  }

  async function finishQuiz() {
    setStage('result');
    setSaveState('saving');
    try {
      const items = questions.map((q, i) => ({
        q: q.q,
        choices: q.c,
        correctIdx: q.a,
        myIdx: answers[i],
        note: q.note,
      }));
      const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.a ? 1 : 0), 0);
      const percentage = Math.round((score / questions.length) * 100);
      const res = await fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discipline: disciplineKey,
          score,
          total: questions.length,
          percentage,
          items,
        }),
      });
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      setSaveState(res.ok ? 'saved' : 'error');
    } catch {
      setSaveState('error');
    }
  }

  const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.a ? 1 : 0), 0);
  const percentage = questions.length ? Math.round((score / questions.length) * 100) : 0;
  const pass = percentage >= 70;

  return (
    <div className={`disc-${disciplineKey}`}>
      {stage === 'ready' && (
        <>
          <div className="quiz-head">
            <div className="eyebrow">TAEKWONDO · {disciplineEn}</div>
            <h2>{disciplineKo} 경기 규칙 퀴즈</h2>
            <div className="sub">문제은행 {bankSize}문항 중 랜덤 20문항</div>
          </div>
          <div className="card">
            <div className="field">
              <label>응시자</label>
              <div style={{ fontSize: 16, fontWeight: 700 }}>
                {studentName} ({studentId})
              </div>
            </div>
            <button className="btn btn-primary" type="button" onClick={() => setStage('question')}>
              퀴즈 시작하기
            </button>
            <div className="small-note">총 20문항 · 객관식 · 제출 후 바로 채점 결과를 볼 수 있어요</div>
          </div>
        </>
      )}

      {stage === 'question' && (
        <QuestionView
          studentName={studentName}
          studentId={studentId}
          questions={questions}
          idx={idx}
          answers={answers}
          locked={locked}
          onSelect={selectAnswer}
          onNext={goNext}
        />
      )}

      {stage === 'result' && (
        <div>
          <div className="score-hero">
            <div className="score-num">
              {score}
              <span style={{ fontSize: 28, color: 'var(--text-mute)' }}>/{questions.length}</span>
            </div>
            <div className="score-label">
              {studentName} ({studentId}) 님의 점수 · 정답률 {percentage}%
            </div>
            <span className={`badge-pill ${pass ? 'pass' : 'fail'}`}>{pass ? '통과 (70% 이상)' : '재학습 권장'}</span>
          </div>

          <div className="card" style={{ marginTop: 22 }}>
            {saveState === 'saving' && <div className="small-note">결과를 저장하는 중...</div>}
            {saveState === 'saved' && (
              <div className="small-note">
                결과가 저장되었습니다. <b>내 결과</b> 탭에서 언제든 다시 확인할 수 있어요.
              </div>
            )}
            {saveState === 'error' && (
              <div style={{ color: 'var(--bad)', fontSize: 13, textAlign: 'center' }}>
                결과 저장에 실패했습니다. 네트워크 연결을 확인한 뒤 다시 풀어주세요.
              </div>
            )}
          </div>

          <div className="review">
            {questions.map((q, i) => {
              const my = answers[i];
              const ok = my === q.a;
              return (
                <div className="rvitem" key={i}>
                  <div className="rvq">
                    {i + 1}. {q.q}
                  </div>
                  <div className="rvans">
                    내 답:{' '}
                    <b className={ok ? 'ok' : 'no'}>{my !== null ? q.c[my] : '(미응답)'}</b>
                    {!ok && (
                      <>
                        {' '}
                        · 정답: <b className="ok">{q.c[q.a]}</b>
                      </>
                    )}
                    <br />
                    {q.note}
                  </div>
                  <TutorChat
                    discipline={disciplineKey}
                    question={q.q}
                    myAnswer={my !== null ? q.c[my] : ''}
                    isCorrect={ok}
                  />
                </div>
              );
            })}
          </div>

          <div className="actions">
            <button className="btn btn-ghost" onClick={() => router.refresh()}>
              다시 풀기
            </button>
            <Link className="btn btn-ghost" href="/quiz" style={{ textAlign: 'center' }}>
              다른 종목 풀기
            </Link>
            <Link className="btn btn-primary" href="/my-results" style={{ flex: '1 1 100%', textAlign: 'center' }}>
              내 결과 보기
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionView({ studentName, studentId, questions, idx, answers, locked, onSelect, onNext }) {
  const curQ = questions[idx];
  const pct = Math.round((idx / questions.length) * 100);
  const myAnswer = answers[idx];

  return (
    <div>
      <div className="meta-row">
        <span className="qcount">
          문항 {idx + 1} / {questions.length}
        </span>
        <span className="qcount">
          {studentName} ({studentId})
        </span>
      </div>
      <div className="progress">
        <div style={{ width: `${pct}%` }} />
      </div>
      <div className="card">
        <div className="qtext">{curQ.q}</div>
        <div>
          {curQ.c.map((choice, i) => {
            let cls = 'opt';
            if (locked) {
              if (i === curQ.a) cls += ' correct';
              if (i === myAnswer && myAnswer !== curQ.a) cls += ' wrong';
              if (i === myAnswer) cls += ' selected';
            }
            return (
              <button key={i} type="button" className={cls} disabled={locked} onClick={() => onSelect(i)}>
                <span className="dot">{String.fromCharCode(65 + i)}</span>
                <span>{choice}</span>
              </button>
            );
          })}
        </div>
        {locked && <div className="note">{curQ.note}</div>}
        <div className="footer-row">
          <button className="btn btn-primary" style={{ width: 'auto' }} disabled={!locked} onClick={onNext}>
            {idx === questions.length - 1 ? '제출하기' : '다음 문항'}
          </button>
        </div>
      </div>
    </div>
  );
}
