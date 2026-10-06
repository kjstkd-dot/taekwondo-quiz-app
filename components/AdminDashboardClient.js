'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const MENU_WIDTH = 220;
const MENU_HEIGHT = 340;

function ColumnFilterMenu({ column, options, selected, onApply, onSort, activeSort, onClose, anchor }) {
  const [search, setSearch] = useState('');
  const [temp, setTemp] = useState(selected || new Set(options));

  const menuRef = useRef(null);

  useEffect(() => {
    function onScroll(e) {
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      onClose();
    }
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onClose);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onClose);
    };
  }, [onClose]);

  const left = Math.max(8, Math.min(anchor.left, window.innerWidth - MENU_WIDTH - 8));
  const top = Math.max(8, Math.min(anchor.bottom + 4, window.innerHeight - MENU_HEIGHT - 8));

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
        ref={menuRef}
        style={{
          position: 'fixed',
          top,
          left,
          zIndex: 50,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          boxShadow: '0 12px 28px -12px rgba(0,0,0,.35)',
          width: MENU_WIDTH,
          maxHeight: MENU_HEIGHT,
          overflowY: 'auto',
          boxSizing: 'border-box',
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

function formatShort(date) {
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getMonth() + 1}/${date.getDate()} ${p(date.getHours())}:${p(date.getMinutes())}`;
}

function StudentTrendModal({ student, attempts, onClose }) {
  const mine = useMemo(
    () =>
      attempts
        .filter((a) => a.student_id === student.sid)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
    [attempts, student.sid]
  );

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const data = mine.map((a, i) => ({
    n: i,
    label: formatShort(new Date(a.created_at)),
    [a.discipline]: a.percentage,
  }));

  const stats = DISCIPLINE_KEYS.map((key) => {
    const list = mine.filter((a) => a.discipline === key);
    return {
      key,
      count: list.length,
      best: list.length ? Math.max(...list.map((a) => a.percentage)) : null,
      avg: list.length ? Math.round(list.reduce((s, a) => s + a.percentage, 0) / list.length) : null,
      latest: list.length ? list[list.length - 1].percentage : null,
    };
  });

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        role="dialog"
        aria-label={`${student.name} 응시 추이`}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          color: 'var(--text)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 560,
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 20,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{student.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-mute)' }}>
              학번 {student.sid} · 총 {mine.length}회 응시
            </div>
          </div>
          <button type="button" className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 13 }} onClick={onClose}>
            닫기
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
          {stats.map((s) => (
            <div
              key={s.key}
              style={{
                border: '1px solid var(--border)',
                borderTop: `3px solid ${COLORS[s.key]}`,
                borderRadius: 10,
                padding: '8px 10px',
                fontSize: 12,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{DISCIPLINES[s.key].ko}</div>
              {s.count ? (
                <div style={{ color: 'var(--text-mute)', lineHeight: 1.6 }}>
                  {s.count}회 응시
                  <br />
                  최고 {s.best}% · 평균 {s.avg}%
                  <br />
                  최근 {s.latest}%
                </div>
              ) : (
                <div style={{ color: 'var(--text-mute)' }}>응시 전</div>
              )}
            </div>
          ))}
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-mute)', marginBottom: 6 }}>
          응시 순서별 정답률 추이
        </div>
        <div style={{ height: 240, marginBottom: 16 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="n"
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
                tickFormatter={(n) => data[n]?.label || ''}
              />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip labelFormatter={(n) => data[n]?.label || ''} formatter={(v) => `${v}%`} />
              <Legend />
              {DISCIPLINE_KEYS.map((key) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={DISCIPLINES[key].ko}
                  stroke={COLORS[key]}
                  connectNulls
                  dot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-mute)', marginBottom: 6 }}>응시 기록</div>
        <div>
          {[...mine].reverse().map((a) => (
            <div
              key={a.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 8,
                padding: '7px 0',
                borderBottom: '1px solid var(--border)',
                fontSize: 13,
              }}
            >
              <span>
                <span style={{ color: COLORS[a.discipline], fontWeight: 700 }}>
                  {DISCIPLINES[a.discipline]?.ko || a.discipline}
                </span>{' '}
                · {new Date(a.created_at).toLocaleString('ko-KR')}
              </span>
              <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                {a.score}/{a.total} ({a.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const STUDENT_COLUMNS = [
  { key: 'name', label: '이름', display: (s) => s.name, sortValue: (s) => s.name },
  { key: 'sid', label: '학번', display: (s) => s.sid, sortValue: (s) => s.sid },
  ...DISCIPLINE_KEYS.map((d) => ({
    key: d,
    label: DISCIPLINES[d].ko,
    display: (s) => (s.counts[d] ? `${s.counts[d]}회 · 최고 ${s.best[d]}%` : '-'),
    sortValue: (s) => (s.counts[d] ? s.best[d] : -1),
  })),
];

function useColumnTable(rows, columns, initialSort) {
  const [colFilters, setColFilters] = useState({});
  const [sort, setSort] = useState(initialSort);

  const visible = useMemo(() => {
    let out = rows.filter((r) =>
      columns.every((c) => {
        const f = colFilters[c.key];
        return !f || f.has(c.display(r));
      })
    );
    if (sort.key) {
      const col = columns.find((c) => c.key === sort.key);
      const dir = sort.dir === 'asc' ? 1 : -1;
      out = [...out].sort((a, b) => {
        const av = col.sortValue(a);
        const bv = col.sortValue(b);
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
        return String(av).localeCompare(String(bv), 'ko', { numeric: true }) * dir;
      });
    }
    return out;
  }, [rows, columns, colFilters, sort]);

  return { rows, columns, colFilters, setColFilters, sort, setSort, visible };
}

function ColumnHeaderRow({ table }) {
  const { rows, columns, colFilters, setColFilters, sort, setSort } = table;
  const [openCol, setOpenCol] = useState(null);
  const [openAnchor, setOpenAnchor] = useState(null);
  const closeMenu = useCallback(() => setOpenCol(null), []);

  function optionsFor(excludeKey) {
    const base = rows.filter((r) =>
      columns.every((c) => {
        if (c.key === excludeKey) return true;
        const f = colFilters[c.key];
        return !f || f.has(c.display(r));
      })
    );
    const col = columns.find((c) => c.key === excludeKey);
    return Array.from(new Set(base.map((r) => col.display(r))));
  }

  return (
    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
      {columns.map((col) => {
        const hasFilter = !!colFilters[col.key];
        const isSorted = sort.key === col.key;
        return (
          <th key={col.key} style={{ padding: '6px 8px', position: 'relative' }}>
            <button
              type="button"
              onClick={(e) => {
                if (openCol === col.key) {
                  setOpenCol(null);
                  return;
                }
                setOpenAnchor(e.currentTarget.getBoundingClientRect());
                setOpenCol(col.key);
              }}
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
            {openCol === col.key && openAnchor && (
              <ColumnFilterMenu
                anchor={openAnchor}
                column={col}
                options={optionsFor(col.key)}
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
                onClose={closeMenu}
              />
            )}
          </th>
        );
      })}
    </tr>
  );
}

export default function AdminDashboardClient({ initialAttempts }) {
  const router = useRouter();
  const [attempts, setAttempts] = useState(initialAttempts || []);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSid, setSelectedSid] = useState(null);

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
    return Object.values(map);
  }, [attempts]);

  const logTable = useColumnTable(attempts, LOG_COLUMNS, { key: 'created_at', dir: 'desc' });
  const studentTable = useColumnTable(students, STUDENT_COLUMNS, { key: 'name', dir: 'asc' });
  const filtered = logTable.visible;

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

      <div className="section-label">
        학생별 요약 ({studentTable.visible.length}명 / 전체 {students.length}명)
      </div>
      <div className="small-note" style={{ textAlign: 'left', margin: '0 0 8px' }}>
        학생 행을 누르면 그 학생의 응시 추이를 볼 수 있어요.
      </div>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <ColumnHeaderRow table={studentTable} />
          </thead>
          <tbody>
            {studentTable.visible.map((s) => (
              <tr
                key={s.sid}
                onClick={() => setSelectedSid(s.sid)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setSelectedSid(s.sid);
                }}
                tabIndex={0}
                title="클릭하면 응시 추이를 볼 수 있어요"
                style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
              >
                <td style={{ padding: '6px 8px', fontWeight: 600 }}>{s.name}</td>
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
              <ColumnHeaderRow table={logTable} />
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

      {selectedSid && students.find((s) => s.sid === selectedSid) && (
        <StudentTrendModal
          student={students.find((s) => s.sid === selectedSid)}
          attempts={attempts}
          onClose={() => setSelectedSid(null)}
        />
      )}
    </div>
  );
}
