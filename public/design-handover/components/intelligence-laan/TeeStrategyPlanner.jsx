import React from 'react';
import { sgFromLength } from '../scorecards/sg-reference';

/**
 * TeeStrategyPlanner — «SG Tee App Predict»-arket som komponent.
 * 18 hull: banelengde inn, planlagt slaglengde fra tee per strategi.
 * Per hull og strategi beregnes (ekte Excel-formler):
 *   Rest        = banelengde − tee-slag
 *   Pred. score = SG(fairway, rest) + 1   (slaglengde 0 → ingen tee-slag)
 *   Baseline    = SG(tee, banelengde)
 *   SG +/-      = baseline − pred. score  (positivt = strategien slår baseline)
 */

const S = {
  label: {
    fontFamily: 'var(--font-data)', fontSize: 'var(--text-label)', fontWeight: 'var(--weight-semibold)',
    letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--text-muted)',
  },
  data: { fontFamily: 'var(--font-data)', fontSize: 'var(--text-sm)', color: 'var(--text-strong)' },
};

const num = (x) => {
  if (x === '' || x == null) return null;
  const n = parseFloat(String(x).replace(',', '.'));
  return isNaN(n) ? null : n;
};
const fmt = (v, d = 2) => (v == null ? '—' : v.toFixed(d).replace('.', ','));

function holeCalc(lengde, slag) {
  const L = num(lengde), T = num(slag);
  if (L == null) return {};
  const baseline = sgFromLength(L, 'tee');
  if (T == null) return { baseline };
  const rest = L - T;
  const sgEtter = sgFromLength(Math.max(0, rest), 'fw');
  const score = T === 0 ? sgEtter : sgEtter + 1;
  return { baseline, rest, score, diff: baseline != null && score != null ? baseline - score : null };
}

function Cell({ children, head, right, style = {} }) {
  const base = {
    padding: '5px 10px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
    textAlign: right ? 'right' : 'left',
    ...(head ? { ...S.label, borderBottom: '2px solid var(--text-strong)' } : S.data),
    ...style,
  };
  return head ? <th style={base}>{children}</th> : <td style={base}>{children}</td>;
}

function NumInput({ value, onChange, width = 62 }) {
  return (
    <input
      type="text" inputMode="decimal" value={value ?? ''} onChange={(e) => onChange(e.target.value)}
      style={{
        width, minHeight: 28, padding: '0 8px', boxSizing: 'border-box', textAlign: 'center',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-input)',
        background: 'color-mix(in oklab, var(--brand) 8%, var(--surface))',
        fontFamily: 'var(--font-data)', fontSize: 'var(--text-sm)', color: 'var(--text-strong)', outline: 'none',
      }}
    />
  );
}

function SgBadge({ value }) {
  const pos = value != null && value > 0.005;
  const neg = value != null && value < -0.005;
  return (
    <span style={{
      display: 'inline-block', minWidth: 44, textAlign: 'center', padding: '2px 7px',
      borderRadius: 'var(--radius-pill)',
      background: pos ? 'color-mix(in oklab, var(--positive) 14%, var(--surface))'
        : neg ? 'color-mix(in oklab, var(--negative) 12%, var(--surface))' : 'var(--elevated)',
      color: pos ? 'var(--positive)' : neg ? 'var(--negative)' : 'var(--text-muted)',
      fontFamily: 'var(--font-data)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)',
    }}>{value == null ? '—' : (value > 0 ? '+' : '') + fmt(value)}</span>
  );
}

export function TeeStrategyPlanner({
  holes = 18,
  strategyLabels = ['TEE alt 1', 'TEE alt 2'],
  values: valuesProp,
  onChange,
  title = 'Tee-strategi',
  style = {},
  ...rest
}) {
  const [internal, setInternal] = React.useState({});
  const vals = valuesProp || internal;
  const set = (i, key, v) => {
    const next = { ...vals, [i]: { ...(vals[i] || {}), [key]: v } };
    if (onChange) onChange(next); else setInternal(next);
  };

  const rows = Array.from({ length: holes }, (_, i) => {
    const h = vals[i] || {};
    return { i, lengde: h.lengde, a: holeCalc(h.lengde, h.alt1), b: holeCalc(h.lengde, h.alt2) };
  });
  const sum = (pick) => {
    const nums = rows.map(pick).filter((n) => n != null);
    return nums.length ? nums.reduce((a, b) => a + b, 0) : null;
  };
  const totals = {
    baseline: sum((r) => r.a.baseline),
    scoreA: sum((r) => r.a.score), diffA: sum((r) => r.a.diff),
    scoreB: sum((r) => r.b.score), diffB: sum((r) => r.b.diff),
  };

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-sm)', overflow: 'hidden', ...style,
    }} {...rest}>
      <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={S.label}>SG Tee Predict</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-lg)', color: 'var(--text-strong)' }}>{title}</span>
        </div>
        <span style={{ ...S.data, color: 'var(--text-muted)' }}>SG +/- mot PGA-baseline fra tee</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <Cell head>Hull</Cell>
              <Cell head>Lengde (m)</Cell>
              <Cell head right>Baseline</Cell>
              <Cell head>{strategyLabels[0]} (m)</Cell>
              <Cell head right>Pred. score</Cell>
              <Cell head right>SG +/-</Cell>
              <Cell head style={{ borderLeft: '1px solid var(--border)' }}>{strategyLabels[1]} (m)</Cell>
              <Cell head right>Pred. score</Cell>
              <Cell head right>SG +/-</Cell>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ i, a, b }) => (
              <tr key={i}>
                <Cell style={{ color: 'var(--text-muted)' }}>{i + 1}</Cell>
                <Cell><NumInput value={(vals[i] || {}).lengde} onChange={(v) => set(i, 'lengde', v)} /></Cell>
                <Cell right>{fmt(a.baseline)}</Cell>
                <Cell><NumInput value={(vals[i] || {}).alt1} onChange={(v) => set(i, 'alt1', v)} /></Cell>
                <Cell right>{fmt(a.score)}</Cell>
                <Cell right><SgBadge value={a.diff} /></Cell>
                <Cell style={{ borderLeft: '1px solid var(--border)' }}><NumInput value={(vals[i] || {}).alt2} onChange={(v) => set(i, 'alt2', v)} /></Cell>
                <Cell right>{fmt(b.score)}</Cell>
                <Cell right><SgBadge value={b.diff} /></Cell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'baseline', padding: '10px 16px', borderTop: '1px solid var(--border)', background: 'var(--elevated)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={S.label}>Baseline</span>
          <span style={{ ...S.data, fontWeight: 'var(--weight-bold)' }}>{fmt(totals.baseline)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={S.label}>{strategyLabels[0]}</span>
          <span style={{ ...S.data, fontWeight: 'var(--weight-bold)' }}>{fmt(totals.scoreA)}</span>
          <SgBadge value={totals.diffA} />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={S.label}>{strategyLabels[1]}</span>
          <span style={{ ...S.data, fontWeight: 'var(--weight-bold)' }}>{fmt(totals.scoreB)}</span>
          <SgBadge value={totals.diffB} />
        </div>
      </div>
    </div>
  );
}
