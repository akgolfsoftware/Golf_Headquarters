// pr1-playerhq.jsx — PlayerHQ Workbench, Variants A / B / C / Mobile A

/* Today's calendar events for PHVariantA — 05:00–24:00 timeline */
const PHA_TODAY_EVENTS = [
  {
    start: '06:30', end: '07:15', kind: 'fys', icon: 'ic-bar',
    title: 'Morgenmobilitet + core',
    short: 'FYS',
    when: 'TIRS 23/5 · 06:30–07:15',
    loc: 'Hjemme · 45 min · egen økt',
    summary: 'Bevegelighet og kjernestabilitet før golf-økten på ettermiddagen.',
    items: [
      'Foam roll · 10 min · hofter + skuldre',
      'Bird-dog · 3 × 8/side',
      'Pallof press · 3 × 10/side',
      'CMJ-aktivering · 5 × 3',
    ],
    tags: ['FYS', '45 MIN', 'EGEN ØKT'],
  },
  {
    start: '09:30', end: '10:00', kind: 'tek', icon: 'ic-msg',
    title: 'Video-review · Anders',
    short: 'TEK · COACH',
    when: 'TIRS 23/5 · 09:30–10:00',
    loc: 'Zoom · 30 min · m/Anders K.',
    summary: 'Gjennomgang av wedge-treff fra mandag — planlegger ettermiddagens drill-økt.',
    items: [
      '3 klipp · 52° / 56°',
      'Spin-tall fra TM mandag',
      'Plan for 14:00-økten',
    ],
    tags: ['TEK', 'COACH 1:1', '30 MIN'],
  },
  {
    start: '14:00', end: '15:00', kind: 'slag', pinned: true, icon: 'ic-clipboard',
    title: 'Wedge-spinn 40–80m',
    short: 'SLAG · 5 DRILLS',
    when: 'TIRS 23/5 · 14:00–15:00',
    loc: 'GFGK Range · TrackMan bay 3',
    summary: 'Dagens hovedøkt. Mål 11k → 12k rpm snitt på 60m. TM-logging på.',
    items: [
      'Drill 1 · 40m gates · 10 baller',
      'Drill 2 · 60m mål · 15 baller · spin-tall',
      'Drill 3 · 80m fade/draw · 10 + 10',
      'Drill 4 · spin-window test · 12 baller',
      'Drill 5 · pressure round · 6 stasjoner',
    ],
    tags: ['SLAG', '60 MIN', '5 DRILLS', 'MAI-BLOKK'],
  },
  {
    start: '17:00', end: '17:30', kind: 'admin', icon: 'ic-alert',
    title: 'Faktura mai · 2 490 kr',
    short: 'ADMIN',
    when: 'TIRS 23/5 · 17:00',
    loc: 'Stripe · auto-trekk',
    summary: 'Medlemskap GFGK · mai 2026. Trekkes automatisk fra registrert kort.',
    items: [
      'Beløp · 2 490 kr',
      'Kort · VISA •••• 4242',
      'Kvittering på e-post',
    ],
    tags: ['ADMIN', 'AUTO', 'STRIPE'],
  },
  {
    start: '19:30', end: '20:00', kind: 'fys', icon: 'ic-heart',
    title: 'Restitusjon + søvnrutine',
    short: 'FYS',
    when: 'TIRS 23/5 · 19:30–20:00',
    loc: 'Hjemme · 30 min',
    summary: 'Pust-protokoll og foam roll for å lande pulsen før leggetid.',
    items: [
      'Foam roll · 10 min',
      '4-7-8 pust · 5 sykluser',
      'Skjerm av kl 21:00',
    ],
    tags: ['FYS', 'RESTITUSJON', '30 MIN'],
  },
];

const PHA_DAY_START = 5;   // 05:00
const PHA_DAY_END = 24;    // 24:00 (19 hours)
const PHA_NOW = '09:42';

function phaPct(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const mins = (h * 60 + m) - PHA_DAY_START * 60;
  return (mins / ((PHA_DAY_END - PHA_DAY_START) * 60)) * 100;
}

function PHADayCalendar() {
  const hours = Array.from({ length: PHA_DAY_END - PHA_DAY_START }, (_, i) => PHA_DAY_START + i);
  const nowPct = phaPct(PHA_NOW);

  return (
    <div className="focus-card cal-card">
      <div className="card-head">
        <span className="ttl-mono">Dagens kalender</span>
        <span className="right">
          Tirs 23. mai · <strong style={{ color: 'var(--fg)' }}>{PHA_TODAY_EVENTS.length} ting</strong>
          <span className="dotsep"></span>
          <span style={{ color: 'var(--danger)', fontWeight: 700, letterSpacing: '0.08em' }}>
            ● NÅ {PHA_NOW}
          </span>
        </span>
      </div>

      <div className="cal-track">
        <div className="cal-hours">
          {hours.map(h => (
            <span key={h} className={`cal-h${h % 3 === 0 ? ' major' : ''}`}>
              {String(h).padStart(2, '0')}
            </span>
          ))}
        </div>

        <div className="cal-row">
          <div className="cal-grid" aria-hidden="true">
            {hours.map(h => (
              <div key={h} className={`cal-gl${h % 3 === 0 ? ' major' : ''}`}></div>
            ))}
          </div>

          <div className="cal-now-line" style={{ left: `${nowPct}%` }}>
            <span className="now-tag">NÅ</span>
          </div>

          {PHA_TODAY_EVENTS.map((e, i) => {
            const left = phaPct(e.start);
            const right = phaPct(e.end);
            const width = right - left;
            const center = left + width / 2;
            const anchor = center < 18 ? 'l' : center > 78 ? 'r' : 'c';
            const isPast = e.end <= PHA_NOW;
            return (
              <div
                key={i}
                className={`cal-evt ${e.kind}${e.pinned ? ' pinned' : ''}${isPast ? ' past' : ''} anc-${anchor}`}
                style={{ left: `${left}%`, width: `${width}%` }}
                tabIndex={0}
              >
                <div className="cal-evt-inner">
                  <div className="t">{e.title}</div>
                  {width > 4 && <div className="m">{e.short}</div>}
                </div>

                <div className="cal-pop">
                  <div className="pop-when">
                    <Ic id={e.icon}/>
                    <span>{e.when}</span>
                  </div>
                  <div className="pop-t">{e.title}</div>
                  <div className="pop-loc">{e.loc}</div>
                  <div className="pop-sum">{e.summary}</div>
                  <div className="pop-items-label">Innhold</div>
                  <ul className="pop-items">
                    {e.items.map((it, j) => <li key={j}>{it}</li>)}
                  </ul>
                  <div className="pop-tags">
                    {e.tags.map((t, j) => (
                      <span key={j} className={`pop-tag pt-${e.kind}`}>{t}</span>
                    ))}
                  </div>
                  <div className="pop-actions">
                    <button className="btn btn-primary btn-xs">Åpne brief<Ic id="ic-arrow-right"/></button>
                    <button className="btn btn-xs pop-ghost">Endre tid</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="cal-foot">
          <span className="lg"><span className="sw sw-fys"></span>FYS</span>
          <span className="lg"><span className="sw sw-tek"></span>TEK</span>
          <span className="lg"><span className="sw sw-slag"></span>SLAG</span>
          <span className="lg"><span className="sw sw-admin"></span>ADMIN</span>
          <span className="hover-hint">Hold over en økt for å se innholdet →</span>
        </div>
      </div>
    </div>
  );
}

/* --- A: STACK LAYOUT --- */
function PHVariantA() {
  return (
    <div className="pr1-frame">
      <div className="app">
        <PHSidebar active="workbench" />
        <main className="main">
          <Topbar crumb={<><span>PlayerHQ</span>{' / '}<span className="current">Hjem</span></>} />
          <div className="page">
            {/* Hero */}
            <div className="ph-hero">
              <div className="ph-avatar">MR</div>
              <div className="ph-text">
                <div className="eyebrow">PlayerHQ · I dag · TIRS 23. mai</div>
                <h1>God morgen, <em>Markus</em></h1>
                <div className="meta-row">
                  <span className="pill pill-tier">HCP +3,5</span>
                  <span className="pill">A1 KOHORT</span>
                  <span className="mono-sub">14 uker til Sørlandsåpent</span>
                </div>
              </div>
              <div className="weather">
                <div className="lbl">GFGK · Utendørs</div>
                <div className="deg">14°</div>
                <div className="pulse">Live · 4 m/s SV</div>
              </div>
            </div>

            {/* KPI strip */}
            <div className="kpi-strip">
              <div className="kpi featured">
                <span className="lbl">Snittscore · siste 5</span>
                <span className="val">71,4</span>
                <span className="sub">↓ 1,3 vs forrige 5</span>
              </div>
              <div className="kpi">
                <span className="lbl">Neste turnering</span>
                <span className="val" style={{ fontSize: 18 }}>Olyo Cup #3</span>
                <span className="sub">12. juni · GFGK</span>
              </div>
              <div className="kpi">
                <span className="lbl">Tester denne mnd</span>
                <span className="val">8/10</span>
                <span className="sub ok">↑ på plan</span>
              </div>
              <div className="kpi">
                <span className="lbl">HCP-trend · 12 uker</span>
                <Sparkline data={[3.9,3.8,3.6,3.7,3.5,3.6,3.4,3.5,3.4,3.5,3.5,3.5]} width={180} height={32}/>
                <span className="sub" style={{ marginTop: 0 }}>+3,5 · stabil</span>
              </div>
            </div>

            {/* Dagens fokus — kalender 05:00–23:00 m/ hover-preview */}
            <PHADayCalendar />

            {/* Pyramide uke + Coach-ping */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
              <div className="card">
                <div className="card-head">
                  <span className="ttl">Uka i pyramiden</span>
                  <span className="right">Uke 21 · <strong style={{color:'var(--fg)'}}>4 av 7</strong> dager planlagt</span>
                </div>
                <div className="pyr-week">
                  {[
                    { d: 'Man', n: 19, past: true, dots: ['fys','tek'], mins: '90m' },
                    { d: 'Tir', n: 20, past: true, dots: ['slag','slag'], mins: '120m' },
                    { d: 'Ons', n: 21, past: true, dots: ['spill'], mins: '60m' },
                    { d: 'Tor', n: 22, today: true, dots: ['slag','tek'], mins: '60m' },
                    { d: 'Fre', n: 23, dots: ['fys'], mins: '45m' },
                    { d: 'Lør', n: 24, dots: ['turn'], mins: 'TURN' },
                    { d: 'Søn', n: 25, dots: [] },
                  ].map((day, i) => (
                    <div key={i} className={"pyr-day" + (day.today ? ' today' : '') + (day.past ? ' past' : '')}>
                      <div className="d">{day.d}</div>
                      <div className="n">{day.n}</div>
                      <div className="dots">
                        {day.dots.length === 0 ? <span style={{fontFamily:'var(--font-mono)', fontSize:9.5, color:'var(--muted-soft)'}}>—</span>
                          : day.dots.map((c,j) => <span key={j} className={`dot ${c}`}></span>)}
                      </div>
                      <div className="mins">{day.mins || ''}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="coach-ping">
                <div className="av">AK</div>
                <div>
                  <div className="text">"Husk å logge spinn-numre fra økten i dag — vi diskuterer dem mandag."</div>
                  <div className="meta">ANDERS K · 09:42 · 12 MIN SIDEN</div>
                </div>
                <button className="btn btn-forest btn-sm">Svar<Ic id="ic-arrow-right"/></button>
              </div>
            </div>

            {/* Activity feed */}
            <div className="card">
              <div className="card-head">
                <span className="ttl">Siste aktivitet</span>
                <span className="right"><span className="link">Se alt →</span></span>
              </div>
              <div className="feed-row">
                <div className="icon slag"><Ic id="ic-target"/></div>
                <div>
                  <div className="ttl">Ny PR · Wedge-spinn 60m</div>
                  <div className="meta">10 850 rpm snitt · +320 rpm vs forrige</div>
                </div>
                <span className="time">i går</span>
              </div>
              <div className="feed-row">
                <div className="icon turn"><Ic id="ic-flag"/></div>
                <div>
                  <div className="ttl">Påmeldt Olyo Cup #3</div>
                  <div className="meta">GFGK · 12.–14. juni · 36 spillere</div>
                </div>
                <span className="time">i går</span>
              </div>
              <div className="feed-row">
                <div className="icon tek"><Ic id="ic-clipboard"/></div>
                <div>
                  <div className="ttl">Plan godkjent · Mai-blokk</div>
                  <div className="meta">Anders K. godkjente periodisering 19. mai</div>
                </div>
                <span className="time">fre 19/5</span>
              </div>
              <div className="feed-row">
                <div className="icon fys"><Ic id="ic-bar"/></div>
                <div>
                  <div className="ttl">CMJ-test · 48,2 cm</div>
                  <div className="meta">↑ 1,4 cm vs forrige test · A1-snitt: 45,6 cm</div>
                </div>
                <span className="time">ons 17/5</span>
              </div>
            </div>

            {/* CTA bar */}
            <div className="cta-row">
              <div className="meta">Aktiv plan: <strong style={{color:'var(--fg)'}}>Mai-blokk · Spinn-kontroll</strong></div>
              <button className="btn btn-outline btn-sm">Ny økt fra plan</button>
              <button className="btn btn-primary"><Ic id="ic-plus"/>Start dagens økt</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* --- B: 3-COL COMMAND CENTER --- */
function PHVariantB() {
  return (
    <div className="pr1-frame">
      <div className="app">
        <PHSidebar />
        <main className="main">
          <Topbar crumb={<><span>PlayerHQ</span>{' / '}<span className="current">Kommando-senter</span></>} />
          <div className="page">
            {/* compact greeting */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <div className="eyebrow">PlayerHQ · I dag · 23. mai 09:42</div>
                <h1 style={{ fontSize: 26, marginTop: 4, letterSpacing: '-0.015em' }}>
                  God morgen, <em>Markus</em>
                </h1>
                <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, letterSpacing: '0.04em' }}>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>● Garmin tilkoblet</span>
                  <span className="dotsep"></span>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>● TrackMan-bay klar 14:00</span>
                  <span className="dotsep"></span>
                  14 uker til Sørlandsåpent
                </div>
              </div>
              <div className="row-actions">
                <button className="btn btn-outline btn-sm"><Ic id="ic-cal"/>Kalender</button>
                <button className="btn btn-primary"><Ic id="ic-plus"/>Start økt</button>
              </div>
            </div>

            {/* 3 columns */}
            <div className="cmd-3col">
              {/* Left — Active plan */}
              <div className="plan-card">
                <div>
                  <div className="label-mono">AKTIV PLAN</div>
                  <h3>Mai-blokk · <em style={{color:'var(--brand-accent)'}}>Spinn-kontroll</em></h3>
                </div>
                <div className="progress-block">
                  <div className="progress-row">
                    <span className="l">Uke 3 av 4</span>
                    <span className="v">68 %</span>
                  </div>
                  <div className="bar"><div style={{ width: '68%' }}></div></div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div className="label-mono" style={{ color: 'rgba(209,248,67,0.65)' }}>Mål-drill</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: '#fff', marginTop: 4 }}>Wedge-spinn 60m</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>11k → 12k rpm</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="label-mono" style={{ color: 'rgba(209,248,67,0.65)' }}>Hit-rate</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--brand-accent)', marginTop: 4 }}>72 %</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>+6 pp vs uke 1</div>
                  </div>
                </div>
                <div className="milestone">
                  <strong>14d</strong> Neste milepæl: testdag — <span style={{ color: 'var(--brand-accent)' }}>CMJ + wedge-test</span> · 6. juni
                </div>
              </div>

              {/* Middle — Today + burn */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="card">
                  <div className="card-head">
                    <span className="ttl">I dag · 2 ting</span>
                    <span className="right" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>14:00 →</span>
                  </div>
                  <div className="focus-row">
                    <div className="icon-tile"><Ic id="ic-clipboard"/></div>
                    <div>
                      <div className="ttl">Drill · Wedge-spinn 40–80m</div>
                      <div className="meta">GFGK Range · 60 min · 5 drills</div>
                    </div>
                    <button className="btn btn-primary btn-xs">Brief</button>
                  </div>
                  <div className="focus-row">
                    <div className="icon-tile warn"><Ic id="ic-alert"/></div>
                    <div>
                      <div className="ttl">Faktura mai · 2 490 kr</div>
                      <div className="meta">Auto-trekk 17:00 · Stripe</div>
                    </div>
                    <span className="pill pill-warn">17:00</span>
                  </div>
                </div>
                <div className="burn-card">
                  <div className="card-head">
                    <span className="ttl-mono" style={{ color: 'var(--danger)' }}>● Brenner</span>
                    <span className="right">3 punkter</span>
                  </div>
                  <div className="burn-row">
                    <div className="badge">!</div>
                    <div>
                      <div className="ttl">Send sjekkliste til Anders</div>
                      <div className="meta">Forventet 21/5 · 2 dager forsinket</div>
                    </div>
                    <span className="due">2d</span>
                  </div>
                  <div className="burn-row">
                    <div className="badge" style={{ background: 'rgba(184,133,42,0.12)', color: 'var(--warning)' }}>3</div>
                    <div>
                      <div className="ttl">Logg spinn-tall fra GFGK</div>
                      <div className="meta">3 økter mangler TM-data</div>
                    </div>
                    <span className="due" style={{ color: 'var(--warning)' }}>i dag</span>
                  </div>
                  <div className="burn-row">
                    <div className="badge" style={{ background: 'rgba(0,88,64,0.12)', color: 'var(--brand-primary)' }}>P</div>
                    <div>
                      <div className="ttl">Bekreft påmelding · Srixon-cup</div>
                      <div className="meta">Frist 28/5 · 250 kr</div>
                    </div>
                    <span className="due" style={{ color: 'var(--muted)' }}>5d</span>
                  </div>
                </div>
              </div>

              {/* Right — Live */}
              <div className="live-card">
                <div className="card-head">
                  <span className="ttl">Live-data</span>
                  <span className="right" style={{ color: 'var(--success)', fontWeight: 600 }}>● online</span>
                </div>
                <div className="live-stat">
                  <div className="ic heart"><Ic id="ic-heart"/></div>
                  <div>
                    <div className="nm">Hvilepuls</div>
                    <div className="sub">Garmin · 06:12</div>
                  </div>
                  <div className="val">54<span className="u">bpm</span></div>
                </div>
                <div className="live-stat">
                  <div className="ic tm"><Ic id="ic-tm"/></div>
                  <div>
                    <div className="nm">TrackMan bay 3</div>
                    <div className="sub">Reservert 14:00–15:00</div>
                  </div>
                  <span className="pill pill-ok"><span className="ldot"></span>klar</span>
                </div>
                <div className="live-stat">
                  <div className="ic weather"><Ic id="ic-cloud"/></div>
                  <div>
                    <div className="nm">GFGK Range</div>
                    <div className="sub">Skyet · vind 4 m/s SV</div>
                  </div>
                  <div className="val">14<span className="u">°C</span></div>
                </div>
                <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: 12, marginTop: 4 }}>
                  <div className="label-mono">Søvn i natt</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700 }}>7t 24m</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--success)' }}>↑ god kvalitet</span>
                  </div>
                  <div className="progress" style={{ marginTop: 8 }}><div style={{ width: '82%' }}></div></div>
                </div>
              </div>
            </div>

            {/* below — uke + coach side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14 }}>
              <div className="card">
                <div className="card-head">
                  <span className="ttl">Uke 21 · pyramide-fordeling</span>
                  <span className="right">Mål: 50 % SLAG, 30 % TEK, 20 % FYS</span>
                </div>
                <div className="pyr-week">
                  {[
                    { d: 'Man', n: 19, past: true, dots: ['fys','tek'], mins: '90m' },
                    { d: 'Tir', n: 20, past: true, dots: ['slag','slag'], mins: '120m' },
                    { d: 'Ons', n: 21, past: true, dots: ['spill'], mins: '60m' },
                    { d: 'Tor', n: 22, today: true, dots: ['slag','tek'], mins: '60m' },
                    { d: 'Fre', n: 23, dots: ['fys'], mins: '45m' },
                    { d: 'Lør', n: 24, dots: ['turn'], mins: 'TURN' },
                    { d: 'Søn', n: 25, dots: [] },
                  ].map((day, i) => (
                    <div key={i} className={"pyr-day" + (day.today ? ' today' : '') + (day.past ? ' past' : '')}>
                      <div className="d">{day.d}</div>
                      <div className="n">{day.n}</div>
                      <div className="dots">
                        {day.dots.length === 0 ? <span style={{fontFamily:'var(--font-mono)', fontSize:9.5, color:'var(--muted-soft)'}}>—</span>
                          : day.dots.map((c,j) => <span key={j} className={`dot ${c}`}></span>)}
                      </div>
                      <div className="mins">{day.mins || ''}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="coach-ping">
                <div className="av">AK</div>
                <div>
                  <div className="text">"Husk å logge spinn-numre — vi tar dem mandag."</div>
                  <div className="meta">ANDERS K · 09:42</div>
                </div>
                <button className="btn btn-forest btn-sm">Svar</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* --- C: MAGAZINE STYLE --- */
function PHVariantC() {
  return (
    <div className="pr1-frame">
      <div className="app">
        <PHSidebar />
        <main className="main">
          <Topbar crumb={<><span>PlayerHQ</span>{' / '}<span className="current">Hjem</span></>} />
          <div className="page">
            {/* Magazine cover */}
            <div className="mag-cover">
              <div className="mag-inner">
                <div className="eyebrow">UTGAVE 21 · TIRSDAG 23. MAI</div>
                <h1>God morgen, <em>Markus</em></h1>
                <div className="sub">GFGK · 14° · 4 m/s SV · TrackMan bay 3 reservert 14:00</div>
              </div>
              <div className="stats-overlay">
                <div className="stat-block">
                  <div className="l">Snitt 5</div>
                  <div className="v">71,4</div>
                </div>
                <div className="stat-block">
                  <div className="l">HCP</div>
                  <div className="v">+3,5</div>
                </div>
                <div className="stat-block">
                  <div className="l">Til Sør.åpent</div>
                  <div className="v">14u</div>
                </div>
              </div>
            </div>

            {/* 2-col mag grid */}
            <div className="mag-grid">
              {/* Lead story — Today */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{
                  background: 'var(--brand-primary-dark)', color: '#fff',
                  padding: '14px 20px', display: 'flex', justifyContent: 'space-between'
                }}>
                  <div className="eyebrow" style={{ color: 'var(--brand-accent)' }}>LEDER · I DAG</div>
                  <div className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>14:00 · 60 min · 5 drills</div>
                </div>
                <div style={{ padding: 22 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>
                    Wedge-spinn 40–80m
                  </h2>
                  <p style={{
                    fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                    fontSize: 15, color: 'var(--muted)', lineHeight: 1.5, marginTop: 8
                  }}>
                    Mac O'Grady mente at "spinn er en konsekvens av kontakt, ikke et mål i seg selv". I dag jobber vi med å bygge den kontakten gjennom 5 målbare drills.
                  </p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                    <span className="pill pill-slag"><span className="ldot"></span>SLAG · 70 %</span>
                    <span className="pill pill-tek"><span className="ldot"></span>TEK · 30 %</span>
                    <span className="pill pill-info"><span className="ldot"></span>TM-bay 3</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    <button className="btn btn-primary">Åpne brief<Ic id="ic-arrow-right"/></button>
                    <button className="btn btn-outline btn-sm">Se i kalender</button>
                  </div>
                </div>
              </div>

              {/* Side — coach quote */}
              <div className="card dark" style={{ background: 'var(--brand-primary)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <div className="label-mono" style={{ color: 'rgba(209,248,67,0.65)' }}>Fra coachen</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'var(--brand-accent)', color: 'var(--brand-primary)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700
                    }}>AK</div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#fff' }}>Anders K.</div>
                      <div className="mono" style={{ fontSize: 10, color: 'rgba(209,248,67,0.7)' }}>HEAD COACH · 09:42</div>
                    </div>
                  </div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                  fontSize: 17, color: '#fff', lineHeight: 1.4
                }}>"Husk å logge spinn-numre — vi diskuterer dem mandag."</div>
                <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm">Svar Anders</button>
                  <button className="btn btn-xs" style={{ color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(209,248,67,0.30)' }}>Be om plan-justering</button>
                </div>
              </div>
            </div>

            {/* 3-col features */}
            <div className="mag-grid-3">
              <div className="card">
                <div className="label-mono">Ukens fokus</div>
                <h3 style={{ fontSize: 16, marginTop: 6 }}>Spinn-kontroll</h3>
                <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>UKE 3 AV 4 · MAI-BLOKK</div>
                <div className="progress" style={{ marginTop: 12 }}><div style={{ width: '68%' }}></div></div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 8 }}>
                  Hit-rate: <strong style={{ color: 'var(--fg)' }}>72 %</strong> · +6 pp
                </div>
              </div>

              <div className="card">
                <div className="label-mono">Tester · denne mnd</div>
                <h3 style={{ fontSize: 16, marginTop: 6 }}>8 av 10 fullført</h3>
                <div style={{ display: 'flex', gap: 4, marginTop: 12 }}>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} style={{
                      flex: 1, height: 22,
                      background: i < 8 ? 'var(--brand-primary)' : 'var(--border)',
                      borderRadius: 3
                    }}/>
                  ))}
                </div>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 8 }}>
                  CMJ <span style={{ color: 'var(--success)' }}>↑ 1,4cm</span> · siste 17/5
                </div>
              </div>

              <div className="card">
                <div className="label-mono">HCP-trend · 12 uker</div>
                <h3 style={{ fontSize: 16, marginTop: 6 }}>+3,5</h3>
                <Sparkline data={[3.9,3.8,3.6,3.7,3.5,3.6,3.4,3.5,3.4,3.5,3.5,3.5]} width={220} height={42}/>
                <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 4 }}>
                  Stabil · A1-snitt: +4,2
                </div>
              </div>
            </div>

            {/* feed bottom */}
            <div className="card">
              <div className="card-head">
                <span className="ttl">I går & nylig</span>
                <span className="right"><span className="link">Hele feed →</span></span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <div className="feed-row">
                    <div className="icon slag"><Ic id="ic-target"/></div>
                    <div>
                      <div className="ttl">PR · Wedge-spinn 60m · 10 850 rpm</div>
                      <div className="meta">+320 rpm vs forrige</div>
                    </div>
                    <span className="time">i går</span>
                  </div>
                  <div className="feed-row">
                    <div className="icon turn"><Ic id="ic-flag"/></div>
                    <div>
                      <div className="ttl">Påmeldt Olyo Cup #3</div>
                      <div className="meta">GFGK · 12. juni</div>
                    </div>
                    <span className="time">i går</span>
                  </div>
                </div>
                <div>
                  <div className="feed-row">
                    <div className="icon tek"><Ic id="ic-clipboard"/></div>
                    <div>
                      <div className="ttl">Plan godkjent · Mai-blokk</div>
                      <div className="meta">Anders K. · 19/5</div>
                    </div>
                    <span className="time">4d</span>
                  </div>
                  <div className="feed-row">
                    <div className="icon fys"><Ic id="ic-bar"/></div>
                    <div>
                      <div className="ttl">CMJ · 48,2 cm (+1,4)</div>
                      <div className="meta">A1-snitt: 45,6</div>
                    </div>
                    <span className="time">6d</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* --- MOBILE A --- */
function PHMobile() {
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
          <div className="av">MR</div>
          <div>
            <div className="eyebrow">I DAG · 23. MAI</div>
            <h1>Hei, <em>Markus</em></h1>
          </div>
          <button className="top-icon" style={{ color: '#fff' }}><Ic id="ic-bell"/></button>
        </div>
        <div className="pill-row">
          <span className="pill acc">HCP +3,5</span>
          <span className="pill">A1</span>
          <span className="pill">14U TIL SØR.ÅPENT</span>
        </div>
      </div>

      <div className="m-body">
        <div className="m-kpi">
          <div className="kpi">
            <span className="lbl">Snitt 5</span>
            <span className="val">71,4</span>
            <span className="sub ok">↓ 1,3</span>
          </div>
          <div className="kpi">
            <span className="lbl">Tester</span>
            <span className="val">8/10</span>
            <span className="sub">på plan</span>
          </div>
        </div>

        <div className="focus-card">
          <div className="card-head">
            <span className="ttl-mono">I dag · 2 ting</span>
            <span className="pill pill-warn"><span className="ldot"></span>14:00</span>
          </div>
          <div className="focus-row" style={{ padding: '8px 0' }}>
            <div className="icon-tile"><Ic id="ic-clipboard"/></div>
            <div>
              <div className="ttl">Wedge-spinn 40–80m</div>
              <div className="meta">14:00 · GFGK Range · 60 min</div>
            </div>
            <Ic id="ic-chev-r" style={{ width: 14, height: 14, color: 'var(--muted)' }}/>
          </div>
          <div className="focus-row" style={{ padding: '8px 0' }}>
            <div className="icon-tile warn"><Ic id="ic-alert"/></div>
            <div>
              <div className="ttl">Faktura mai · 2 490 kr</div>
              <div className="meta">17:00 · Stripe</div>
            </div>
            <Ic id="ic-chev-r" style={{ width: 14, height: 14, color: 'var(--muted)' }}/>
          </div>
        </div>

        <div className="coach-ping" style={{ gridTemplateColumns: '34px 1fr' }}>
          <div className="av" style={{ width: 34, height: 34, fontSize: 12 }}>AK</div>
          <div>
            <div className="text" style={{ fontSize: 13 }}>"Husk å logge spinn-numre i dag."</div>
            <div className="meta">ANDERS · 12 MIN</div>
          </div>
        </div>

        <div className="m-section">
          <h3>Uka i pyramiden</h3>
          <div className="pyr-week" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {[
              { d: 'M', n: 19, past: true, dots: ['fys','tek'] },
              { d: 'T', n: 20, past: true, dots: ['slag'] },
              { d: 'O', n: 21, past: true, dots: ['spill'] },
              { d: 'T', n: 22, today: true, dots: ['slag','tek'] },
              { d: 'F', n: 23, dots: ['fys'] },
              { d: 'L', n: 24, dots: ['turn'] },
              { d: 'S', n: 25, dots: [] },
            ].map((day, i) => (
              <div key={i} className={"pyr-day" + (day.today ? ' today' : '') + (day.past ? ' past' : '')} style={{ padding: '6px 2px 4px' }}>
                <div className="d">{day.d}</div>
                <div className="n">{day.n}</div>
                <div className="dots">
                  {day.dots.length === 0 ? '·' : day.dots.map((c,j) => <span key={j} className={`dot ${c}`}></span>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" style={{ justifyContent: 'center', padding: '14px 18px', fontSize: 14 }}>
          <Ic id="ic-plus"/>Start dagens økt
        </button>
      </div>

      <nav className="m-nav">
        <div className="tab active"><Ic id="ic-home"/>Hjem</div>
        <div className="tab"><Ic id="ic-cal"/>Plan</div>
        <div className="tab"><Ic id="ic-bar"/>Innsikt</div>
        <div className="tab"><Ic id="ic-msg"/>Coach</div>
        <div className="tab"><Ic id="ic-user"/>Meg</div>
      </nav>
    </div>
  );
}

Object.assign(window, { PHVariantA, PHVariantB, PHVariantC, PHMobile });
