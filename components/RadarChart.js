'use client';

const ORDER = ['gyeorugi', 'pumsae', 'gyeokpa'];
const LABELS = { gyeorugi: '겨루기', pumsae: '품새', gyeokpa: '격파' };
const ANGLES = [-90, 30, 150];
const CX = 150;
const CY = 150;
const R = 110;
const RING_FRACS = [0.25, 0.5, 0.75, 1.0];

function pt(angleDeg, fracR) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + R * fracR * Math.cos(rad), y: CY + R * fracR * Math.sin(rad) };
}

function fmt(p) {
  return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
}

export default function RadarChart({ best }) {
  const ringPolys = RING_FRACS.map((f) => ORDER.map((_, i) => fmt(pt(ANGLES[i], f))).join(' '));
  const dataPts = ORDER.map((k, i) => {
    const pct = best[k] ? best[k].percentage : 0;
    return pt(ANGLES[i], Math.max(pct, 0) / 100);
  });
  const dataPoly = dataPts.map(fmt).join(' ');
  const labelPts = ORDER.map((_, i) => pt(ANGLES[i], 1.22));

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg viewBox="0 0 300 300" style={{ width: '100%', maxWidth: 320, height: 'auto' }}>
        {ringPolys.map((poly, i) => (
          <polygon key={i} points={poly} className="radar-grid" />
        ))}
        {ORDER.map((k, i) => {
          const p = pt(ANGLES[i], 1);
          return <line key={k} x1={CX} y1={CY} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} className="radar-axis" />;
        })}
        <polygon points={dataPoly} className="radar-data" />
        {dataPts.map((p, i) => (
          <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={4} className="radar-dot" />
        ))}
        {ORDER.map((k, i) => {
          const p = labelPts[i];
          const anchor = Math.abs(p.x - CX) < 5 ? 'middle' : p.x > CX ? 'start' : 'end';
          return (
            <text
              key={k}
              x={p.x.toFixed(1)}
              y={p.y.toFixed(1)}
              textAnchor={anchor}
              dominantBaseline="middle"
              className={`radar-label ${k}`}
            >
              {LABELS[k]}
            </text>
          );
        })}
      </svg>
      <div className="score-legend">
        {ORDER.map((k) => (
          <div key={k} className="legend-row">
            <span className={`legend-dot ${k}`}></span>
            <span className="legend-name">{LABELS[k]}</span>
            <span className="legend-value">
              {best[k] ? `${best[k].score}/${best[k].total} (${best[k].percentage}%)` : '아직 응시 전'}
            </span>
          </div>
        ))}
      </div>
      <div className="small-note">최고 점수 기준 · 서버에 저장되어 어떤 기기에서 조회해도 동일하게 보여요</div>
    </div>
  );
}
