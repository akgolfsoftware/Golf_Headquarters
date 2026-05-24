// pr2-spiller-profil.jsx — Screen 4: /admin/spillere/[id]/profil

function SpillerProfil() {
  return (
    <div className="pr1-frame">
      <div className="app">
        <CHSidebar active="" />
        <main className="main">
          <Topbar
            crumb={<><span>CoachHQ</span>{' / '}<span>Stall</span>{' / '}<span>Markus R.</span>{' / '}<span className="current">Profil</span></>}
            search="Søk spiller, økt eller plan…"
          />
          <div className="page">
            {/* Sub-hero */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <button className="btn btn-outline btn-xs" style={{ marginBottom: 10 }}>
                  <Ic id="ic-arrow-left"/>Tilbake til Markus R. Pedersen
                </button>
                <div className="eyebrow">SPILLER · DETALJ-PROFIL · OPPDATERT 21. MAI</div>
                <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 4 }}>
                  Spiller-<em>profil</em>
                </h1>
              </div>
              <div className="row-actions">
                <button className="btn btn-outline btn-sm"><Ic id="ic-download"/>Eksporter PDF</button>
                <button className="btn btn-primary btn-sm"><Ic id="ic-edit"/>Rediger</button>
              </div>
            </div>

            {/* 1. Personalia */}
            <div className="form-section">
              <div className="sect-head">
                <h3>1 · Personalia</h3>
                <span className="meta">Fra spiller-onboarding · sist endret 12. mai</span>
              </div>
              <div className="fact-grid">
                <Fact k="Fornavn · Mellomnavn" v="Markus Røstad" />
                <Fact k="Etternavn" v="Pedersen" />
                <Fact k="Fødselsdato · Alder" v="14. mars 2009 · 17 år" mono />
                <Fact k="Kjønn" v="Mann" />
                <Fact k="Aldersgruppe" v="U18 · Junior" />
                <Fact k="Telefon" v="+47 412 33 567" mono />
                <Fact k="E-post" v="markus.rp@gmail.com" />
                <Fact k="Personnummer (4 siste)" v="•••• ****" mono />
                <Fact k="Adresse" v="Bjerkeveien 12, 3960 Stathelle" />
                <Fact k="Hjemmeklubb" v="Grenland & Farsund GK" />
                <Fact k="Klubb-nr. · Medlemstype" v="2009-031-A · Junior PRO" mono />
                <Fact k="Sertifiseringer" v="NGF Comp · PGA Junior Star ★★" />
                <Fact k="Coaching-historikk" v="AK Golf siden aug. 2023 · 2y 9mnd" mono />
                <Fact k="Foretrukket språk" v="Norsk · bokmål" />
              </div>
            </div>

            {/* 2. Foreldre */}
            <div className="form-section">
              <div className="sect-head">
                <h3>2 · Foreldre · verge</h3>
                <button className="btn btn-outline btn-xs"><Ic id="ic-plus"/>Legg til</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="parent-card">
                  <div className="av">KP</div>
                  <div>
                    <div className="nm">Kari Pedersen</div>
                    <div className="rel">Mor · primær kontakt</div>
                    <div className="ct">+47 901 22 134 · kari.p@vit.no</div>
                  </div>
                  <span className="pill pill-ok"><span className="ldot"></span>STRIPE BETALER</span>
                </div>
                <div className="parent-card">
                  <div className="av" style={{ background: '#DCE7E1', color: '#005840' }}>JP</div>
                  <div>
                    <div className="nm">Jon Pedersen</div>
                    <div className="rel">Far</div>
                    <div className="ct">+47 988 65 442 · jon.p@arkitekt.no</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Spiller-DNA */}
            <div className="form-section">
              <div className="sect-head">
                <h3>3 · Spiller-DNA · 5-akset radar</h3>
                <span className="meta">Beregnet 21. mai · 12 tester</span>
              </div>
              <div className="radar-wrap" style={{ gridTemplateColumns: '1.1fr 1fr', gap: 30 }}>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Radar size={320} />
                </div>
                <div className="radar-legend">
                  {[
                    { k: 'FYS', m: 62, c: 55, note: 'CMJ 48,2cm · sit-and-reach 38cm' },
                    { k: 'TEK', m: 78, c: 62, note: 'Pos 1-3 stabilt · pos 5 svak' },
                    { k: 'SLAG', m: 71, c: 58, note: 'Wedge spinn topp 10% A1' },
                    { k: 'SPILL', m: 58, c: 60, note: 'Korthull-strategi i utvikling' },
                    { k: 'TURN', m: 64, c: 55, note: 'Mental press krever fokus' },
                  ].map(a => (
                    <div key={a.k}>
                      <div className="radar-leg-row" style={{ gridTemplateColumns: '60px 1fr 40px', marginBottom: 2 }}>
                        <div className="axis">{a.k}</div>
                        <div className="bar"><div className="me" style={{ width: `${a.m}%` }}></div></div>
                        <div className="v">{a.m}</div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', marginBottom: 10, marginLeft: 70, letterSpacing: '0.02em' }}>
                        {a.note} <span style={{ color: a.m > a.c ? 'var(--success)' : 'var(--warning)' }}>
                          {a.m > a.c ? '↑' : '↓'} {Math.abs(a.m - a.c)} pp vs A1
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="radar-legend-foot">
                    <span><span className="sw" style={{ background: '#005840' }}></span>Markus</span>
                    <span><span className="sw" style={{ background: '#908D86' }}></span>A1-kohort snitt (n=14)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Aktive mål */}
            <div className="form-section">
              <div className="sect-head">
                <h3>4 · Aktive mål · 3</h3>
                <button className="btn btn-outline btn-xs"><Ic id="ic-plus"/>Nytt mål</button>
              </div>
              <div className="goal-grid">
                <div className="goal">
                  <div className="gtype">● Resultat</div>
                  <h4>HCP 3,8 innen 14. juli</h4>
                  <div className="gprog-ring">
                    <ProgressRing value={64} />
                    <div>
                      <div className="ring-num">64<span className="u">%</span></div>
                      <div className="gprog-meta">52 dager igjen · på plan</div>
                    </div>
                  </div>
                  <div className="gfoot">Krever 2 turneringer + 3 runder på par eller bedre.</div>
                </div>
                <div className="goal">
                  <div className="gtype" style={{ color: 'var(--warning)' }}>● Prosess</div>
                  <h4>Pre-shot rutine 7 sek</h4>
                  <div className="gprog-ring">
                    <ProgressRing value={42} color="#B8852A" />
                    <div>
                      <div className="ring-num">42<span className="u">%</span></div>
                      <div className="gprog-meta">14/30 økter målt · 9,4s snitt</div>
                    </div>
                  </div>
                  <div className="gfoot">Coach noterer på hver økt. Trenger fokus i mai.</div>
                </div>
                <div className="goal">
                  <div className="gtype" style={{ color: 'var(--success)' }}>● Atferd</div>
                  <h4>Logg alle økter samme dag</h4>
                  <div className="gprog-ring">
                    <ProgressRing value={88} color="#2C7D52" />
                    <div>
                      <div className="ring-num">88<span className="u">%</span></div>
                      <div className="gprog-meta">29/33 økter logget</div>
                    </div>
                  </div>
                  <div className="gfoot">På riktig vei — 3 økter i mai mangler TM-data.</div>
                </div>
              </div>
            </div>

            {/* 5. Skader/permisjoner */}
            <div className="form-section">
              <div className="sect-head">
                <h3>5 · Skader · permisjoner</h3>
                <button className="btn btn-outline btn-xs"><Ic id="ic-plus"/>Registrer</button>
              </div>
              <table className="leave-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Fra</th>
                    <th>Til</th>
                    <th>Beskrivelse</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="pill pill-warn">SKADE</span></td>
                    <td className="mono">12. feb 2026</td>
                    <td className="mono">28. feb 2026</td>
                    <td>Mildt brudd hamstring · høyre · MR-bekreftet</td>
                    <td><span className="pill pill-ok"><span className="ldot"></span>FERDIG</span></td>
                  </tr>
                  <tr>
                    <td><span className="pill pill-info">PERMISJON</span></td>
                    <td className="mono">22. des 2025</td>
                    <td className="mono">06. jan 2026</td>
                    <td>Familieferie · Spania · varslet 3 uker før</td>
                    <td><span className="pill pill-ok"><span className="ldot"></span>FERDIG</span></td>
                  </tr>
                  <tr>
                    <td><span className="pill pill-warn">SKADE</span></td>
                    <td className="mono">18. aug 2024</td>
                    <td className="mono">02. sep 2024</td>
                    <td>Tennisalbue venstre · fysio-oppfølging</td>
                    <td><span className="pill pill-ok"><span className="ldot"></span>FERDIG</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 6. Coachens vurdering */}
            <div className="form-section">
              <div className="sect-head">
                <h3>6 · Coachens vurdering</h3>
                <span className="meta">Oppdateres månedlig · sist 21. mai</span>
              </div>
              <div style={{
                background: 'linear-gradient(160deg, #003A2A 0%, #002418 100%)',
                color: '#fff', padding: '28px 32px', borderRadius: 14,
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: -20, left: 12, fontFamily: 'var(--font-serif)', fontSize: 200, color: 'rgba(209,248,67,0.10)', lineHeight: 1, pointerEvents: 'none' }}>"</div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 20, lineHeight: 1.5, color: '#fff' }}>
                    Markus har stor teknisk progresjon, men trenger fortsatt mental robusthet i turnerings-press. Den klare prioriteringen til vinter: bygge pre-shot rutine 7 sek + putting under 2,5m. Wedge-spinn er en klar styrke vi skal foredle videre.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 20 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--brand-accent)', color: 'var(--brand-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700 }}>AK</div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600 }}>Anders Kvam</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(209,248,67,0.65)', letterSpacing: '0.06em' }}>HEAD COACH · OPPDATERT 21. MAI 2026</div>
                    </div>
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

function SpillerProfilMobile() {
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
      <div style={{ padding: '14px 16px', background: 'var(--card)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button className="top-icon" style={{ marginLeft: -8 }}><Ic id="ic-arrow-left"/></button>
        <div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.10em', textTransform: 'uppercase' }}>Markus R. · profil</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>
            Spiller-<em>profil</em>
          </div>
        </div>
        <button className="btn btn-outline btn-xs" style={{ marginLeft: 'auto' }}><Ic id="ic-edit"/>Rediger</button>
      </div>

      <div className="m-body" style={{ height: 'calc(100% - 36px - 60px)' }}>
        {/* Personalia */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-soft)' }}>
            <div className="ttl-mono">1 · Personalia</div>
          </div>
          <div className="fact-grid" style={{ gridTemplateColumns: '1fr' }}>
            <Fact k="Fullt navn" v="Markus Røstad Pedersen" />
            <Fact k="Fødselsdato" v="14. mars 2009 · 17 år" mono />
            <Fact k="Telefon" v="+47 412 33 567" mono />
            <Fact k="E-post" v="markus.rp@gmail.com" />
            <Fact k="Klubb" v="Grenland & Farsund GK" />
          </div>
        </div>

        {/* Parent */}
        <div className="card" style={{ padding: 12 }}>
          <div className="ttl-mono" style={{ marginBottom: 8 }}>2 · Foreldre · verge</div>
          <div className="parent-card" style={{ padding: 12 }}>
            <div className="av">KP</div>
            <div>
              <div className="nm">Kari Pedersen</div>
              <div className="rel">Mor · Stripe</div>
            </div>
            <span className="pill pill-ok"><span className="ldot"></span>BETALER</span>
          </div>
        </div>

        {/* DNA */}
        <div className="card" style={{ padding: 14 }}>
          <div className="ttl-mono" style={{ marginBottom: 8 }}>3 · Spiller-DNA</div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Radar size={220} />
          </div>
          <div className="radar-legend-foot" style={{ justifyContent: 'center' }}>
            <span><span className="sw" style={{ background: '#005840' }}></span>Markus</span>
            <span><span className="sw" style={{ background: '#908D86' }}></span>A1-snitt</span>
          </div>
        </div>

        {/* Goals - stacked */}
        <div className="card" style={{ padding: 14 }}>
          <div className="ttl-mono" style={{ marginBottom: 10 }}>4 · Aktive mål · 3</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="goal" style={{ minHeight: 0, padding: 12 }}>
              <div className="gtype">Resultat</div>
              <h4 style={{ fontSize: 13 }}>HCP 3,8 innen 14. juli</h4>
              <div className="gprog-ring">
                <ProgressRing value={64} size={48} />
                <div>
                  <div className="ring-num" style={{ fontSize: 18 }}>64<span className="u">%</span></div>
                  <div className="gprog-meta">52 dager igjen</div>
                </div>
              </div>
            </div>
            <div className="goal" style={{ minHeight: 0, padding: 12 }}>
              <div className="gtype" style={{ color: 'var(--warning)' }}>Prosess</div>
              <h4 style={{ fontSize: 13 }}>Pre-shot rutine 7 sek</h4>
              <div className="gprog-ring">
                <ProgressRing value={42} size={48} color="#B8852A" />
                <div>
                  <div className="ring-num" style={{ fontSize: 18 }}>42<span className="u">%</span></div>
                  <div className="gprog-meta">14/30 økter</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coach vurdering */}
        <div className="coach-note" style={{ padding: 14 }}>
          <div className="quote" style={{ fontSize: 13.5 }}>"Stor teknisk progresjon — mental robusthet i turnerings-press er fokus til vinter."</div>
          <div className="sig" style={{ fontSize: 10 }}>
            <div className="av">AK</div>
            <span>ANDERS · OPPDATERT 21. MAI</span>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SpillerProfil, SpillerProfilMobile });
