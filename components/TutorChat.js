'use client';

import { useState } from 'react';

const MAX_FOLLOWUPS = 3;

const ERROR_TEXT = {
  not_configured: 'AI 튜터가 아직 준비되지 않았어요. 교수님께 문의해주세요.',
  rate_limited: '질문을 너무 많이 했어요. 잠시 후 다시 시도해주세요.',
  unauthorized: '로그인이 필요해요.',
};

export default function TutorChat({ discipline, question, myAnswer, isCorrect }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const followups = messages.filter((m) => m.role === 'user').length - 1;

  async function send(nextMessages) {
    setMessages(nextMessages);
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discipline, question, myAnswer, messages: nextMessages }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(ERROR_TEXT[data.error] || 'AI 튜터 응답에 실패했어요. 잠시 후 다시 시도해주세요.');
        return;
      }
      setMessages([...nextMessages, { role: 'assistant', content: data.reply }]);
    } catch {
      setError('네트워크 오류가 발생했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  function start() {
    setOpen(true);
    if (messages.length) return;
    const first = isCorrect
      ? '이 문제의 핵심 개념을 한 번 더 쉽게 정리해주세요.'
      : `이 문제를 틀렸어요. 제가 고른 답이 왜 틀렸고 정답은 왜 맞는지 쉽게 설명해주세요.`;
    send([{ role: 'user', content: first }]);
  }

  function submit(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading || followups >= MAX_FOLLOWUPS) return;
    setInput('');
    send([...messages, { role: 'user', content: text }]);
  }

  if (!open) {
    return (
      <button
        type="button"
        className="btn btn-ghost"
        onClick={start}
        style={{ marginTop: 8, padding: '6px 12px', fontSize: 12.5 }}
      >
        {isCorrect ? 'AI 튜터에게 더 물어보기' : 'AI 튜터에게 왜 틀렸는지 묻기'}
      </button>
    );
  }

  return (
    <div
      style={{
        marginTop: 10,
        border: '1px solid var(--border)',
        borderRadius: 12,
        background: 'var(--surface)',
        padding: 12,
        fontSize: 13,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8 }}>AI 튜터</div>

      {messages.map((m, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: 8,
          }}
        >
          <div
            style={{
              maxWidth: '88%',
              padding: '8px 10px',
              borderRadius: 10,
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
              background: m.role === 'user' ? 'var(--accent)' : 'var(--surface-2)',
              color: m.role === 'user' ? '#fff' : 'var(--text)',
            }}
          >
            {m.content}
          </div>
        </div>
      ))}

      {loading && <div style={{ color: 'var(--text-mute)', marginBottom: 8 }}>튜터가 답을 쓰는 중...</div>}
      {error && <div style={{ color: 'var(--bad)', marginBottom: 8 }}>{error}</div>}

      {!loading && messages.length > 0 && followups < MAX_FOLLOWUPS && (
        <form onSubmit={submit} style={{ display: 'flex', gap: 6 }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={300}
            placeholder="더 궁금한 점을 물어보세요"
            style={{ flex: 1, padding: '8px 10px', fontSize: 13 }}
          />
          <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }}>
            보내기
          </button>
        </form>
      )}
      {followups >= MAX_FOLLOWUPS && (
        <div style={{ color: 'var(--text-mute)' }}>이 문제에 대한 추가 질문은 여기까지예요.</div>
      )}

      <div style={{ color: 'var(--text-mute)', fontSize: 11.5, marginTop: 8 }}>
        AI 설명은 참고용이에요. 정확한 내용은 경기규칙 원문으로 꼭 확인하세요.
      </div>
    </div>
  );
}
