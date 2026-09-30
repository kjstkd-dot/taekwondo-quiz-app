'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login'); // login | register
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function afterAuthSuccess() {
    router.push('/quiz');
    router.refresh();
  }

  async function submitLogin(e) {
    e.preventDefault();
    setError('');
    if (!studentId.trim() || !password) {
      setError('학번과 비밀번호를 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: studentId.trim(), password }),
      });
      if (!res.ok) {
        setError('학번 또는 비밀번호가 올바르지 않습니다.');
        return;
      }
      afterAuthSuccess();
    } catch {
      setError('로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  async function submitRegister(e) {
    e.preventDefault();
    setError('');
    if (!studentId.trim() || !name.trim()) {
      setError('학번과 이름을 입력해주세요.');
      return;
    }
    if (password.length < 4) {
      setError('비밀번호는 4자 이상으로 설정해주세요.');
      return;
    }
    if (password !== password2) {
      setError('비밀번호가 서로 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: studentId.trim(), name: name.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error === 'already_registered' ? '이미 등록된 학번입니다. 로그인해주세요.' : '등록에 실패했습니다.');
        return;
      }
      afterAuthSuccess();
    } catch {
      setError('등록에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="quiz-head" style={{ background: 'linear-gradient(135deg,var(--ink),var(--ink-2))' }}>
        <div className="eyebrow">TAEKWONDO RULES QUIZ</div>
        <h2 style={{ fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 800, fontSize: 22 }}>
          {mode === 'login' ? '학생 로그인' : '비밀번호 설정하기'}
        </h2>
        <div className="sub">{mode === 'login' ? '학번과 비밀번호로 로그인하세요.' : '학번, 이름, 비밀번호를 등록하면 바로 시작할 수 있어요.'}</div>
      </div>

      <form className="card" onSubmit={mode === 'login' ? submitLogin : submitRegister}>
        <div className="field">
          <label>학번</label>
          <input
            type="text"
            placeholder="예: 20261234"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            autoFocus
          />
        </div>
        {mode === 'register' && (
          <div className="field">
            <label>이름</label>
            <input type="text" placeholder="예: 홍길동" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        )}
        <div className="field">
          <label>비밀번호</label>
          <input
            type="password"
            placeholder={mode === 'register' ? '4자 이상' : '비밀번호'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {mode === 'register' && (
          <div className="field">
            <label>비밀번호 확인</label>
            <input
              type="password"
              placeholder="비밀번호 확인"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
            />
          </div>
        )}
        {error && <div style={{ color: 'var(--bad)', fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? '처리 중...' : mode === 'login' ? '로그인' : '등록하고 시작하기'}
        </button>
      </form>

      <button
        type="button"
        className="btn btn-ghost"
        style={{ width: '100%' }}
        onClick={() => {
          setMode((m) => (m === 'login' ? 'register' : 'login'));
          setError('');
        }}
      >
        {mode === 'login' ? '처음이신가요? 비밀번호 설정하기' : '이미 등록하셨나요? 로그인하기'}
      </button>
      <div className="small-note">
        비밀번호는 안전하게 암호화되어 저장되며, 다른 학생의 기록은 볼 수 없어요.
      </div>
    </div>
  );
}
