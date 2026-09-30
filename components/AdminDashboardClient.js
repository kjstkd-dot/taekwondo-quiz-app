'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DISCIPLINES, DISCIPLINE_KEYS } from '../lib/disciplines';

const COLORS = { gyeorugi: '#1E2761', pumsae: '#8B2E22', gyeokpa: '#1F6F4A' };

export default function AdminDashboardClient({ initialAttempts }) {
  const router = useRouter();
  const [attempts, setAttempts] = useState(initialAttempts || []);
  const [refreshing, setRefreshing] = useState(false);
  const [filterDiscipline, setFilterDiscipline] = useState('all');
  const [filterStudent, setFilterStudent] = useState('');

  async function refresh() {
    setRefreshing(true);
    try {
      const res = await fetch('/api/admin/attempts', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setAttempts(data.attempts || []);
      } else if (res.status === 401) {
        router.push('/admin');
      }
    } finally {
      setRefreshing(false);
    }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  }

  const filtered = useMemo(() => {
    const needle = filterStudent.trim().toLowerCase();
    return attempts.filter((a) => {
      if (filterDiscipline !== 'all' && a.discipline !== filterDiscipline) return false;
      if (needle && !`${a.name}${a.student_id}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [attempts, filterDiscipline, filterStudent]);

  const totalAttempts = attempts.length;
  const uniqueStudents = new Set(attempts.map((a) => a.student_id)).size;
  const avgPct = attempts.length ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length) : 0;

  const seriesData = useMemo(() => {
    const byDay = {};
    for (const a of attempts) {
      const day = new Date(a.created_at).toISOString().slice(0, 10);
      if (!byDay[day]) byDay[day] = {};
      const bucket = byDay[day];
      if (!bucket[a.discipline]) bucket[a.discipline] = { sum: 0, n: 0 };
      bucket[a.discipline].sum += a.percentage;
      bucket[a.discipline].n += 1;
    }
    return Object.keys(byDay)
      .sort()
      .map((day) => {
        const row = { date: day };
        for (const key of DISCIPLINE_KEYS) {
          const bucket = byDay[day][key];
          row[key] = bucket ? Math.round(bucket.sum / bucket.n) : null;
        }
        return row;
      });
  }, [attempts]);

  const students = useMemo(() => {
    const map = {};
    for (const a of attempts) {
      const sid = a.student_id;
      if (!map[sid]) {
        map[sid] = { name: a.name, sid, counts: { gyeorugi: 0, pumsae: 0, gyeokpa: 0 }, best: {} };
      }
      map[sid].counts[a.discipline] = (map[sid].counts[a.discipline] || 0) + 1;
      if (!(a.discipline in map[sid].best) || a.percentage > map[sid].best[a.discipline]) {
        map[sid].best[a.discipline] = a.percentage;
      }
    }
    return Object.values(map).sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  }, [attempts]);

  return (
    <div>
      <div className="hero" style={{ marginBottom: 20 }}>
        <div className="eyebrow">ADMIN DASHBOARD</div>
        <h1 style={{ fontSize: 20 }}>전체 응시 현황</h1>
        <p>
          총 {totalAttempts}회 응시 · 참여 학생 {uniqueStudents}명 · 평균 정답률 {avgPct}%
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button className="btn btn-ghost" onClick={refresh} disabled={refreshing}>
          {refreshing ? '새로고침 중...' : '새로고침'}
        </button>
        <button className="btn btn-ghost" onClick={logout}>
          로그아웃
        </button>
      </div>

      <div className="section-label">날짜별 평균 정답률 추이</div>
      <div className="card" style={{ height: 260 }}>
        {seriesData.length === 0 ? (
          <div className="small-note">아직 데이터가 없어요.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={seriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="gyeorugi" name="겨루기" stroke={COLORS.gyeorugi} connectNulls dot={{ r: 3 }} />
              <Line type="monotone" dataKey="pumsae" name="품새" stroke={COLORS.pumsae} connectNulls dot={{ r: 3 }} />
              <Line type="monotone" dataKey="gyeokpa" name="격파" stroke={COLORS.gyeokpa} connectNulls dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="section-label">학생별 요약 ({students.length}명)</div>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '6px 8px' }}>이름</th>
              <th style={{ padding: '6px 8px' }}>학번</th>
              <th style={{ padding: '6px 8px' }}>겨루기</th>
              <th style={{ padding: '6px 8px' }}>품새</th>
              <th style={{ padding: '6px 8px' }}>격파</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.sid} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '6px 8px' }}>{s.name}</td>
                <td style={{ padding: '6px 8px' }}>{s.sid}</td>
                {DISCIPLINE_KEYS.map((key) => (
                  <td key={key} style={{ padding: '6px 8px' }}>
                    {s.counts[key] ? `${s.counts[key]}회 · 최고 ${s.best[key]}%` : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-label">전체 응시 로그 (최신 300건)</div>
      <div className="card">
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <select value={filterDiscipline} onChange={(e) => setFilterDiscipline(e.target.value)} style={{ width: 'auto' }}>
            <option value="all">전체 종목</option>
            {DISCIPLINE_KEYS.map((key) => (
              <option key={key} value={key}>
                {DISCIPLINES[key].ko}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="이름/학번 검색"
            value={filterStudent}
            onChange={(e) => setFilterStudent(e.target.value)}
            style={{ width: 'auto', flex: 1, minWidth: 140 }}
          />
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '6px 8px' }}>시간</th>
                <th style={{ padding: '6px 8px' }}>이름</th>
                <th style={{ padding: '6px 8px' }}>학번</th>
                <th style={{ padding: '6px 8px' }}>종목</th>
                <th style={{ padding: '6px 8px' }}>점수</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 300).map((a) => (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}>
                    {new Date(a.created_at).toLocaleString('ko-KR')}
                  </td>
                  <td style={{ padding: '6px 8px' }}>{a.name}</td>
                  <td style={{ padding: '6px 8px' }}>{a.student_id}</td>
                  <td style={{ padding: '6px 8px' }}>{DISCIPLINES[a.discipline]?.ko || a.discipline}</td>
                  <td style={{ padding: '6px 8px' }}>
                    {a.score}/{a.total} ({a.percentage}%)
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '16px 8px', textAlign: 'center', color: 'var(--text-mute)' }}>
                    조건에 맞는 기록이 없어요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
