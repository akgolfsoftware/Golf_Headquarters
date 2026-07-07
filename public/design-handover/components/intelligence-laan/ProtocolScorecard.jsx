import React from 'react';
import { getProtocol } from './protocol-definitions';
import { sgFromLength, expectedPutts, greenPutts, points8Ball, pointsLengthPutt, hovlandPei } from './sg-reference';
import { loadDraft, saveDraft, clearDraft, saveSession } from './session-store';

/**
 * ProtocolScorecard — data-drevet scorekort for Team Norway-testprotokollene
 * (protocol-definitions.js). Beregningene er de EKTE formlene fra Excel-arket,
 * via referansetabellene i sg-reference.js. Tre varianter:
 *  - "entry"   → kort per slag, store touch-flater; live-registrering på mobil/nettbrett
 *  - "compact" → tett tabell; coach/desktop
 *  - "print"   → papirlikt, tomme linjer, fylles ut for hånd
 *
 * «Grønne celler»-konvensjonen fra Excel er beholdt: input-celler får en myk
 * brand-tint, presets er nøytrale, beregnede felt vises som stille badges.
 */

function computeCell(protocol, col, row, vals) {
  const v = vals || {};
  const num = (x) => {
    if (x === '' || x == null) return null;
    const n = parseFloat(String(x).replace(',', '.'));
    return isNaN(n) ? null : n;
  };
  const resultat = num(v.resultat);
  const lieTable = v.lieInn || row.lie || 'fw';
  // Mål-avstand kan være preset (row.maal) eller fylles inn (PEI-tester med egne lengder)
  const maal = row.maal ?? num(v.maal);

  if (col.key === 'sgFraLengde') {
    return row.lengde != null ? sgFromLength(row.lengde, lieTable) : null;
  }
  if (col.key === 'tilMaal') {
    const c = num(v.carry), s = num(v.side);
    if (c == null || maal == null) return null;
    const dy = maal - c, dx = s ?? 0;
    return Math.sqrt(dy * dy + dx * dx);
  }
  if (col.key === 'diff') {
    const c = num(v.carry);
    return c != null && maal != null ? c - maal : null;
  }
  if (col.key === 'pei') {
    // PEI Test Bane: lengde + til hull fylles inn direkte
    const li = num(v.lengdeInn), th = num(v.tilHull);
    if (li != null || th != null) return li && th != null ? th / li : null;
    if (maal != null) {
      const tm = computeCell(protocol, { key: 'tilMaal' }, row, vals);
      return tm == null ? null : tm / maal;
    }
    if (resultat == null || !row.lengde) return null;
    return resultat / row.lengde;
  }
  if (col.key === 'pgaPutts') {
    if (resultat == null) return null;
    return protocol.puttsTable === 'green' ? greenPutts(resultat) : expectedPutts(resultat);
  }
  if (col.key === 'sg') {
    if (maal != null) {
      const tm = computeCell(protocol, { key: 'tilMaal' }, row, vals);
      return tm == null ? null : expectedPutts(tm);
    }
    if (resultat == null || row.lengde == null) return null;
    const fra = sgFromLength(row.lengde, lieTable);
    const putts = expectedPutts(resultat);
    if (fra == null || putts == null) return null;
    return (fra - 1) - putts;
  }
  if (col.key === 'forventet') {
    return maal != null ? expectedPutts(maal) : null;
  }
  if (col.key === 'res') {
    const n = num(v.antallSlag);
    if (n == null || maal == null) return null;
    const exp = expectedPutts(maal);
    return exp == null ? null : n - exp;
  }
  if (col.key === 'poeng') {
    if (v.treff != null) return v.treff === '✓' ? 1 : 0;
    if (v.ok != null) return v.ok === '✓' ? 1 : 0;
    const fot = num(v.antallFot);
    if (fot != null) return pointsLengthPutt(fot);
    if (resultat != null) return points8Ball(resultat);
    return null;
  }
  return null;
}

function median(nums) {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function computeTotal(protocol, total, allVals, rows) {
  const num = (x) => {
    const n = parseFloat(String(x ?? '').replace(',', '.'));
    return isNaN(n) ? null : n;
  };
  const picked = rows
    .map((row, i) => ({ row, i }))
    .filter(({ row }) => !total.filter || total.filter(row));

  if (total.compute === 'spread') {
    // Excel: AVERAGE(side) / MEDIAN(carry)
    const sides = picked.map(({ i }) => num((allVals[i] || {}).side)).filter((n) => n != null).map(Math.abs);
    const carries = picked.map(({ i }) => num((allVals[i] || {}).carry)).filter((n) => n != null);
    if (!sides.length || !carries.length) return null;
    const m = median(carries);
    return m ? sides.reduce((a, b) => a + b, 0) / sides.length / m : null;
  }

  const col = protocol.columns.find((c) => c.key === total.column);
  const nums = picked
    .map(({ row, i }) => {
      if (col && col.kind === 'computed') return computeCell(protocol, col, row, allVals[i]);
      return num((allVals[i] || {})[total.column]);
    })
    .filter((n) => n != null);
  if (!nums.length) return null;
  const sum = nums.reduce((a, b) => a + b, 0);
  return total.compute === 'avg' ? sum / nums.length : sum;
}

function fmt(value, decimals, percent) {
  if (value == null) return null;
  if (typeof value !== 'number') return String(value);
  if (percent) return (value * 100).toFixed(decimals ?? 1).replace('.', ',') + ' %';
  return value.toFixed(decimals ?? 2).replace('.', ',');
}

const S = {
  label: {
    fontFamily: 'var(--font-data)', fontSize: 'var(--text-label)', fontWeight: 'var(--weight-semibold)',
    letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--text-muted)',
  },
  data: { fontFamily: 'var(--font-data)', fontSize: 'var(--text-sm)', color: 'var(--text-strong)' },
};

function InputCell({ col, value, onChange, variant }) {
  const print = variant === 'print';
  if (print) {
    return <div style={{ borderBottom: '1px solid #999', minHeight: 22, minWidth: 52 }}></div>;
  }
  const tint = 'color-mix(in oklab, var(--brand) 8%, var(--surface))';
  if (col.input === 'choice') {
    return (
      <div style={{ display: 'flex', gap: 4 }}>
        {col.options.map((opt) => {
          const on = value === opt;
          return (
            <button key={opt} onClick={() => onChange(on ? null : opt)} style={{
              minWidth: variant === 'entry' ? 44 : 30, minHeight: variant === 'entry' ? 44 : 28,
              padding: '0 8px', cursor: 'pointer',
              border: `1px solid ${on ? 'var(--brand)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-input)',
              background: on ? 'var(--brand)' : tint,
              color: on ? 'var(--brand-contrast)' : 'var(--text-body)',
              fontFamily: 'var(--font-data)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)',
            }}>{opt}</button>
          );
        })}
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <input
        type="text" inputMode="decimal" value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: variant === 'entry' ? 72 : 56, minHeight: variant === 'entry' ? 44 : 28,
          padding: '0 8px', boxSizing: 'border-box',
          border: '1px solid var(--border)', borderRadius: 'var(--radius-input)',
          background: tint, fontFamily: 'var(--font-data)', fontSize: 'var(--text-sm)',
          color: 'var(--text-strong)', outline: 'none', textAlign: 'center',
        }}
      />
      {col.unit && <span style={{ ...S.data, color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>{col.unit}</span>}
    </div>
  );
}

function ComputedBadge({ value, decimals, percent }) {
  const text = fmt(value, decimals, percent);
  return (
    <span style={{
      display: 'inline-block', minWidth: 34, textAlign: 'center', padding: '3px 8px',
      borderRadius: 'var(--radius-pill)', background: 'var(--elevated)',
      fontFamily: 'var(--font-data)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)',
      color: text == null ? 'var(--text-muted)' : 'var(--text-strong)',
    }}>{text == null ? '—' : text}</span>
  );
}

function TotalsBar({ protocol, vals, variant, rows }) {
  if (!protocol.totals || !protocol.totals.length) return null;
  const print = variant === 'print';
  const benchmark = protocol.hovlandBenchmark && rows[0] && rows[0].maal != null ? hovlandPei(rows[0].maal) : null;
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: print ? 18 : 10, alignItems: 'center',
      padding: variant === 'entry' ? '14px 16px' : '10px 14px',
      borderTop: print ? '2px solid #222' : '1px solid var(--border)',
      background: print ? 'transparent' : 'var(--elevated)',
    }}>
      {protocol.totals.map((t) => {
        const val = print ? null : computeTotal(protocol, t, vals, rows);
        return (
          <div key={t.label} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={S.label}>{t.label}</span>
            {print
              ? <span style={{ borderBottom: '1px solid #999', minWidth: 40, display: 'inline-block' }}>&nbsp;</span>
              : <span style={{ fontFamily: 'var(--font-data)', fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-base)', color: 'var(--brand)' }}>
                  {val == null ? '—' : fmt(val, t.decimals, t.percent)}
                </span>}
          </div>
        );
      })}
      {benchmark != null && !print && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginLeft: 'auto' }}>
          <span style={S.label}>Hovland-ref PEI</span>
          <span style={{ fontFamily: 'var(--font-data)', fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            {fmt(benchmark, 1, true)}
          </span>
        </div>
      )}
    </div>
  );
}

// Fullfør-linje: vitne-felt + lagre-knapp (når sessionKey/completable er satt)
function CompleteBar({ witness, setWitness, onComplete, completed, onReset }) {
  const btn = (primary) => ({
    minHeight: 38, padding: '0 16px', cursor: 'pointer',
    border: `1px solid ${primary ? 'var(--brand)' : 'var(--border)'}`,
    borderRadius: 'var(--radius-input)',
    background: primary ? 'var(--brand)' : 'var(--surface)',
    color: primary ? 'var(--brand-contrast)' : 'var(--text-body)',
    fontFamily: 'var(--font-data)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)',
  });
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', borderTop: '1px solid var(--border)',
    }}>
      {completed ? (
        <React.Fragment>
          <span style={{ ...S.data, fontWeight: 'var(--weight-semibold)', color: 'var(--positive)' }}>✓ Økten er lagret</span>
          <button onClick={onReset} style={btn(false)}>Ny økt</button>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200 }}>
            <span style={S.label}>Vitne</span>
            <input
              type="text" placeholder="Navn på vitne/coach" value={witness} onChange={(e) => setWitness(e.target.value)}
              style={{
                flex: 1, minWidth: 0, minHeight: 38, padding: '0 10px', boxSizing: 'border-box',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', background: 'var(--input-bg)',
                fontFamily: 'var(--font-data)', fontSize: 'var(--text-sm)', color: 'var(--text-strong)', outline: 'none',
              }}
            />
          </div>
          <button onClick={onComplete} style={btn(true)}>Fullfør test</button>
        </React.Fragment>
      )}
    </div>
  );
}

export function ProtocolScorecard({
  protocol: protocolProp,
  protocolId,
  variant = 'entry',
  gender = 'gutter',
  values,
  onChange,
  player,
  date,
  maxRows,
  sessionKey,
  completable,
  onComplete,
  style = {},
  ...rest
}) {
  const protocol = typeof protocolProp === 'object' && protocolProp ? protocolProp : getProtocol(protocolId || protocolProp);
  const [internal, setInternal] = React.useState(() => (sessionKey && loadDraft(sessionKey)) || {});
  const [witness, setWitness] = React.useState('');
  const [completed, setCompleted] = React.useState(false);
  const vals = values || internal;
  const setVal = (rowIdx, key, value) => {
    const next = { ...vals, [rowIdx]: { ...(vals[rowIdx] || {}), [key]: value } };
    if (onChange) onChange(next, rowIdx, key, value);
    else {
      setInternal(next);
      if (sessionKey) saveDraft(sessionKey, next);
    }
    if (completed) setCompleted(false);
  };

  if (!protocol) return <div style={S.data}>Ukjent protokoll</div>;
  const allRows = (protocol.rowsByGender && protocol.rowsByGender[gender]) || protocol.rows;
  const print = variant === 'print';
  const rows = maxRows ? allRows.slice(0, maxRows) : allRows;
  const truncated = maxRows && allRows.length > maxRows;

  const showComplete = !print && (completable || sessionKey != null);
  const handleComplete = () => {
    const totals = (protocol.totals || []).map((t) => ({
      label: t.label,
      value: fmt(computeTotal(protocol, t, vals, allRows), t.decimals, t.percent),
    }));
    const session = saveSession({
      protocolId: protocol.id, protocolName: protocol.name, group: protocol.group,
      player: player || '', date: date || new Date().toLocaleDateString('nb-NO'),
      gender: protocol.rowsByGender ? gender : undefined,
      witness: witness || '', values: vals, totals,
    });
    if (sessionKey) clearDraft(sessionKey);
    setCompleted(true);
    if (onComplete) onComplete(session);
  };
  const handleReset = () => {
    setInternal({});
    setWitness('');
    setCompleted(false);
    if (sessionKey) clearDraft(sessionKey);
  };
  const completeBar = showComplete
    ? <CompleteBar witness={witness} setWitness={setWitness} onComplete={handleComplete} completed={completed} onReset={handleReset} />
    : null;

  const frame = {
    background: print ? '#fff' : 'var(--surface)',
    border: print ? '2px solid #222' : '1px solid var(--border)',
    borderRadius: print ? 0 : 'var(--radius-card)',
    boxShadow: print ? 'none' : 'var(--shadow-sm)',
    overflow: 'hidden',
    color: print ? '#111' : undefined,
    ...style,
  };

  const header = (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap',
      padding: variant === 'entry' ? '16px 16px 12px' : '12px 14px 10px',
      borderBottom: print ? '2px solid #222' : '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={S.label}>{protocol.group === 'Teknikk' ? 'Teknikk-test' : 'Golfslag-test'}</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-lg)', color: print ? '#111' : 'var(--text-strong)' }}>
          {protocol.name}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        {protocol.rowsByGender && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={S.label}>Klasse</span>
            <span style={S.data}>{gender === 'jenter' ? 'Jenter' : 'Gutter'}</span>
          </div>
        )}
        {player != null && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={S.label}>Navn</span>
            <span style={S.data}>{player || (print ? '\u00A0' : '—')}</span>
          </div>
        )}
        {date != null && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={S.label}>Dato</span>
            <span style={S.data}>{date || (print ? '\u00A0' : '—')}</span>
          </div>
        )}
      </div>
    </div>
  );

  if (variant === 'entry') {
    return (
      <div style={frame} {...rest}>
        {header}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {rows.map((row, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
              padding: '12px 16px', borderTop: i === 0 ? 'none' : '1px solid var(--border)',
            }}>
              <span style={{
                width: 28, height: 28, borderRadius: '50%', flex: '0 0 auto',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--elevated)', fontFamily: 'var(--font-data)',
                fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-bold)', color: 'var(--text-muted)',
              }}>{i + 1}</span>
              {protocol.columns.map((col) => (
                <div key={col.key} style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: col.kind === 'preset' ? 64 : undefined }}>
                  <span style={S.label}>{col.label}</span>
                  {col.kind === 'preset' && (
                    row[col.key] == null && col.editableFallback
                      ? <InputCell col={col} value={(vals[i] || {})[col.key]} onChange={(v) => setVal(i, col.key, v)} variant={variant} />
                      : <span style={{ ...S.data, fontWeight: 'var(--weight-semibold)' }}>
                          {row[col.key]}{col.unit ? ` ${col.unit}` : ''}
                        </span>
                  )}
                  {col.kind === 'input' && <InputCell col={col} value={(vals[i] || {})[col.key]} onChange={(v) => setVal(i, col.key, v)} variant={variant} />}
                  {col.kind === 'computed' && <ComputedBadge value={computeCell(protocol, col, row, vals[i])} decimals={col.decimals} percent={col.percent} />}
                </div>
              ))}
            </div>
          ))}
          {truncated && (
            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', ...S.data, color: 'var(--text-muted)' }}>
              + {allRows.length - rows.length} flere slag …
            </div>
          )}
        </div>
        <TotalsBar protocol={protocol} vals={vals} variant={variant} rows={rows} />
        {completeBar}
      </div>
    );
  }

  // compact + print share the table layout
  const cellPad = print ? '7px 10px' : '5px 10px';
  const headStyle = {
    ...S.label, textAlign: 'left', padding: cellPad,
    borderBottom: print ? '2px solid #222' : '1px solid var(--border)',
    color: print ? '#111' : 'var(--text-muted)', whiteSpace: 'nowrap',
  };
  const tdStyle = {
    padding: cellPad, borderBottom: print ? '1px solid #ccc' : '1px solid var(--border)',
    ...S.data, color: print ? '#111' : 'var(--text-strong)', whiteSpace: 'nowrap',
  };

  return (
    <div style={frame} {...rest}>
      {header}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={headStyle}>Nr</th>
              {protocol.columns.map((col) => <th key={col.key} style={headStyle}>{col.label}{col.unit ? ` (${col.unit})` : ''}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{i + 1}</td>
                {protocol.columns.map((col) => (
                  <td key={col.key} style={tdStyle}>
                    {col.kind === 'preset' && (
                      row[col.key] == null && col.editableFallback
                        ? <InputCell col={col} value={(vals[i] || {})[col.key]} onChange={(v) => setVal(i, col.key, v)} variant={variant} />
                        : <span>{row[col.key]}</span>
                    )}
                    {col.kind === 'input' && <InputCell col={col} value={(vals[i] || {})[col.key]} onChange={(v) => setVal(i, col.key, v)} variant={variant} />}
                    {col.kind === 'computed' && (print
                      ? <span style={{ borderBottom: '1px solid #999', display: 'inline-block', minWidth: 34 }}>&nbsp;</span>
                      : <ComputedBadge value={computeCell(protocol, col, row, vals[i])} decimals={col.decimals} percent={col.percent} />)}
                  </td>
                ))}
              </tr>
            ))}
            {truncated && (
              <tr><td colSpan={protocol.columns.length + 1} style={{ ...tdStyle, color: 'var(--text-muted)' }}>+ {allRows.length - rows.length} flere slag …</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <TotalsBar protocol={protocol} vals={vals} variant={variant} rows={rows} />
      {completeBar}
    </div>
  );
}
