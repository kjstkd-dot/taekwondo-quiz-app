'use client';

import { useState } from 'react';
import RadarChart from './RadarChart';
import { DISCIPLINES } from '../lib/disciplines';

export default function MyResultsClient({ studentName, studentId, attempts }) {
  const [expandedId, setExpandedId] = useState(null);

  const best = { gyeorugi: null, pumsae: null, gyeokpa: null };
  for (const a of attempts) {
    if (!best[a.discipline] || a.percentage > best[a.discipline].percentage) best[a.discipline] = a;
  }

  return (
    <div>
      <RadarChart best={best} />

      <div className="section-label">
        {studentName} ({studentId}) 님의 응시 기록 · 총 {attempts.length}회
      </div>
      {attempts.length === 0 && <div className="activity">아직 응시 기록이 없어요. 퀴즈를 풀어보세요!</div>}
      {attempts.map((a) => {
        const disc = DISCIPLINES[a.discipline];
        const isOpen = expandedId === a.id;
        return (
          <div className="rvitem" key={a.id} style={{ marginBottom: 10 }}>
            <button
              type="button"
              onClick={() => setExpandedId(isOpen ? null : a.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                font: 'inherit',
                color: 'inherit',
              }}
            >
              <span>
                {disc ? disc.ko : a.discipline} · {new Date(a.created_at).toLocaleString('ko-KR')}
              </span>
              <b>
                {a.score}/{a.total} ({a.percentage}%)
              </b>
            </button>
            {isOpen && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(a.items || []).map((it, i) => {
                  const ok = it.myIdx === it.correctIdx;
                  return (
                    <div className="rvitem" key={i}>
                      <div className="rvq">
                        {i + 1}. {it.q}
                      </div>
                      <div className="rvans">
                        내 답:{' '}
                        <b className={ok ? 'ok' : 'no'}>
                          {it.myIdx !== null && it.myIdx !== undefined ? it.choices[it.myIdx] : '(미응답)'}
                        </b>
                        {!ok && (
                          <>
                            {' '}
                            · 정답: <b className="ok">{it.choices[it.correctIdx]}</b>
                          </>
                        )}
                        <br />
                        {it.note}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
