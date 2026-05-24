// pr2-spiller-detalj.jsx — Screen 3: /admin/spillere/[id]

/* --- Variant A: Tab-based --- */
function SpillerDetaljA() {
  return (
    <div className="pr1-frame">
      <div className="app">
        <CHSidebar active="" />
        <main className="main">
          <Topbar
            crumb={<><span>CoachHQ</span>{' / '}<span>Stall</span>{' / '}<span className="current">Markus R. Pedersen</span></>}
            search="Søk spiller, økt eller plan…"
          />
          <div className="page">
            <PlayerHero />
            <PlayerTabs active="profil" />
            <PlayerKpis />

            {/* 2-column body */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, alignItems: 'start' }}>
              {/* LEFT — Personalia + Parents + Activity */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Personalia */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span className="ttl-mono">Personalia</span>
                    <a style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--brand-primary)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', textDecoration: 'none' }}>Rediger →</a>
                  </div>
                  <div className="fact-grid">
                    <Fact k="Fullt navn" v="Markus Røstad Pedersen" />
                    <Fact k="Fødselsdato" v="14. mars 2009" mono />
                    <Fact k="Alder · Aldersgruppe" v="17 år · U18" />
                    <Fact k="Kjønn" v="Mann" />
                    <Fact k="Telefon" v="+47 412 33 567" mono />
                    <Fact k="E-post" v="markus.rp@gmail.com" />
                    <Fact k="Klubb" v="Grenland & Farsund GK" />
                    <Fact k="Klubb-nr." v="2009-031-A" mono />
                    <Fact k="Adresse" v="Bjerkeveien 12, 3960 Stathelle" />
                    <Fact k="Coaching siden" v="aug. 2023 · 2y 9mnd" mono />
                  </div>
                </div>

                {/* Parents / verge */}
                <div className="card">
                  <div className="card-head">
                    <span className="ttl">Foreldre · verge</span>
                    <button className="btn btn-outline btn-xs"><Ic id="ic-plus"/>Legg til</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div className="parent-card">
                      <div className="av">KP</div>
                      <div>
                        <div className="nm">Kari Pedersen</div>
                        <div className="rel">Mor · Stripe-betaler</div>
                        <div className="ct">+47 901 22 134 · kari.p@vit.no</div>
                      </div>
                      <span className="pill pill-ok"><span className="ldot"></span>BETALER</span>
                    </div>
                    <div className="parent-card">
                      <div className="av" style={{ background: '#DCE7E1', color: '#005840' }}>JP</div>
                      <div>
                        <div className="nm">Jon Pedersen</div>
                        <div className="rel">Far</div>
                        <div className="ct">+47 988 65 442</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity timeline */}
                <div className="card">
                  <div className="card-head">
                    <span className="ttl">Aktivitet · siste 30 dager</span>
                    <span className="right"><span className="link" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>Hele historikken →</span></span>
                  </div>
                  <div className="v-timeline">
                    <div className="vt-date now">i dag<br/><strong style={{ color: 'var(--fg)' }}>14:00</strong></div>
                    <div>
                      <div className="vt-event">
                        <div className="ic slag"><Ic id="ic-clipboard"/></div>
                        <div>
                          <div className="ttl">Drill-økt · Wedge-spinn 40–80m</div>
                          <div className="meta">GFGK · TM bay 3 · 60 min · 5 drills · planlagt</div>
                        </div>
                        <div className="right">planlagt</div>
                      </div>
                    </div>
                    <div className="vt-date">22. mai</div>
                    <div>
                      <div className="vt-event">
                        <div className="ic msg"><Ic id="ic-msg"/></div>
                        <div>
                          <div className="ttl">Spørsmål · "Hvilken wedge på 65m?"</div>
                          <div className="meta">til Anders · ubesvart i 6 timer</div>
                        </div>
                        <div className="right">06:32</div>
                      </div>
                    </div>
                    <div className="vt-date">21. mai</div>
                    <div>
                      <div className="vt-event">
                        <div className="ic slag"><Ic id="ic-up"/></div>
                        <div>
                          <div className="ttl">PR · Wedge-spinn 60m · 10 850 rpm</div>
                          <div className="meta">+320 rpm vs forrige · TM-bekreftet</div>
                        </div>
                        <div className="right">i går</div>
                      </div>
                      <div className="vt-event">
                        <div className="ic turn"><Ic id="ic-flag"/></div>
                        <div>
                          <div className="ttl">Påmeldt Olyo Cup #3</div>
                          <div className="meta">GFGK · 12.–14. juni · betalt</div>
                        </div>
                        <div className="right">15:14</div>
                      </div>
                    </div>
                    <div className="vt-date">17. mai</div>
                    <div>
                      <div className="vt-event">
                        <div className="ic fys"><Ic id="ic-bar"/></div>
                        <div>
                          <div className="ttl">CMJ-test · 48,2 cm</div>
                          <div className="meta">↑ 1,4 cm vs forrige · A1-snitt: 45,6 cm</div>
                        </div>
                        <div className="right">10:05</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT — Coach notes + DNA radar + quick actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="coach-note">
                  <div className="quote">"Markus har stor teknisk progresjon, men trenger fortsatt mental robusthet i turnerings-press. Fokus til vinter: pre-shot rutine 7 sek + putting under 2,5m."</div>
                  <div className="sig">
                    <div className="av">AK</div>
                    <span>ANDERS KVAM · OPPDATERT 21. MAI</span>
                  </div>
                </div>

                <div className="card">
                  <div className="card-head">
                    <span className="ttl">Spiller-DNA</span>
                    <span className="right">vs A1-snitt</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 16px' }}>
                    <Radar size={240} />
                  </div>
                  <div className="radar-legend-foot">
                    <span><span className="sw" style={{ background: '#005840' }}></span>Markus</span>
                    <span><span className="sw" style={{ background: '#908D86' }}></span>A1-snitt</span>
                  </div>
                </div>

                <div className="card">
                  <div className="card-head">
                    <span className="ttl">Snarveier</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <button className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}><Ic id="ic-target"/>Ny test</button>
                    <button className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}><Ic id="ic-clipboard"/>Plan-justering</button>
                    <button className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}><Ic id="ic-flag"/>Meld turnering</button>
                    <button className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}><Ic id="ic-clock"/>Be om permisjon</button>
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

/* --- Variant B: Split-view (no tabs) --- */
function SpillerDetaljB() {
  return (
    <div className="pr1-frame">
      <div className="app">
        <CHSidebar active="" />
        <main className="main">
          <Topbar
            crumb={<><span>CoachHQ</span>{' / '}<span>Stall</span>{' / '}<span className="current">Markus R. Pedersen</span></>}
            search="Søk spiller, økt eller plan…"
          />
          <div className="page">
            <PlayerHero />
            <PlayerKpis />

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14, alignItems: 'start' }}>
              {/* LEFT 60% */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Personalia compact */}
                <div className="card">
                  <div className="card-head">
                    <span className="ttl">Personalia</span>
                    <span className="right"><span className="link" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>Rediger →</span></span>
                  </div>
                  <div className="fact-grid">
                    <Fact k="Telefon" v="+47 412 33 567" mono />
                    <Fact k="E-post" v="markus.rp@gmail.com" />
                    <Fact k="Klubb" v="Grenland & Farsund GK" />
                    <Fact k="Klubb-nr." v="2009-031-A" mono />
                    <Fact k="Adresse" v="Bjerkeveien 12, 3960 Stathelle" />
                    <Fact k="Coaching siden" v="aug. 2023 · 2y 9mnd" mono />
                  </div>
                </div>

                {/* Parents */}
                <div className="card">
                  <div className="card-head">
                    <span className="ttl">Foreldre · verge</span>
                    <button className="btn btn-outline btn-xs"><Ic id="ic-plus"/>Legg til</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div className="parent-card">
                      <div className="av">KP</div>
                      <div>
                        <div className="nm">Kari Pedersen</div>
                        <div className="rel">Mor · Stripe</div>
                        <div className="ct">+47 901 22 134</div>
                      </div>
                      <span className="pill pill-ok"><span className="ldot"></span>BETALER</span>
                    </div>
                    <div className="parent-card">
                      <div className="av" style={{ background: '#DCE7E1', color: '#005840' }}>JP</div>
                      <div>
                        <div className="nm">Jon Pedersen</div>
                        <div className="rel">Far</div>
                        <div className="ct">+47 988 65 442</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spiller-DNA */}
                <div className="card">
                  <div className="card-head">
                    <span className="ttl">Spiller-DNA · 5-akset</span>
                    <span className="right">vs A1-snitt</span>
                  </div>
                  <div className="radar-wrap">
                    <Radar size={280} />
                    <div className="radar-legend">
                      {[
                        { k: 'FYS', m: 62, c: 55 },
                        { k: 'TEK', m: 78, c: 62 },
                        { k: 'SLAG', m: 71, c: 58 },
                        { k: 'SPILL', m: 58, c: 60 },
                        { k: 'TURN', m: 64, c: 55 },
                      ].map(a => (
                        <div key={a.k} className="radar-leg-row">
                          <div className="axis">{a.k}</div>
                          <div className="bar">
                            <div className="me" style={{ width: `${a.m}%` }}></div>
                          </div>
                          <div className="v">{a.m}</div>
                        </div>
                      ))}
                      <div className="radar-legend-foot">
                        <span><span className="sw" style={{ background: '#005840' }}></span>Markus</span>
                        <span><span className="sw" style={{ background: '#908D86' }}></span>A1-snitt</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Goals */}
                <div className="card">
                  <div className="card-head">
                    <span className="ttl">Aktive mål · 3</span>
                    <button className="btn btn-outline btn-xs"><Ic id="ic-plus"/>Nytt mål</button>
                  </div>
                  <div className="goal-grid">
                    <div className="goal">
                      <div className="gtype">Resultat</div>
                      <h4>HCP 3,8 innen 14. juli</h4>
                      <div className="gprog-ring">
                        <ProgressRing value={64} />
                        <div>
                          <div className="ring-num">64<span className="u">%</span></div>
                          <div className="gprog-meta">52 dager igjen</div>
                        </div>
                      </div>
                      <div className="gfoot">Krever 2 turneringer + 3 runder på par eller bedre.</div>
                    </div>
                    <div className="goal">
                      <div className="gtype">Prosess</div>
                      <h4>Pre-shot rutine 7 sek</h4>
                      <div className="gprog-ring">
                        <ProgressRing value={42} color="#B8852A" />
                        <div>
                          <div className="ring-num">42<span className="u">%</span></div>
                          <div className="gprog-meta">målt 14/30 økter</div>
                        </div>
                      </div>
                      <div className="gfoot">Coach noterer på hver økt. Mai: 9,4s snitt.</div>
                    </div>
                    <div className="goal">
                      <div className="gtype">Atferd</div>
                      <h4>Logg alle økter samme dag</h4>
                      <div className="gprog-ring">
                        <ProgressRing value={88} color="#2C7D52" />
                        <div>
                          <div className="ring-num">88<span className="u">%</span></div>
                          <div className="gprog-meta">29/33 økter</div>
                        </div>
                      </div>
                      <div className="gfoot">På riktig vei. 3 økter mai mangler TM-data.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT 40% */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="coach-note">
                  <div className="quote">"Stor teknisk progresjon — fokus til vinter: pre-shot rutine 7 sek + putting under 2,5m."</div>
                  <div className="sig">
                    <div className="av">AK</div>
                    <span>ANDERS KVAM · 21. MAI</span>
                  </div>
                </div>

                <div className="card">
                  <div className="card-head">
                    <span className="ttl">Aktivitet</span>
                    <span className="right">siste 14 dager</span>
                  </div>
                  <div className="v-timeline" style={{ gridTemplateColumns: '60px 1fr', gap: 10 }}>
                    <div className="vt-date now">i dag</div>
                    <div>
                      <div className="vt-event">
                        <div className="ic slag"><Ic id="ic-clipboard"/></div>
                        <div>
                          <div className="ttl">Wedge-økt 14:00</div>
                          <div className="meta">GFGK · 60 min</div>
                        </div>
                      </div>
                    </div>
                    <div className="vt-date">i går</div>
                    <div>
                      <div className="vt-event">
                        <div className="ic slag"><Ic id="ic-up"/></div>
                        <div>
                          <div className="ttl">PR · spinn 10 850 rpm</div>
                          <div className="meta">+320 rpm</div>
                        </div>
                      </div>
                      <div className="vt-event">
                        <div className="ic turn"><Ic id="ic-flag"/></div>
                        <div>
                          <div className="ttl">Påmeldt Olyo #3</div>
                          <div className="meta">12. juni</div>
                        </div>
                      </div>
                    </div>
                    <div className="vt-date">6d</div>
                    <div>
                      <div className="vt-event">
                        <div className="ic fys"><Ic id="ic-bar"/></div>
                        <div>
                          <div className="ttl">CMJ 48,2 cm</div>
                          <div className="meta">+1,4 vs forrige</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-head">
                    <span className="ttl">Snarveier</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button className="btn btn-primary" style={{ justifyContent: 'flex-start' }}><Ic id="ic-msg"/>Send melding til Markus</button>
                    <button className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}><Ic id="ic-target"/>Tildel ny test</button>
                    <button className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}><Ic id="ic-clipboard"/>Foreslå plan-justering</button>
                    <button className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}><Ic id="ic-clock"/>Be om permisjon</button>
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

/* --- Mobile --- */
function SpillerDetaljMobile() {
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
      <div style={{ padding: '16px 18px', background: 'var(--card)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="top-icon" style={{ marginLeft: -8 }}><Ic id="ic-arrow-left"/></button>
        <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', letterSpacing: '0.10em', textTransform: 'uppercase' }}>Stall · spiller</div>
      </div>

      <div className="m-body" style={{ height: 'calc(100% - 36px - 52px - 64px)' }}>
        {/* Compact player hero */}
        <div className="card" style={{ padding: 14, display: 'grid', gridTemplateColumns: '56px 1fr', gap: 12, alignItems: 'center' }}>
          <div className="av c3" style={{ width: 56, height: 56, fontSize: 18 }}>MR</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>
              Markus R. <em>Pedersen</em>
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
              <span className="pill pill-cohort">A1</span>
              <span className="pill pill-tier">+4,8</span>
              <span className="pill" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>17Y</span>
              <span className="pill pill-pro">PRO</span>
            </div>
          </div>
        </div>

        {/* Action bar (2x2) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <button className="btn btn-primary btn-sm" style={{ justifyContent: 'center' }}><Ic id="ic-msg"/>Melding</button>
          <button className="btn btn-outline btn-sm" style={{ justifyContent: 'center' }}><Ic id="ic-target"/>Test</button>
          <button className="btn btn-outline btn-sm" style={{ justifyContent: 'center' }}><Ic id="ic-plus"/>Ny økt</button>
          <button className="btn btn-outline btn-sm" style={{ justifyContent: 'center' }}><Ic id="ic-more"/>Mer</button>
        </div>

        {/* Tabs - horiz scroll */}
        <div className="tabs" style={{ overflowX: 'auto', flexShrink: 0, fontSize: 12 }}>
          <div className="tab active" style={{ padding: '10px 14px', fontSize: 12.5 }}>Profil</div>
          <div className="tab" style={{ padding: '10px 14px', fontSize: 12.5 }}>Plan</div>
          <div className="tab" style={{ padding: '10px 14px', fontSize: 12.5 }}>Tester <span className="badge">12</span></div>
          <div className="tab" style={{ padding: '10px 14px', fontSize: 12.5 }}>Analyse</div>
          <div className="tab" style={{ padding: '10px 14px', fontSize: 12.5 }}>Notater</div>
        </div>

        {/* KPI 2x2 */}
        <div className="m-kpi">
          <div className="kpi compact featured">
            <span className="lbl">HCP</span>
            <span className="val">+4,8</span>
            <span className="sub">↓ 0,4</span>
          </div>
          <div className="kpi compact">
            <span className="lbl">SG-total</span>
            <span className="val" style={{ color: 'var(--brand-primary)' }}>−1,6</span>
            <span className="sub">A1: −2,2</span>
          </div>
          <div className="kpi compact">
            <span className="lbl">Tester</span>
            <span className="val">12/36</span>
            <span className="sub">2 forfaller</span>
          </div>
          <div className="kpi compact">
            <span className="lbl">Neste</span>
            <span className="val" style={{ fontSize: 14 }}>I dag 14</span>
            <span className="sub">Putt</span>
          </div>
        </div>

        <div className="coach-note" style={{ padding: 14 }}>
          <div className="quote" style={{ fontSize: 14 }}>"Pre-shot rutine 7 sek + putting under 2,5m er fokus til vinter."</div>
          <div className="sig" style={{ fontSize: 10 }}>
            <div className="av">AK</div>
            <span>ANDERS · 21. MAI</span>
          </div>
        </div>

        <div className="card" style={{ padding: 14 }}>
          <div className="card-head">
            <span className="ttl-mono">Aktivitet</span>
            <span className="link" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--brand-primary)' }}>Se alt →</span>
          </div>
          <div className="vt-event" style={{ marginBottom: 6 }}>
            <div className="ic slag"><Ic id="ic-clipboard"/></div>
            <div>
              <div className="ttl" style={{ fontSize: 12 }}>Wedge-økt 14:00</div>
              <div className="meta">GFGK · planlagt</div>
            </div>
            <div className="right">i dag</div>
          </div>
          <div className="vt-event" style={{ marginBottom: 6 }}>
            <div className="ic slag"><Ic id="ic-up"/></div>
            <div>
              <div className="ttl" style={{ fontSize: 12 }}>PR · 10 850 rpm</div>
              <div className="meta">+320 rpm</div>
            </div>
            <div className="right">i går</div>
          </div>
          <div className="vt-event">
            <div className="ic fys"><Ic id="ic-bar"/></div>
            <div>
              <div className="ttl" style={{ fontSize: 12 }}>CMJ 48,2 cm</div>
              <div className="meta">+1,4 vs forrige</div>
            </div>
            <div className="right">17/5</div>
          </div>
        </div>
      </div>

      <nav className="m-nav">
        <div className="tab"><Ic id="ic-home"/>Hjem</div>
        <div className="tab"><Ic id="ic-cal"/>Kal.</div>
        <div className="tab active"><Ic id="ic-users"/>Stall</div>
        <div className="tab"><Ic id="ic-msg"/>Innboks</div>
        <div className="tab"><Ic id="ic-bar"/>Innsikt</div>
      </nav>
    </div>
  );
}

Object.assign(window, { SpillerDetaljA, SpillerDetaljB, SpillerDetaljMobile });
