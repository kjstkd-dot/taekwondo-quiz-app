'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError('비밀번호가 올바르지 않습니다.');
        return;
      }
      router.push('/admin/dashboard');
    } catch {
      setError('로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="section-label">관리자 로그인</div>
      <form className="card" onSubmit={submit}>
        <div className="field">
          <label>관리자 비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? '확인 중...' : '로그인'}
        </button>
        {error && <div style={{ color: 'var(--bad)', fontSize: 13, marginTop: 10 }}>{error}</div>}
      </form>
    </div>
  );
}
