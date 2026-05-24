// pr1-coachhq.jsx — CoachHQ Hjem (Anders' kommando-senter), Variants A / B / C / Mobile A

const STALL = [
  { i: 'EN', n: 'Emil N.', m: 'A1 · +2,1', c: 'c1', s: 'ok' },
  { i: 'IK', n: 'Ida K.', m: 'A1 · +0,8', c: 'c2', s: 'ok' },
  { i: 'MR', n: 'Markus R.', m: 'A1 · +3,5', c: 'c3', s: 'ok' },
  { i: 'SH', n: 'Sander H.', m: 'A2 · 1,4', c: 'c4', s: 'warn' },
  { i: 'AL', n: 'Anna L.', m: 'A2 · 2,8', c: 'c5', s: 'ok' },
  { i: 'TB', n: 'Tobias B.', m: 'A2 · 3,2', c: 'c6', s: 'pause' },
];

/* --- A: OPERATIONS COCKPIT --- */
function CHVariantA() {
  return (
    <div className="pr1-frame">
      <div className="app">
        <CHSidebar active="home" />
        <main className="main">
          <Topbar
            crumb={<><span>CoachHQ</span>{' / '}<span className="current">Hjem</span></>}
            search="Søk spiller, økt eller plan…"
          />
          <div className="page">
            {/* Hero (left) + KPI strip — hero sits above "Aktive økter i dag" */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, alignItems: 'end' }}>
              <div className="ch-hero" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="eyebrow">COACHHQ · TIRSDAG 23. MAI · UKE 21</div>
                <h1>God morgen, <em>Anders</em></h1>
                <div className="sub" style={{ marginTop: 4 }}>
                  <span className="ok">5 økter i dag</span>
                  <span className="dotsep"></span>
                  3 spillere venter på svar
                  <span className="dotsep"></span>
                  <span className="warn">4 godkjenninger</span>
                  <span className="dotsep"></span>
                  TM-bay full 14–18
                </div>
                <div className="row-actions" style={{ marginTop: 12 }}>
                  <button className="btn btn-outline btn-sm"><Ic id="ic-cal"/>Uke-vis</button>
                  <button className="btn btn-outline btn-sm"><Ic id="ic-flag"/>Brennende</button>
                  <button className="btn btn-primary"><Ic id="ic-plus"/>Ny økt</button>
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}></div>

              <div className="kpi featured">
                <span className="lbl">Aktive økter i dag</span>
                <span className="val">5</span>
                <span className="sub">3 utendørs · 2 TM</span>
              </div>
              <div className="kpi">
                <span className="lbl">Påmeldte denne uka</span>
                <span className="val">26 / 38</span>
                <span className="sub ok">↑ 3 vs forrige uke</span>
              </div>
              <div className="kpi">
                <span className="lbl">Brennende oppgaver</span>
                <span className="val" style={{ color: 'var(--danger)' }}>7</span>
                <span className="sub err">2 forsinket &gt; 48t</span>
              </div>
              <div className="kpi">
                <span className="lbl">Stall-helse</span>
                <span className="val" style={{ color: 'var(--success)' }}>82</span>
                <span className="sub ok">2 skader · 1 permisjon</span>
              </div>
            </div>

            {/* Timeline + Side column */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14, alignItems: 'start' }}>
              {/* Today timeline */}
              <div className="card timeline-card">
                <div className="card-head">
                  <span className="ttl">I dag · 5 økter</span>
                  <span className="right">GFGK + TM Bay · <strong style={{color:'var(--fg)'}}>09:00 – 18:00</strong></span>
                </div>
                <div className="timeline">
                  <div className="tl-time">09:00</div>
                  <div className="tl-event fys">
                    <div>
                      <div className="ttl">FYS · Hofte-mobilitet · gruppe A1</div>
                      <div className="meta">60 min · Studio · 4 spillere</div>
                    </div>
                    <div className="right">
                      <div className="pl-stack">
                        <div className="pl-av c1">EN</div>
                        <div className="pl-av c2">IK</div>
                        <div className="pl-av c3">MR</div>
                        <div className="pl-av" style={{ background: 'var(--bg)', color: 'var(--muted)' }}>+1</div>
                      </div>
                    </div>
                  </div>

                  <div className="tl-time">11:00</div>
                  <div className="tl-event tek">
                    <div>
                      <div className="ttl">TEK · Posisjon 3 · Sander H.</div>
                      <div className="meta">90 min · GFGK Bay 2 · video-coaching</div>
                    </div>
                    <div className="right">
                      <div className="pl-stack"><div className="pl-av c4">SH</div></div>
                    </div>
                  </div>

                  <div className="tl-time now">14:00</div>
                  <div className="tl-event slag now">
                    <div>
                      <div className="ttl">SLAG · Wedge-spinn 40–80m · Markus R.</div>
                      <div className="meta">60 min · GFGK Range · TM bay 3 · 5 drills</div>
                    </div>
                    <div className="right">
                      <span className="pill pill-tier" style={{ background: 'var(--brand-accent)' }}>● NÅ</span>
                    </div>
                  </div>

                  <div className="tl-time">15:30</div>
                  <div className="tl-event turn">
                    <div>
                      <div className="ttl">TURN-prep · Olyo Cup #3 · A1-gruppe</div>
                      <div className="meta">60 min · Studio · taktikk-økt</div>
                    </div>
                    <div className="right">
                      <div className="pl-stack">
                        <div className="pl-av c1">EN</div>
                        <div className="pl-av c2">IK</div>
                        <div className="pl-av c3">MR</div>
                      </div>
                    </div>
                  </div>

                  <div className="tl-time">17:00</div>
                  <div className="tl-event">
                    <div>
                      <div className="ttl">Privattime · Anna L.</div>
                      <div className="meta">60 min · Miklagard · langslag-bygging</div>
                    </div>
                    <div className="right">
                      <div className="pl-stack"><div className="pl-av c5">AL</div></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Brenner */}
                <div className="burn-card">
                  <div className="card-head">
                    <span className="ttl-mono" style={{ color: 'var(--danger)' }}>● Brenner · 7</span>
                    <span className="right"><span className="link" style={{ color: 'var(--brand-primary)' }}>Alle →</span></span>
                  </div>
                  <div className="burn-row">
                    <div className="badge">!</div>
                    <div>
                      <div className="ttl">Godkjenn plan · Sander H.</div>
                      <div className="meta">Venter siden 19/5 · 4d</div>
                    </div>
                    <span className="due">4d</span>
                  </div>
                  <div className="burn-row">
                    <div className="badge" style={{ background: 'rgba(184,133,42,0.12)', color: 'var(--warning)' }}>S</div>
                    <div>
                      <div className="ttl">Stripe-feil · Tobias B.</div>
                      <div className="meta">Forsøk 3 av 3 · betalingskort utløpt</div>
                    </div>
                    <span className="due" style={{ color: 'var(--warning)' }}>i dag</span>
                  </div>
                  <div className="burn-row">
                    <div className="badge" style={{ background: 'rgba(0,88,64,0.12)', color: 'var(--brand-primary)' }}>?</div>
                    <div>
                      <div className="ttl">Spørsmål · Emil N.</div>
                      <div className="meta">"Hvilken wedge på 65m?" · venter 6t</div>
                    </div>
                    <span className="due" style={{ color: 'var(--muted)' }}>6t</span>
                  </div>
                </div>

                {/* Workspace */}
                <div className="ws-strip">
                  <div>
                    <div className="ws-label">Workspace</div>
                    <div className="ws-name">Mai-fokus · Notion</div>
                  </div>
                  <div className="ws-tasks">
                    <span className="ws-task">Skriv ukerapport</span>
                    <span className="ws-task">Bestill TM-bay juni</span>
                    <span className="ws-task">Send invitasjon Srixon</span>
                  </div>
                  <button className="btn btn-primary btn-xs">Åpne</button>
                </div>

                {/* Stream */}
                <div className="card">
                  <div className="card-head">
                    <span className="ttl">Strøm · siste timer</span>
                    <span className="right"><span className="link">Se alt →</span></span>
                  </div>
                  <div className="feed-row" style={{ padding: '8px 0' }}>
                    <div className="icon slag"><Ic id="ic-check"/></div>
                    <div>
                      <div className="ttl">Plan godkjent · Ida K.</div>
                      <div className="meta">Forelder bekreftet betaling</div>
                    </div>
                    <span className="time">14min</span>
                  </div>
                  <div className="feed-row" style={{ padding: '8px 0' }}>
                    <div className="icon turn"><Ic id="ic-flag"/></div>
                    <div>
                      <div className="ttl">Emil N. meldte seg på Olyo #3</div>
                      <div className="meta">Avhenger av plan-justering</div>
                    </div>
                    <span className="time">38min</span>
                  </div>
                  <div className="feed-row" style={{ padding: '8px 0' }}>
                    <div className="icon fys"><Ic id="ic-bar"/></div>
                    <div>
                      <div className="ttl">3 nye CMJ-tester logget</div>
                      <div className="meta">Snitt: 46,1 cm · ↑ A1-cohort</div>
                    </div>
                    <span className="time">1t</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stall overview */}
            <div className="card">
              <div className="card-head">
                <span className="ttl">Stall · 38 spillere</span>
                <span className="right">
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>● 31 aktiv</span>
                  <span className="dotsep"></span>
                  <span style={{ color: 'var(--warning)' }}>● 2 skadet</span>
                  <span className="dotsep"></span>
                  <span style={{ color: 'var(--muted-soft)' }}>● 5 pause</span>
                </span>
              </div>
              <div className="stall-grid">
                {STALL.map((p, i) => (
                  <div key={i} className="stall-cell">
                    <div className={`av ${p.c}`}>
                      {p.i}
                      <span className={`status ${p.s}`}></span>
                    </div>
                    <div className="nm">{p.n}</div>
                    <div className="meta">{p.m}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* --- B: HEATMAP DASHBOARD --- */
function CHVariantB() {
  // generate fake heatmap rows
  const rows = [
    { name: 'Emil N.', cells: 'l4,l5,l4,l3,l2,l1,l3,l4,l5,l5,l4,l3,l2,l3' },
    { name: 'Ida K.', cells: 'l3,l4,l3,l2,l1,l1,l2,l3,l4,l4,l3,l2,l2,l3' },
    { name: 'Markus R.', cells: 'l5,l5,l4,l4,l3,l2,l3,l4,l5,l5,l5,l4,l3,l3 acc' },
    { name: 'Sander H.', cells: 'l2,l2,l1,l1,l1,l1,l1,l2,l2,l3,l2,l1,l1,l2' },
    { name: 'Anna L.', cells: 'l3,l3,l2,l2,l1,l2,l3,l3,l4,l3,l3,l4,l4,l5' },
    { name: 'Tobias B.', cells: 'l1,l1,l1,l1,,,l1,l1,l1,l1,l1,l1,l1,l1' },
    { name: 'Jakob V.', cells: 'l4,l4,l3,l3,l4,l3,l4,l5,l5,l5,l4,l4,l3,l4' },
    { name: 'Sara M.', cells: 'l3,l3,l4,l3,l3,l2,l3,l3,l3,l4,l4,l3,l3,l3' },
  ];
  return (
    <div className="pr1-frame">
      <div className="app">
        <CHSidebar />
        <main className="main">
          <Topbar crumb={<><span>CoachHQ</span>{' / '}<span className="current">Hjem · KPI</span></>} search="Søk spiller, økt eller plan…" />
          <div className="page">
            {/* Hero — narrower for KPI focus */}
            <div className="ch-hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <div className="eyebrow">COACHHQ · UKE 21 · 19.–25. MAI 2026</div>
                <h1>Uka i <em>tall</em></h1>
                <div className="sub" style={{ marginTop: 6 }}>
                  82 økter planlagt
                  <span className="dotsep"></span>
                  <span className="ok">74 % hit-rate</span>
                  <span className="dotsep"></span>
                  <span className="warn">3 underutnyttede bay-timer</span>
                </div>
              </div>
              <div className="row-actions">
                <button className="btn btn-outline btn-sm">Periode: <strong>Denne uka</strong></button>
                <button className="btn btn-outline btn-sm"><Ic id="ic-download"/>Eksport</button>
                <button className="btn btn-primary"><Ic id="ic-plus"/>Ny økt</button>
              </div>
            </div>

            {/* KPI strip */}
            <div className="kpi-strip">
              <div className="kpi featured">
                <span className="lbl">Hit-rate · pyramide</span>
                <span className="val">74 %</span>
                <span className="sub">↑ 4 pp vs uke 20</span>
              </div>
              <div className="kpi">
                <span className="lbl">Reps logget</span>
                <span className="val">14 832</span>
                <span className="sub">SLAG 62 % · TEK 26 %</span>
              </div>
              <div className="kpi">
                <span className="lbl">Bay-utnyttelse</span>
                <span className="val">82 %</span>
                <span className="sub warn">3 timer ledig torsdag</span>
              </div>
              <div className="kpi">
                <span className="lbl">Nye PR i uka</span>
                <span className="val">11</span>
                <span className="sub ok">Topp: Markus +320rpm</span>
              </div>
            </div>

            {/* Heatmap */}
            <div className="card">
              <div className="card-head">
                <span className="ttl">Drill-tetthet · uke 21</span>
                <div className="heat-legend">
                  <span>Lite</span>
                  <span className="swatch" style={{ background: 'rgba(0,88,64,0.08)' }}></span>
                  <span className="swatch" style={{ background: 'rgba(0,88,64,0.20)' }}></span>
                  <span className="swatch" style={{ background: 'rgba(0,88,64,0.40)' }}></span>
                  <span className="swatch" style={{ background: 'rgba(0,88,64,0.65)' }}></span>
                  <span className="swatch" style={{ background: 'var(--brand-primary)' }}></span>
                  <span>Mye</span>
                </div>
              </div>
              <div className="heatmap">
                <div></div>
                {['M','T','O','T','F','L','S','M','T','O','T','F','L','S'].map((d,i) => (
                  <div key={i} className="hm-axis-x">{d}</div>
                ))}
                {rows.map((r, ri) => {
                  const cells = r.cells.split(',');
                  return (
                    <React.Fragment key={ri}>
                      <div className="hm-axis-y">{r.name}</div>
                      {cells.map((c, ci) => (
                        <div key={ci} className={"hm-cell " + (c.trim())} />
                      ))}
                    </React.Fragment>
                  );
                })}
              </div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 14, letterSpacing: '0.04em' }}>
                ↳ <span style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>Markus R. denne uka</span> — siste celle uthevet med lime kant viser aktiv økt nå
              </div>
            </div>

            {/* Side-by-side: I dag + I morgen */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="card">
                <div className="card-head">
                  <span className="ttl">I dag · 5 økter</span>
                  <span className="right" style={{ color: 'var(--success)', fontWeight: 600 }}>● 14:00 pågår</span>
                </div>
                <div className="feed-row" style={{ padding: '8px 0' }}>
                  <div className="icon fys"><span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700 }}>09</span></div>
                  <div><div className="ttl">FYS · Mobilitet · 4 spillere</div><div className="meta">Studio · 60 min</div></div>
                  <span className="pill pill-ok">FERDIG</span>
                </div>
                <div className="feed-row" style={{ padding: '8px 0' }}>
                  <div className="icon tek"><span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700 }}>11</span></div>
                  <div><div className="ttl">TEK · Pos 3 · Sander H.</div><div className="meta">GFGK bay 2 · 90 min</div></div>
                  <span className="pill pill-ok">FERDIG</span>
                </div>
                <div className="feed-row" style={{ padding: '8px 0' }}>
                  <div className="icon slag"><span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700 }}>14</span></div>
                  <div><div className="ttl">SLAG · Wedge · Markus R.</div><div className="meta">GFGK · TM bay 3 · 60 min</div></div>
                  <span className="pill pill-tier">● NÅ</span>
                </div>
                <div className="feed-row" style={{ padding: '8px 0' }}>
                  <div className="icon turn"><span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700 }}>15</span></div>
                  <div><div className="ttl">TURN-prep · Olyo #3 · A1</div><div className="meta">Studio · 60 min · 3 spillere</div></div>
                  <span className="time">i dag</span>
                </div>
              </div>

              <div className="card">
                <div className="card-head">
                  <span className="ttl">I morgen · forberedelse</span>
                  <span className="right">6 økter planlagt</span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                  <span className="pill pill-fys">2 FYS</span>
                  <span className="pill pill-tek">1 TEK</span>
                  <span className="pill pill-slag">2 SLAG</span>
                  <span className="pill pill-turn">1 TURN</span>
                </div>
                <div className="list-row">
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(184,133,42,0.12)', color: 'var(--warning)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Ic id="ic-alert"/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="ttl">3 spillere mangler økt-bekreftelse</div>
                    <div className="meta">Emil N., Anna L., Jakob V. · frist 21:00 i dag</div>
                  </div>
                  <button className="btn btn-outline btn-xs">Purr</button>
                </div>
                <div className="list-row">
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(42,111,219,0.10)', color: 'var(--info)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Ic id="ic-cloud"/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="ttl">Regn meldt onsdag 09–12</div>
                    <div className="meta">2 utendørs-økter foreslås flyttes til studio</div>
                  </div>
                  <button className="btn btn-primary btn-xs">Vurder</button>
                </div>
                <div className="list-row">
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(0,88,64,0.10)', color: 'var(--brand-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Ic id="ic-tm"/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="ttl">TM-bay 1 ledig 14:00–16:00</div>
                    <div className="meta">Foreslå Sander H. for posisjons-test</div>
                  </div>
                  <button className="btn btn-outline btn-xs">Tildel</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* --- C: MAGAZINE STYLE --- */
function CHVariantC() {
  return (
    <div className="pr1-frame">
      <div className="app">
        <CHSidebar />
        <main className="main">
          <Topbar crumb={<><span>CoachHQ</span>{' / '}<span className="current">Hjem</span></>} search="Søk spiller, økt eller plan…" />
          <div className="page">
            {/* Quote hero */}
            <div className="quote-hero">
              <div className="ql">
                <div className="eyebrow">UKENS MOTTO · UKE 21</div>
                <h2>"Spinn er en konsekvens av kontakt, ikke et mål i seg selv."</h2>
                <div className="attrib">— Mac O'Grady · på en regnvåt morgen i 1987</div>
              </div>
              <div className="greet">
                <div className="l">CoachHQ · 23. mai</div>
                <div className="v">God morgen, <em>Anders</em></div>
              </div>
            </div>

            {/* Uneven grid */}
            <div className="uneven-grid">
              {/* Big — 2x1 — Today's headline */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 22px', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                  <div className="eyebrow">LEDER · 5 ØKTER I DAG</div>
                  <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em', marginTop: 6 }}>
                    Wedge-spinn med <em>Markus</em> kl 14
                  </h2>
                </div>
                <div style={{ padding: '20px 22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  <div>
                    <div className="label-mono">Hvorfor</div>
                    <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--muted)', lineHeight: 1.45, marginTop: 6 }}>
                      Mai-blokken handler om spinn-kontroll i scoring-sonen. Markus' hit-rate på 60m er allerede 72 %, men variabiliteten er fortsatt høy mellom 40 og 50m.
                    </p>
                    <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                      <span className="pill pill-slag"><span className="ldot"></span>SLAG 70 %</span>
                      <span className="pill pill-tek"><span className="ldot"></span>TEK 30 %</span>
                    </div>
                  </div>
                  <div>
                    <div className="label-mono">Måltall</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
                      <div>
                        <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--brand-primary)' }}>11–12k</div>
                        <div className="mono" style={{ fontSize: 9.5, color: 'var(--muted)', letterSpacing: '0.10em', textTransform: 'uppercase', marginTop: 2 }}>RPM</div>
                      </div>
                      <div>
                        <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--brand-primary)' }}>±3m</div>
                        <div className="mono" style={{ fontSize: 9.5, color: 'var(--muted)', letterSpacing: '0.10em', textTransform: 'uppercase', marginTop: 2 }}>STREDE</div>
                      </div>
                      <div>
                        <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--brand-primary)' }}>5</div>
                        <div className="mono" style={{ fontSize: 9.5, color: 'var(--muted)', letterSpacing: '0.10em', textTransform: 'uppercase', marginTop: 2 }}>DRILLS</div>
                      </div>
                      <div>
                        <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--brand-primary)' }}>60m</div>
                        <div className="mono" style={{ fontSize: 9.5, color: 'var(--muted)', letterSpacing: '0.10em', textTransform: 'uppercase', marginTop: 2 }}>VARIGHET</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="pl-stack">
                    <div className="pl-av c3" style={{ width: 30, height: 30, fontSize: 11 }}>MR</div>
                  </div>
                  <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', letterSpacing: '0.04em' }}>
                    Markus R.P. · A1 · +3,5 · GFGK · TM bay 3 · 14:00
                  </div>
                  <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>Åpne brief<Ic id="ic-arrow-right"/></button>
                </div>
              </div>

              {/* Right top */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="label-mono" style={{ color: 'var(--danger)' }}>● BRENNER · 7</div>
                <div className="burn-row" style={{ padding: '6px 0' }}>
                  <div className="badge">!</div>
                  <div><div className="ttl">Plan-godkjenn · Sander</div><div className="meta">venter 4d</div></div>
                </div>
                <div className="burn-row" style={{ padding: '6px 0' }}>
                  <div className="badge" style={{ background: 'rgba(184,133,42,0.12)', color: 'var(--warning)' }}>S</div>
                  <div><div className="ttl">Stripe-feil · Tobias</div><div className="meta">kort utløpt</div></div>
                </div>
                <div className="burn-row" style={{ padding: '6px 0', borderBottom: 0 }}>
                  <div className="badge" style={{ background: 'rgba(0,88,64,0.12)', color: 'var(--brand-primary)' }}>?</div>
                  <div><div className="ttl">Spørsmål · Emil N.</div><div className="meta">venter 6t</div></div>
                </div>
                <button className="btn btn-outline btn-sm" style={{ marginTop: 'auto', justifyContent: 'center' }}>Åpne alle 7 →</button>
              </div>

              {/* Right bottom */}
              <div className="card" style={{ background: 'var(--brand-primary-dark)', color: '#fff', borderColor: 'transparent' }}>
                <div className="label-mono" style={{ color: 'rgba(209,248,67,0.7)' }}>STALL-HELSE</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 700, color: 'var(--brand-accent)' }}>82</span>
                  <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>/ 100</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
                  <div>
                    <div className="mono" style={{ fontSize: 9.5, color: 'rgba(209,248,67,0.65)', letterSpacing: '0.10em' }}>AKTIV</div>
                    <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginTop: 2 }}>31 / 38</div>
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: 9.5, color: 'rgba(209,248,67,0.65)', letterSpacing: '0.10em' }}>SKADE</div>
                    <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: '#F5C8C8', marginTop: 2 }}>2</div>
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: 9.5, color: 'rgba(209,248,67,0.65)', letterSpacing: '0.10em' }}>PAUSE</div>
                    <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginTop: 2 }}>5</div>
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: 9.5, color: 'rgba(209,248,67,0.65)', letterSpacing: '0.10em' }}>VENTER</div>
                    <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--brand-accent)', marginTop: 2 }}>4</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3-column features */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <div className="card">
                <div className="label-mono">Ukens fremgang</div>
                <h3 style={{ fontSize: 16, marginTop: 6 }}>11 nye PR</h3>
                <div className="feed-row" style={{ padding: '8px 0' }}>
                  <div className="icon slag"><Ic id="ic-up"/></div>
                  <div><div className="ttl">Markus · wedge-spinn +320rpm</div><div className="meta">PR-ny</div></div>
                </div>
                <div className="feed-row" style={{ padding: '8px 0', borderBottom: 0 }}>
                  <div className="icon fys"><Ic id="ic-up"/></div>
                  <div><div className="ttl">Emil · CMJ 51,8 cm</div><div className="meta">+2,1 cm</div></div>
                </div>
              </div>
              <div className="card">
                <div className="label-mono">Påmeldinger</div>
                <h3 style={{ fontSize: 16, marginTop: 6 }}>Olyo Cup #3 · 8/12</h3>
                <div className="progress" style={{ marginTop: 12 }}><div style={{ width: '67%' }}></div></div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 10, letterSpacing: '0.04em' }}>
                  Frist 28/5 · 4 plasser igjen
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                  <span className="pill pill-cohort">A1 · 5</span>
                  <span className="pill pill-cohort">A2 · 3</span>
                </div>
              </div>
              <div className="card">
                <div className="label-mono">Innboks · 7 uleste</div>
                <h3 style={{ fontSize: 16, marginTop: 6 }}>3 spillere venter</h3>
                <div className="feed-row" style={{ padding: '6px 0' }}>
                  <div className="icon"><Ic id="ic-msg"/></div>
                  <div><div className="ttl">Emil N. · spørsmål</div><div className="meta">"Hvilken wedge på 65m?"</div></div>
                </div>
                <div className="feed-row" style={{ padding: '6px 0', borderBottom: 0 }}>
                  <div className="icon"><Ic id="ic-msg"/></div>
                  <div><div className="ttl">Foreldre · Ida K.</div><div className="meta">faktura-spørsmål</div></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* --- MOBILE A — CoachHQ on the go --- */
function CHMobile() {
  return (
    <div className="pr1-frame mobile">
      <div className="m-status">
        <span>09:42</span>
        <span className="right">
          <span>5G</span>
          <span style={{ marginLeft: 4 }}>●●●●○</span>
          <span style={{ marginLeft: 4 }}>82%</span>
        </span>
      </div>
      <div className="m-hero">
        <div className="row">
          <div className="av" style={{ background: 'var(--brand-accent)', color: 'var(--brand-primary)' }}>AK</div>
          <div>
            <div className="eyebrow">COACHHQ · 23. MAI</div>
            <h1>Morn, <em>Anders</em></h1>
          </div>
          <button className="top-icon" style={{ color: '#fff', position: 'relative' }}>
            <Ic id="ic-bell"/>
            <span className="dot" style={{ background: 'var(--danger)' }}></span>
          </button>
        </div>
        <div className="pill-row">
          <span className="pill acc">5 ØKTER</span>
          <span className="pill">7 BRENNER</span>
          <span className="pill">38 SPILLERE</span>
        </div>
      </div>

      <div className="m-body">
        <div className="m-kpi">
          <div className="kpi">
            <span className="lbl">Aktive uka</span>
            <span className="val">26/38</span>
            <span className="sub ok">↑ 3</span>
          </div>
          <div className="kpi">
            <span className="lbl">Stall-helse</span>
            <span className="val" style={{ color: 'var(--success)' }}>82</span>
            <span className="sub">av 100</span>
          </div>
        </div>

        <div className="card" style={{ padding: 14 }}>
          <div className="card-head">
            <span className="ttl-mono">I dag · 5 økter</span>
            <span className="pill pill-tier" style={{ background: 'var(--brand-accent)' }}>● 14:00</span>
          </div>
          <div className="feed-row" style={{ padding: '6px 0' }}>
            <div className="icon fys"><span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700 }}>09</span></div>
            <div><div className="ttl" style={{ fontSize: 12 }}>FYS · Mobilitet · 4 spillere</div><div className="meta">Studio</div></div>
            <span className="pill pill-ok">✓</span>
          </div>
          <div className="feed-row" style={{ padding: '6px 0' }}>
            <div className="icon slag"><span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700 }}>14</span></div>
            <div><div className="ttl" style={{ fontSize: 12 }}>SLAG · Wedge · Markus</div><div className="meta">TM bay 3</div></div>
            <span className="pill pill-tier" style={{ background: 'var(--brand-accent)' }}>NÅ</span>
          </div>
          <div className="feed-row" style={{ padding: '6px 0', borderBottom: 0 }}>
            <div className="icon turn"><span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700 }}>17</span></div>
            <div><div className="ttl" style={{ fontSize: 12 }}>Privat · Anna L.</div><div className="meta">Miklagard</div></div>
            <Ic id="ic-chev-r" style={{ width: 14, height: 14, color: 'var(--muted)' }}/>
          </div>
        </div>

        <div className="burn-card" style={{ padding: 14 }}>
          <div className="card-head">
            <span className="ttl-mono" style={{ color: 'var(--danger)' }}>● BRENNER · 7</span>
            <span className="link" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--brand-primary)' }}>Alle →</span>
          </div>
          <div className="burn-row" style={{ padding: '6px 0' }}>
            <div className="badge">!</div>
            <div><div className="ttl" style={{ fontSize: 12 }}>Plan · Sander H.</div><div className="meta">venter 4d</div></div>
            <span className="due">4d</span>
          </div>
          <div className="burn-row" style={{ padding: '6px 0', borderBottom: 0 }}>
            <div className="badge" style={{ background: 'rgba(184,133,42,0.12)', color: 'var(--warning)' }}>S</div>
            <div><div className="ttl" style={{ fontSize: 12 }}>Stripe-feil · Tobias</div><div className="meta">kort utløpt</div></div>
            <span className="due" style={{ color: 'var(--warning)' }}>i dag</span>
          </div>
        </div>

        <div className="m-section">
          <h3>Stall · 38</h3>
          <div className="stall-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {STALL.slice(0,4).map((p, i) => (
              <div key={i} className="stall-cell" style={{ padding: '8px 4px' }}>
                <div className={`av ${p.c}`} style={{ width: 32, height: 32, fontSize: 11 }}>
                  {p.i}
                  <span className={`status ${p.s}`}></span>
                </div>
                <div className="nm" style={{ fontSize: 10 }}>{p.n}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <nav className="m-nav">
        <div className="tab active"><Ic id="ic-home"/>Hjem</div>
        <div className="tab"><Ic id="ic-cal"/>Kal.</div>
        <div className="tab"><Ic id="ic-users"/>Stall</div>
        <div className="tab"><Ic id="ic-msg"/>Innboks</div>
        <div className="tab"><Ic id="ic-bar"/>Innsikt</div>
      </nav>
    </div>
  );
}

Object.assign(window, { CHVariantA, CHVariantB, CHVariantC, CHMobile });
