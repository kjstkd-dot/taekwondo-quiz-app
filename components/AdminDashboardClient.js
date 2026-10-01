'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DISCIPLINES, DISCIPLINE_KEYS } from '../lib/disciplines';

const COLORS = { gyeorugi: '#1E2761', pumsae: '#8B2E22', gyeokpa: '#1F6F4A' };

const LOG_COLUMNS = [
  {
    key: 'created_at',
    label: '시간',
    display: (a) => new Date(a.created_at).toLocaleString('ko-KR'),
    sortValue: (a) => new Date(a.created_at).getTime(),
  },
  { key: 'name', label: '이름', display: (a) => a.name, sortValue: (a) => a.name },
  { key: 'student_id', label: '학번', display: (a) => a.student_id, sortValue: (a) => a.student_id },
  {
    key: 'discipline',
    label: '종목',
    display: (a) => DISCIPLINES[a.discipline]?.ko || a.discipline,
    sortValue: (a) => DISCIPLINES[a.discipline]?.ko || a.discipline,
  },
  {
    key: 'percentage',
    label: '점수',
    display: (a) => `${a.score}/${a.total} (${a.percentage}%)`,
    sortValue: (a) => a.percentage,
  },
];

function ColumnFilterMenu({ column, options, selected, onApply, onSort, activeSort, onClose }) {
  const [search, setSearch] = useState('');
  const [temp, setTemp] = useState(selected || new Set(options));

  const visibleOptions = options.filter((o) => o.toLowerCase().includes(search.trim().toLowerCase()));
  const allVisibleChecked = visibleOptions.length > 0 && visibleOptions.every((o) => temp.has(o));

  function toggleValue(v) {
    const next = new Set(temp);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    setTemp(next);
  }

  function toggleAllVisible() {
    const next = new Set(temp);
    if (allVisibleChecked) {
      visibleOptions.forEach((o) => next.delete(o));
    } else {
      visibleOptions.forEach((o) => next.add(o));
    }
    setTemp(next);
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'transparent' }}
      />
      <div
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: 4,
          zIndex: 50,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          boxShadow: '0 12px 28px -12px rgba(0,0,0,.35)',
          width: 220,
          padding: 10,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ flex: 1, fontSize: 12, padding: '6px 8px', fontWeight: activeSort?.key === column.key && activeSort?.dir === 'asc' ? 800 : 500 }}
            onClick={() => {
              onSort('asc');
              onClose();
            }}
          >
            ▲ 오름차순
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ flex: 1, fontSize: 12, padding: '6px 8px', fontWeight: activeSort?.key === column.key && activeSort?.dir === 'desc' ? 800 : 500 }}
            onClick={() => {
              onSort('desc');
              onClose();
            }}
          >
            ▼ 내림차순
          </button>
        </div>

        <input
          type="text"
          placeholder="검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', marginBottom: 8, fontSize: 12, padding: '6px 8px' }}
        />

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 6, fontWeight: 700 }}>
          <input type="checkbox" checked={allVisibleChecked} onChange={toggleAllVisible} />
          전체 선택
        </label>

        <div style={{ maxHeight: 180, overflowY: 'auto', borderTop: '1px solid var(--border)', paddingTop: 6 }}>
          {visibleOptions.map((o) => (
            <label key={o} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '3px 0' }}>
              <input type="checkbox" checked={temp.has(o)} onChange={() => toggleValue(o)} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o}</span>
            </label>
          ))}
          {visibleOptions.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--text-mute)', padding: '4px 0' }}>일치하는 값이 없어요.</div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ flex: 1, fontSize: 12, padding: '6px 8px' }}
            onClick={() => {
              onApply(null);
              onClose();
            }}
          >
            초기화
          </button>
          <button
            type="button"
            className="btn"
            style={{ flex: 1, fontSize: 12, padding: '6px 8px' }}
            onClick={() => {
              onApply(temp.size === options.length ? null : temp);
              onClose();
            }}
          >
            적용
          </button>
        </div>
      </div>
    </>
  );
}

export default function AdminDashboardClient({ initialAttempts }) {
  const router = useRouter();
  const [attempts, setAttempts] = useState(initialAttempts || []);
  const [refreshing, setRefreshing] = useState(false);
  const [colFilters, setColFilters] = useState({});
  const [sort, setSort] = useState({ key: 'created_at', dir: 'desc' });
  const [openCol, setOpenCol] = useState(null);

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

  function rowsExcludingFilter(excludeKey) {
    return attempts.filter((a) =>
      LOG_COLUMNS.every((col) => {
        if (col.key === excludeKey) return true;
        const f = colFilters[col.key];
        if (!f) return true;
        return f.has(col.display(a));
      })
    );
  }

  const filtered = useMemo(() => {
    let rows = attempts.filter((a) =>
      LOG_COLUMNS.every((col) => {
        const f = colFilters[col.key];
        if (!f) return true;
        return f.has(col.display(a));
      })
    );
    if (sort.key) {
      const col = LOG_COLUMNS.find((c) => c.key === sort.key);
      rows = [...rows].sort((a, b) => {
        const av = col.sortValue(a);
        const bv = col.sortValue(b);
        if (typeof av === 'number' && typeof bv === 'number') {
          return sort.dir === 'asc' ? av - bv : bv - av;
        }
        return sort.dir === 'asc'
          ? String(av).localeCompare(String(bv), 'ko')
          : String(bv).localeCompare(String(av), 'ko');
      });
    }
    return rows;
  }, [attempts, colFilters, sort]);

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

      <div className="section-label">전체 응시 로그 ({filtered.length}건 / 전체 {attempts.length}건)</div>
      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                {LOG_COLUMNS.map((col) => {
                  const hasFilter = !!colFilters[col.key];
                  const isSorted = sort.key === col.key;
                  const options = Array.from(new Set(rowsExcludingFilter(col.key).map((a) => col.display(a))));
                  return (
                    <th key={col.key} style={{ padding: '6px 8px', position: 'relative' }}>
                      <button
                        type="button"
                        onClick={() => setOpenCol(openCol === col.key ? null : col.key)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          font: 'inherit',
                          fontWeight: 700,
                          color: hasFilter ? 'var(--accent)' : 'inherit',
                          cursor: 'pointer',
                        }}
                      >
                        {col.label}
                        {isSorted && <span style={{ fontSize: 10 }}>{sort.dir === 'asc' ? '▲' : '▼'}</span>}
                        <span style={{ fontSize: 10, opacity: hasFilter ? 1 : 0.4 }}>▾</span>
                      </button>
                      {openCol === col.key && (
                        <ColumnFilterMenu
                          column={col}
                          options={options}
                          selected={colFilters[col.key] || null}
                          activeSort={sort}
                          onSort={(dir) => setSort({ key: col.key, dir })}
                          onApply={(newSet) =>
                            setColFilters((prev) => {
                              const next = { ...prev };
                              if (newSet) next[col.key] = newSet;
                              else delete next[col.key];
                              return next;
                            })
                          }
                          onClose={() => setOpenCol(null)}
                        />
                      )}
                    </th>
                  );
                })}
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
        {filtered.length > 300 && (
          <div className="small-note" style={{ marginTop: 8 }}>
            최신 300건만 표시돼요 (필터로 범위를 좁혀보세요).
          </div>
        )}
      </div>
    </div>
  );
}
