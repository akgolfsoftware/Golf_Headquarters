// Screen 6 — AI foreslå turnering (modal)
const { useState: useS6 } = React;

const TOURNAMENTS = [
  { n: 'Olyo Tour · Larvik Open', tour: 'OLYO TOUR', date: '14–16 JUN', loc: 'Larvik GK', req: '0–5', mine: '+3,5', prob: 'TOPP 30% · topp-10', distance: '142 km', hrs: '1t 56m', purse: 'kr 80 000', good: 'BRA MATCH' },
  { n: 'Srixon Tour · Holtsmark', tour: 'SRIXON', date: '21–22 JUN', loc: 'Holtsmark GK', req: '+2 til 4', mine: '+3,5', prob: 'TOPP 40% · topp-5', distance: '38 km', hrs: '42 min', purse: 'kr 45 000', good: 'TOPP-VALG' },
  { n: 'Garmin Norges Cup · Oslo GK', tour: 'GARMIN NC', date: '28–30 JUN', loc: 'Oslo GK', req: '0–8', mine: '+3,5', prob: 'TOPP 25% · vinne', distance: '12 km', hrs: '18 min', purse: 'kr 60 000', good: 'TOPP-VALG' },
  { n: 'Olyo Tour · Trondheim Klassisk', tour: 'OLYO TOUR', date: '05–07 JUL', loc: 'Trondheim GK', req: '0–5', mine: '+3,5', prob: 'TOPP 35% · topp-10', distance: '498 km', hrs: 'fly · 1t 10m', purse: 'kr 80 000', good: 'OK' },
  { n: 'Junior NM 2026', tour: 'NM', date: '20–24 JUL', loc: 'Bærum GK', req: 'U18', mine: '17 år', prob: 'TOPP 15% · medalje', distance: '8 km', hrs: '15 min', purse: 'STATUS', good: 'PRIORITERT' },
];

function TournCard({ t, picked, onPick, compact }) {
  return (
    <div style={{
      background: '#fff', border: picked ? '1.5px solid var(--primary)' : '1px solid var(--border)',
      borderRadius: 14, padding: compact ? 14 : 18,
      display: 'flex', flexDirection: 'column', gap: 12,
      boxShadow: picked ? '0 0 0 3px rgba(0,88,64,0.08)' : 'none',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span className="x-pill" style={{ background: 'rgba(0,88,64,0.10)', color: 'var(--primary)' }}>{t.tour}</span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em' }}>{t.date}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, lineHeight: 1.25 }}>{t.n}</div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', letterSpacing: '0.04em', marginTop: 4 }}>{t.loc} · {t.distance} · {t.hrs}</div>
        </div>
        <span className={`x-pill ${t.good === 'TOPP-VALG' ? 'aktiv' : t.good === 'PRIORITERT' ? 'live' : t.good === 'BRA MATCH' ? 'done' : 'draft'}`}>{t.good}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '12px 0', borderTop: '1px solid var(--border-soft)', borderBottom: '1px solid var(--border-soft)' }}>
        <div>
          <div className="mono" style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.10em' }}>HCP-KRAV</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, marginTop: 2 }}>{t.req}</div>
        </div>
        <div>
          <div className="mono" style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.10em' }}>DITT NIVÅ</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--success)', marginTop: 2 }}>{t.mine} ✓</div>
        </div>
        <div>
          <div className="mono" style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.10em' }}>PURSE</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, marginTop: 2 }}>{t.purse}</div>
        </div>
      </div>
      <div style={{ background: 'rgba(209,248,67,0.10)', borderLeft: '3px solid var(--accent)', padding: '8px 12px', borderRadius: 6 }}>
        <div className="mono" style={{ fontSize: 9, color: 'var(--primary)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon.Sparkle/> AI-VURDERING</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, lineHeight: 1.45, marginTop: 4 }}>{t.prob}</div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
        <button onClick={onPick} className={`btn ${picked ? 'btn-forest' : 'btn-primary'} btn-sm`} style={{ flex: 1, justifyContent: 'center' }}>
          {picked ? <><Icon.Check/> Påmeldt</> : 'Meld på'}
        </button>
        <button className="btn btn-outline btn-sm">Detaljer →</button>
      </div>
    </div>
  );
}

// ── VARIANT A · Modal med filter-strip ───────────────────────────────
function S6_VariantA() {
  const [picked, setPicked] = useS6(new Set([1, 2]));
  const toggle = (i) => { const n = new Set(picked); n.has(i) ? n.delete(i) : n.add(i); setPicked(n); };
  return (
    <div className="ab" style={{ background: 'rgba(10,31,23,0.45)', backdropFilter: 'blur(2px)' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 640, maxWidth: 'calc(100% - 40px)', maxHeight: 'calc(100% - 40px)', background: '#fff', borderRadius: 20, boxShadow: '0 24px 60px rgba(10,31,23,0.30)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '22px 24px 16px', borderBottom: '1px solid var(--border-soft)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: 'var(--accent)', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--fg)', letterSpacing: '0.10em', textTransform: 'uppercase' }}><Icon.Sparkle/> AI · CLAUDE</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', marginTop: 10 }}>
              AI-foreslå <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--primary)' }}>turnering</em>
            </h2>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', letterSpacing: '0.06em', marginTop: 6 }}>5 turneringer · juni–juli · matchet mot din HCP og kalender</div>
          </div>
          <button className="modal-close"><Icon.Close/></button>
        </div>
        <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border-soft)', background: 'var(--bg)' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="filter-pill active">Alle <span className="count">5</span></button>
            <button className="filter-pill">Olyo <span className="count">2</span></button>
            <button className="filter-pill">Srixon <span className="count">1</span></button>
            <button className="filter-pill">NM <span className="count">1</span></button>
            <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 4px' }}/>
            <button className="filter-pill"><Icon.Calendar/> Juni</button>
            <button className="filter-pill">Juli</button>
            <button className="filter-pill" style={{ marginLeft: 'auto' }}>&lt; 100km</button>
          </div>
        </div>
        <div style={{ padding: '18px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {TOURNAMENTS.map((t, i) => <TournCard key={i} t={t} picked={picked.has(i)} onPick={() => toggle(i)}/>)}
        </div>
        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="#" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--primary)', letterSpacing: '0.04em' }}>→ Se hele turneringskalenderen</a>
          <button className="btn btn-primary">Meld på {picked.size} valgt</button>
        </div>
      </div>
    </div>
  );
}
window.S6_VariantA = S6_VariantA;

// ── VARIANT B · Card-stack swipe ─────────────────────────────────────
function S6_VariantB() {
  const t = TOURNAMENTS[0];
  return (
    <div className="ab" style={{ background: 'rgba(10,31,23,0.45)' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 440, maxWidth: 'calc(100% - 40px)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
          <div className="mono" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon.Sparkle/> AI · 1 / 5</div>
          <Icon.Close/>
        </div>
        {/* card stack */}
        <div style={{ position: 'relative', height: 540 }}>
          {[2, 1, 0].map(i => (
            <div key={i} style={{
              position: 'absolute', top: i * 8, left: i * 6, right: -i * 6,
              transform: `rotate(${(i === 0 ? -2 : i === 2 ? 1.5 : 0)}deg)`,
              background: '#fff', borderRadius: 20, padding: 24,
              boxShadow: '0 20px 50px rgba(10,31,23,0.30)', zIndex: 5 - i,
              opacity: i === 0 ? 1 : 0.5 - i * 0.15,
              display: 'flex', flexDirection: 'column', gap: 14,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="x-pill" style={{ background: 'rgba(0,88,64,0.10)', color: 'var(--primary)' }}>{TOURNAMENTS[i].tour}</span>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, marginTop: 10, lineHeight: 1.15, letterSpacing: '-0.01em' }}>{TOURNAMENTS[i].n}</div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, letterSpacing: '0.04em' }}>{TOURNAMENTS[i].date} · {TOURNAMENTS[i].loc}</div>
                </div>
                <span className={`x-pill ${TOURNAMENTS[i].good === 'TOPP-VALG' ? 'aktiv' : TOURNAMENTS[i].good === 'PRIORITERT' ? 'live' : 'done'}`}>{TOURNAMENTS[i].good}</span>
              </div>
              {/* big visual */}
              <div style={{ height: 140, background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', borderRadius: 12, position: 'relative', overflow: 'hidden', color: '#fff', padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(209,248,67,0.05) 12px, rgba(209,248,67,0.05) 24px)' }}/>
                <div className="mono" style={{ fontSize: 10, color: 'rgba(209,248,67,0.7)', letterSpacing: '0.14em', textTransform: 'uppercase', position: 'relative' }}>AI-vurdering</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, lineHeight: 1.35, marginTop: 4, position: 'relative' }}>{TOURNAMENTS[i].prob}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[['HCP', `${TOURNAMENTS[i].mine} / ${TOURNAMENTS[i].req}`],['REISE', TOURNAMENTS[i].hrs],['PURSE', TOURNAMENTS[i].purse]].map(([k,v]) => (
                  <div key={k} style={{ padding: 10, background: 'var(--bg)', borderRadius: 8 }}>
                    <div className="mono" style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.10em' }}>{k}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 600, marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
                <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', borderColor: 'var(--danger)', color: 'var(--danger)' }}>Skip</button>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Meld på</button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
          {TOURNAMENTS.map((_, i) => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === 0 ? 'var(--accent)' : 'rgba(255,255,255,0.30)' }}/>)}
        </div>
      </div>
    </div>
  );
}
window.S6_VariantB = S6_VariantB;

// ── VARIANT C · Kalender-overlay ─────────────────────────────────────
function S6_VariantC() {
  return (
    <div className="ab" style={{ background: 'rgba(10,31,23,0.45)' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 1020, maxWidth: 'calc(100% - 40px)', maxHeight: 'calc(100% - 40px)', background: '#fff', borderRadius: 20, boxShadow: '0 24px 60px rgba(10,31,23,0.30)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: 'var(--accent)', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--fg)', letterSpacing: '0.10em', textTransform: 'uppercase' }}><Icon.Sparkle/> AI · KALENDER-VIEW</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', marginTop: 8 }}>AI-foreslå <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--primary)' }}>turnering</em></h2>
          </div>
          <button className="modal-close"><Icon.Close/></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', flex: 1, overflow: 'hidden' }}>
          {/* CALENDAR */}
          <div style={{ padding: 24, borderRight: '1px solid var(--border)' }}>
            <div className="label-mono" style={{ marginBottom: 12 }}>JUNI–JULI 2026</div>
            <div className="month-header">
              {['MAN','TIR','ONS','TOR','FRE','LØR','SØN'].map(d => <span key={d}>{d}</span>)}
            </div>
            <div className="month-grid">
              {Array.from({ length: 42 }).map((_, i) => {
                const day = i - 6;
                const isMonth = day > 0 && day < 31;
                const tournDays = { 14: 0, 15: 0, 16: 0, 21: 1, 22: 1, 28: 2, 29: 2, 30: 2 };
                const tIdx = tournDays[day];
                return (
                  <div key={i} className={`day-cell ${!isMonth ? 'dim' : ''} ${tIdx != null ? 'has-tour' : ''}`} style={{ minHeight: 68 }}>
                    <div className="dnum">{isMonth ? day : ''}</div>
                    {tIdx != null && (
                      <div className="tour-label">{TOURNAMENTS[tIdx].tour.split(' ')[0]}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {/* LIST */}
          <div style={{ padding: '24px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="label-mono">5 FORSLAG</div>
            {TOURNAMENTS.map((t, i) => (
              <div key={i} style={{ padding: 12, borderRadius: 10, border: '1px solid var(--border)', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span className="x-pill" style={{ background: 'rgba(0,88,64,0.10)', color: 'var(--primary)', fontSize: 9 }}>{t.tour}</span>
                  <span className="mono" style={{ fontSize: 9.5, color: 'var(--muted)' }}>{t.date}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, marginTop: 4, lineHeight: 1.25 }}>{t.n}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>{t.loc} · {t.hrs}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
window.S6_VariantC = S6_VariantC;

// ── Mobile ────────────────────────────────────────────────────────────
function S6_Mobile() {
  return (
    <PhoneFrame>
      <div style={{ padding: '6px 18px 14px', background: '#fff', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="mono" style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.14em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon.Sparkle/> AI · TURNERING</div>
          <Icon.Close/>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', marginTop: 8 }}>5 forslag for <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--primary)' }}>juni–juli</em></h2>
      </div>
      <div className="ph-body">
        {TOURNAMENTS.slice(0,3).map((t, i) => <TournCard key={i} t={t} compact picked={i === 1}/>)}
      </div>
      <div className="ph-footer">
        <button className="btn btn-primary">Meld på 1 valgt</button>
      </div>
    </PhoneFrame>
  );
}
window.S6_Mobile = S6_Mobile;
