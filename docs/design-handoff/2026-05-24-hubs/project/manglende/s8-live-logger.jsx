// Screen 8 — Live Session Logger
// /portal/(fullscreen)/live/[id]/logger — én-håndsbruk, 80px touchtargets
const { useState: useS8 } = React;

function LoggerShell({ children, dark }) {
  return (
    <div className="ab" style={{ background: dark ? 'var(--primary-dark)' : 'var(--fg)', color: '#fff', overflow: 'hidden' }}>
      {/* status bar */}
      <div className="ph-status" style={{ color: '#fff' }}>
        <span>9:41</span>
        <div className="right">
          <svg width="16" height="11" viewBox="0 0 19 12"><rect x="0" y="7.5" width="3.2" height="4.5" rx="0.7" fill="currentColor"/><rect x="4.8" y="5" width="3.2" height="7" rx="0.7" fill="currentColor"/><rect x="9.6" y="2.5" width="3.2" height="9.5" rx="0.7" fill="currentColor"/><rect x="14.4" y="0" width="3.2" height="12" rx="0.7" fill="currentColor"/></svg>
          <svg width="24" height="11" viewBox="0 0 27 13"><rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke="currentColor" strokeOpacity="0.35" fill="none"/><rect x="2" y="2" width="20" height="9" rx="2" fill="currentColor"/></svg>
        </div>
      </div>
      {children}
      <div style={{ position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)', width: 110, height: 4, background: 'rgba(255,255,255,0.30)', borderRadius: 2 }}/>
    </div>
  );
}

// ── VARIANT A · Stor +1 touchtarget ──────────────────────────────────
function S8_VariantA() {
  const [count, setCount] = useS8({ ok: 7, miss: 1 });
  return (
    <LoggerShell>
      {/* header */}
      <div style={{ padding: '8px 22px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button style={{ background: 'transparent', border: 0, color: 'rgba(255,255,255,0.5)', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em' }}>
          <Icon.Close/> AVSLUTT
        </button>
        <div style={{ textAlign: 'center' }}>
          <div className="mono" style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.14em' }}>2 / 5 DRILLS</div>
        </div>
        <div className="mono" style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--accent)' }}>04:18</div>
      </div>
      <div style={{ padding: '0 22px', textAlign: 'center', marginTop: 8 }}>
        <div style={{ display: 'inline-flex', gap: 6, padding: '5px 12px', borderRadius: 999, background: 'rgba(209,248,67,0.15)' }}>
          <span className="pill pill-spill" style={{ background: 'transparent', color: 'var(--accent)', padding: 0 }}>PUTT</span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.06em' }}>· 10 REPS</span>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, marginTop: 10, lineHeight: 1.2 }}>Gate-putt med <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>start-linje</em></div>
      </div>

      {/* big counter */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 22px', position: 'absolute', top: 110, bottom: 200, left: 0, right: 0 }}>
        <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.20em' }}>HIT / TOTAL</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', marginTop: 4 }}>
          <div style={{ fontSize: 110, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.04em', lineHeight: 1 }}>{count.ok}</div>
          <div style={{ fontSize: 60, fontWeight: 600, color: 'rgba(255,255,255,0.30)', letterSpacing: '-0.04em' }}>/ {count.ok + count.miss}</div>
        </div>
        <div className="mono" style={{ fontSize: 12, color: 'var(--accent)', letterSpacing: '0.08em', marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>{Math.round(count.ok / (count.ok + count.miss) * 100)}% HIT-RATE</div>
        <div className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em', marginTop: 14, textAlign: 'center', lineHeight: 1.5, maxWidth: 240 }}>
          Mål: 8 av 10 inn — du trenger 1 til
        </div>
      </div>

      {/* big buttons */}
      <div style={{ position: 'absolute', bottom: 80, left: 22, right: 22, display: 'grid', gridTemplateColumns: '1fr 100px', gap: 12 }}>
        <button style={{
          height: 96, borderRadius: 24, border: 0,
          background: 'var(--accent)', color: 'var(--fg)',
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700,
          letterSpacing: '-0.01em',
          boxShadow: '0 4px 16px rgba(209,248,67,0.30), inset 0 0 0 1px rgba(0,0,0,0.05)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
        }}>
          <span style={{ fontSize: 32 }}>+1</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.10em', opacity: 0.7 }}>INN</span>
        </button>
        <button style={{
          height: 96, borderRadius: 24, border: 0,
          background: 'rgba(163,45,45,0.85)', color: '#fff',
          fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
        }}>
          <span style={{ fontSize: 24 }}>−</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', opacity: 0.75 }}>BOM</span>
        </button>
      </div>

      {/* footer nav */}
      <div style={{ position: 'absolute', bottom: 16, left: 22, right: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <button style={{ background: 'rgba(255,255,255,0.06)', border: 0, color: '#fff', padding: '12px 16px', borderRadius: 12, fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.10em', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon.Back/> FORRIGE
        </button>
        <button style={{ background: 'rgba(255,255,255,0.06)', border: 0, color: '#fff', padding: '12px 16px', borderRadius: 12, fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.10em', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          SETT
        </button>
        <button style={{ background: 'var(--accent)', border: 0, color: 'var(--fg)', padding: '12px 16px', borderRadius: 12, fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.10em', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          NESTE <Icon.Arrow/>
        </button>
      </div>
    </LoggerShell>
  );
}
window.S8_VariantA = S8_VariantA;

// ── VARIANT B · Split rep + progress-strip ───────────────────────────
function S8_VariantB() {
  return (
    <LoggerShell dark>
      <div style={{ padding: '6px 22px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button style={{ background: 'transparent', border: 0, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.10em' }}><Icon.Close/></button>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div className="mono" style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.14em' }}>PUTT-FOKUS · MARKUS</div>
          <div className="mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>04:18 / 20:00</div>
        </div>
        <button style={{ background: 'rgba(255,255,255,0.10)', border: 0, color: '#fff', width: 36, height: 36, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Pause/></button>
      </div>

      {/* drill progress strip (vertical) */}
      <div style={{ position: 'absolute', left: 0, top: 60, bottom: 220, width: 60, display: 'flex', flexDirection: 'column', padding: '10px 14px', gap: 8 }}>
        {[
          { l: 'OPPV', s: 'done' },
          { l: 'GATE', s: 'done' },
          { l: 'STIGE', s: 'active' },
          { l: 'SPEED', s: 'next' },
          { l: 'FT', s: 'next' },
        ].map((d, i) => (
          <div key={i} style={{ flex: 1, borderRadius: 8, padding: 8, background: d.s === 'done' ? 'rgba(209,248,67,0.20)' : d.s === 'active' ? 'var(--accent)' : 'rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <div className="mono" style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.10em', color: d.s === 'active' ? 'var(--fg)' : d.s === 'done' ? 'var(--accent)' : 'rgba(255,255,255,0.4)' }}>{d.l}</div>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: d.s === 'active' ? 'var(--fg)' : d.s === 'done' ? 'var(--accent)' : 'rgba(255,255,255,0.10)', color: d.s === 'active' ? 'var(--accent)' : 'var(--fg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700 }}>{d.s === 'done' ? '✓' : i + 1}</div>
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', left: 80, right: 22, top: 70, display: 'flex', flexDirection: 'column' }}>
        <div className="pill pill-spill" style={{ alignSelf: 'flex-start' }}>PUTT · 6 MIN</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 600, color: '#fff', marginTop: 8, lineHeight: 1.2 }}>Lag-på-lag stige <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>1m → 3m</em></div>
        <div className="mono" style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.04em', marginTop: 6 }}>MÅL: 8 AV 10 INN</div>
      </div>

      {/* center counter */}
      <div style={{ position: 'absolute', left: 80, right: 22, top: 180, bottom: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 86, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.04em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>4</div>
        <div className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.14em', marginTop: 4 }}>AV 10 · 80% TIL MÅL</div>

        <div style={{ display: 'flex', gap: 4, marginTop: 18, width: '100%' }}>
          {[...Array(10)].map((_, i) => (
            <div key={i} style={{ flex: 1, height: 32, borderRadius: 4, background: i < 4 ? 'var(--accent)' : i < 6 ? 'rgba(163,45,45,0.50)' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: i < 6 ? 'var(--fg)' : 'rgba(255,255,255,0.30)' }}>
              {i < 6 ? (i < 4 ? '✓' : '✕') : i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* bottom dual-button */}
      <div style={{ position: 'absolute', bottom: 16, left: 22, right: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button style={{ height: 88, borderRadius: 18, border: 0, background: 'rgba(163,45,45,0.85)', color: '#fff', fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
          <span>BOM</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, opacity: 0.75 }}>2 så langt</span>
        </button>
        <button style={{ height: 88, borderRadius: 18, border: 0, background: 'var(--accent)', color: 'var(--fg)', fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(209,248,67,0.30)' }}>
          <span>INN</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, opacity: 0.75 }}>4 så langt</span>
        </button>
      </div>
    </LoggerShell>
  );
}
window.S8_VariantB = S8_VariantB;

// ── VARIANT C · Gesture-driven minimalist ────────────────────────────
function S8_VariantC() {
  return (
    <LoggerShell>
      {/* exit pill */}
      <div style={{ position: 'absolute', top: 50, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,0.06)', padding: '6px 14px', borderRadius: 999 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'lpulse 1.4s ease-in-out infinite' }}/>
        <span className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.14em', fontWeight: 700 }}>LIVE · 04:18</span>
      </div>

      {/* drill title up top */}
      <div style={{ position: 'absolute', top: 110, left: 22, right: 22, textAlign: 'center' }}>
        <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.14em' }}>DRILL 3 AV 5 · STIGE 1M → 3M</div>
      </div>

      {/* huge tap zone */}
      <div style={{
        position: 'absolute', top: 160, bottom: 220, left: 22, right: 22,
        borderRadius: 24,
        background: 'radial-gradient(circle at center, rgba(209,248,67,0.18) 0%, rgba(209,248,67,0.04) 50%, transparent 80%)',
        border: '2px dashed rgba(209,248,67,0.30)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 110, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.05em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>7</div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: '0.14em' }}>HIT</div>
        <div style={{ width: 60, height: 1, background: 'rgba(255,255,255,0.20)', margin: '12px 0' }}/>
        <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>1 bom</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginTop: 18 }}>
          <div style={{ width: 18, height: 18, color: 'rgba(255,255,255,0.40)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9" strokeDasharray="2 4"/></svg>
          </div>
          <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.40)', letterSpacing: '0.10em', textAlign: 'center', lineHeight: 1.5 }}>TAPP HVOR SOM HELST<br/>FOR Å LOGGE INN</div>
        </div>
      </div>

      {/* gesture-hint footer */}
      <div style={{ position: 'absolute', bottom: 78, left: 22, right: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          {[
            ['← swipe', 'BOM'],
            ['↓ swipe', 'PAUSE'],
            ['→ swipe', 'NESTE'],
          ].map(([g, l], i) => (
            <div key={i} style={{ flex: 1, padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 12, textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.04em' }}>{g}</div>
              <div className="mono" style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* progress strip bottom */}
      <div style={{ position: 'absolute', bottom: 22, left: 22, right: 22 }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {[1,1,0.65,0,0].map((v, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.10)', overflow: 'hidden' }}>
              <div style={{ width: `${v * 100}%`, height: '100%', background: i === 2 ? 'var(--accent)' : 'rgba(209,248,67,0.40)' }}/>
            </div>
          ))}
        </div>
      </div>
    </LoggerShell>
  );
}
window.S8_VariantC = S8_VariantC;

// ── Tablet / landscape ───────────────────────────────────────────────
function S8_Tablet() {
  return (
    <div className="ab" style={{ background: 'var(--fg)', color: '#fff' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 220px', height: '100%' }}>
        {/* LEFT: drill strip */}
        <div style={{ padding: 24, borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>5 DRILLS · 20 MIN</div>
          {['Oppvarming 5m','Gate-putt','Stige 1→3m','Speed 6m','Free-throw'].map((n, i) => (
            <div key={i} style={{ padding: 12, borderRadius: 10, background: i === 2 ? 'var(--accent)' : i < 2 ? 'rgba(209,248,67,0.10)' : 'rgba(255,255,255,0.04)', color: i === 2 ? 'var(--fg)' : '#fff' }}>
              <div className="mono" style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.10em' }}>{i < 2 ? '✓ FERDIG' : i === 2 ? 'NÅ' : `STEG ${i + 1}`}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, marginTop: 4 }}>{n}</div>
            </div>
          ))}
          <div className="mono" style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: '0.06em', marginTop: 'auto', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>04:18 / 20:00</div>
        </div>
        {/* CENTER */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 }}>
          <span className="pill pill-spill">PUTT</span>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, textAlign: 'center', letterSpacing: '-0.015em' }}>Lag-på-lag stige <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>1m → 3m</em></div>
          <div className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.14em' }}>MÅL · 8 AV 10 INN</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 130, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.05em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>7</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 60, fontWeight: 600, color: 'rgba(255,255,255,0.30)' }}>/ 10</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 120px', gap: 12, marginTop: 8 }}>
            <button style={{ height: 80, borderRadius: 16, border: 0, background: 'rgba(163,45,45,0.85)', color: '#fff', fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>BOM</button>
            <button style={{ height: 80, borderRadius: 16, border: 0, background: 'var(--accent)', color: 'var(--fg)', fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>+1 INN</button>
          </div>
        </div>
        {/* RIGHT: TrackMan live */}
        <div style={{ padding: 24, borderLeft: '1px solid rgba(255,255,255,0.08)', background: 'var(--primary-dark)' }}>
          <div className="mono" style={{ fontSize: 10, color: 'rgba(209,248,67,0.7)', letterSpacing: '0.14em', fontWeight: 700, textTransform: 'uppercase' }}>TRACKMAN · LIVE</div>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              ['Start-vinkel', '1,4°', 'success'],
              ['Speed-error', '±0,3m', 'success'],
              ['Avstand', '2,5m', 'fg'],
              ['Side-fall', '+0,8°', 'warning'],
            ].map(([k, v, c]) => (
              <div key={k}>
                <div className="mono" style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.10em', textTransform: 'uppercase' }}>{k}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: c === 'success' ? 'var(--accent)' : c === 'warning' ? '#F5C8C8' : '#fff', marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
window.S8_Tablet = S8_Tablet;
