// pr2-rediger.jsx — Screen 5: /admin/spillere/[id]/rediger

function RedigerSpiller() {
  return (
    <div className="pr1-frame">
      <div className="app">
        <CHSidebar active="" />
        <main className="main">
          <Topbar
            crumb={<><span>CoachHQ</span>{' / '}<span>Stall</span>{' / '}<span>Markus R.</span>{' / '}<span className="current">Rediger</span></>}
            search="Søk spiller, økt eller plan…"
          />
          <div className="page">
            {/* Sub-hero */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <button className="btn btn-outline btn-xs" style={{ marginBottom: 10 }}>
                  <Ic id="ic-arrow-left"/>Markus R. Pedersen · profil
                </button>
                <div className="eyebrow">SPILLER · REDIGER · ENDRINGER LAGRES IKKE AUTOMATISK</div>
                <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 4 }}>
                  Rediger <em>spiller</em>
                </h1>
              </div>
            </div>

            {/* Sticky save bar */}
            <div className="save-bar">
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#fff' }}>
                  3 ulagrede endringer
                </div>
                <div className="meta">
                  HCP, telefon, cohort · <span className="ok">Auto-valider OK</span>
                </div>
              </div>
              <div className="actions">
                <button className="btn btn-ghost btn-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>Avbryt</button>
                <button className="btn btn-primary btn-sm"><Ic id="ic-check"/>Lagre endringer</button>
              </div>
            </div>

            {/* 2-col layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14, alignItems: 'start' }}>
              {/* LEFT 60% — forms */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Personalia */}
                <div className="form-section">
                  <div className="sect-head">
                    <h3>Personalia</h3>
                    <span className="meta">Påkrevde felt har <span style={{ color: 'var(--danger)' }}>*</span></span>
                  </div>
                  <div className="form-grid">
                    <div className="field">
                      <label className="field-label">Fornavn<span className="req">*</span></label>
                      <input className="field-input" defaultValue="Markus" />
                    </div>
                    <div className="field">
                      <label className="field-label">Etternavn<span className="req">*</span></label>
                      <input className="field-input" defaultValue="Pedersen" />
                    </div>
                    <div className="field">
                      <label className="field-label">Mellomnavn</label>
                      <input className="field-input" defaultValue="Røstad" />
                    </div>
                    <div className="field">
                      <label className="field-label">Fødselsdato<span className="req">*</span></label>
                      <input className="field-input mono" defaultValue="2009-03-14" />
                    </div>
                    <div className="field">
                      <label className="field-label">Kjønn</label>
                      <select className="field-select"><option>Mann</option><option>Kvinne</option><option>Annet</option></select>
                    </div>
                    <div className="field">
                      <label className="field-label">Telefon<span className="req">*</span></label>
                      <input className="field-input mono error" defaultValue="+47 412 33 56" />
                      <div className="field-error">⚠ Mangler ett siffer · skal være 8 siffer</div>
                    </div>
                    <div className="field">
                      <label className="field-label">E-post<span className="req">*</span></label>
                      <input className="field-input" defaultValue="markus.rp@gmail.com" />
                    </div>
                    <div className="field">
                      <label className="field-label">Klubb-nr.</label>
                      <input className="field-input mono" defaultValue="2009-031-A" />
                    </div>
                    <div className="field">
                      <label className="field-label">Hjemmeklubb</label>
                      <select className="field-select"><option>Grenland & Farsund GK</option><option>Mulligan Golf Akademi</option></select>
                    </div>
                    <div className="field">
                      <label className="field-label">Foretrukket språk</label>
                      <select className="field-select"><option>Norsk bokmål</option><option>Norsk nynorsk</option><option>Engelsk</option></select>
                    </div>
                  </div>
                </div>

                {/* Adresse */}
                <div className="form-section">
                  <div className="sect-head">
                    <h3>Adresse</h3>
                    <span className="meta">Sendes til foreldre for fakturering</span>
                  </div>
                  <div className="form-grid">
                    <div className="field" style={{ gridColumn: '1 / -1' }}>
                      <label className="field-label">Gate</label>
                      <input className="field-input" defaultValue="Bjerkeveien 12" />
                    </div>
                    <div className="field">
                      <label className="field-label">Postnr.</label>
                      <input className="field-input mono" defaultValue="3960" />
                    </div>
                    <div className="field">
                      <label className="field-label">Poststed</label>
                      <input className="field-input" defaultValue="Stathelle" />
                    </div>
                    <div className="field" style={{ gridColumn: '1 / -1' }}>
                      <label className="field-label">Land</label>
                      <select className="field-select"><option>Norge</option><option>Sverige</option><option>Danmark</option></select>
                    </div>
                  </div>
                </div>

                {/* Coaching */}
                <div className="form-section">
                  <div className="sect-head">
                    <h3>Coaching · klassifisering</h3>
                    <span className="meta">Påvirker plan-tilordning og benchmark</span>
                  </div>
                  <div className="form-grid">
                    <div className="field">
                      <label className="field-label">Cohort</label>
                      <select className="field-select">
                        <option>A1 · Topp talent (4 spillere)</option>
                        <option>A2 · Talent (6 spillere)</option>
                        <option>B1 · Utvikling (14 spillere)</option>
                        <option>B2 · Klubb (14 spillere)</option>
                      </select>
                      <div className="field-helper">Endret 12. mai · fra A2 → A1</div>
                    </div>
                    <div className="field">
                      <label className="field-label">HCP (offisiell)</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.10em' }}>HCP</span>
                        <input className="field-input mono with-prefix" defaultValue="+4,8" />
                      </div>
                    </div>
                    <div className="field">
                      <label className="field-label">Ambisjon-nivå</label>
                      <select className="field-select">
                        <option>Profesjonell (PGA/LET sikte)</option>
                        <option>Universitet US/UK</option>
                        <option>Amatør · klubbnivå</option>
                      </select>
                    </div>
                    <div className="field">
                      <label className="field-label">Mac O'Grady fase</label>
                      <select className="field-select">
                        <option>Fase 2 · Spinn-bygging</option>
                        <option>Fase 1 · Grunnposisjon</option>
                        <option>Fase 3 · Hastighet</option>
                        <option>Fase 4 · Refining</option>
                      </select>
                    </div>
                    <div className="field" style={{ gridColumn: '1 / -1' }}>
                      <label className="field-label">Life-kode</label>
                      <input className="field-input mono" defaultValue="L2-FIN-PROG-2009-Mar14" />
                      <div className="field-helper">Auto-generert · ikke endre med mindre prosessen krever det</div>
                    </div>
                  </div>
                </div>

                {/* Notater */}
                <div className="form-section">
                  <div className="sect-head">
                    <h3>Interne notater · kun coach</h3>
                    <span className="meta">Skjult for spiller og foreldre</span>
                  </div>
                  <textarea
                    className="field-textarea"
                    defaultValue="Mental robusthet i turnerings-press er fortsatt utfordring — særlig 4 siste hull. Kari (mor) er svært involvert, generelt positivt, men kan presse for hardt før turneringer. Avtalt med henne å minimere SMS før event-dager."
                  />
                  <div className="field-helper" style={{ alignSelf: 'flex-end' }}>248 / 4 000 tegn</div>
                </div>
              </div>

              {/* RIGHT 40% — sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 76 }}>
                {/* Foreldre quick-edit */}
                <div className="card">
                  <div className="card-head">
                    <span className="ttl">Foreldre · quick-edit</span>
                    <button className="btn btn-outline btn-xs"><Ic id="ic-plus"/></button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="parent-card" style={{ cursor: 'pointer' }}>
                      <div className="av">KP</div>
                      <div>
                        <div className="nm">Kari Pedersen</div>
                        <div className="rel">Mor · primær · Stripe</div>
                      </div>
                      <Ic id="ic-chev-r" style={{ width: 14, height: 14, color: 'var(--muted)' }}/>
                    </div>
                    <div className="parent-card" style={{ cursor: 'pointer' }}>
                      <div className="av" style={{ background: '#DCE7E1', color: '#005840' }}>JP</div>
                      <div>
                        <div className="nm">Jon Pedersen</div>
                        <div className="rel">Far · sekundær</div>
                      </div>
                      <Ic id="ic-chev-r" style={{ width: 14, height: 14, color: 'var(--muted)' }}/>
                    </div>
                  </div>
                </div>

                {/* Changelog */}
                <div className="card">
                  <div className="card-head">
                    <span className="ttl">Endrings-historikk</span>
                    <span className="right">
                      <select className="field-select" style={{ padding: '4px 8px', fontSize: 10.5, width: 'auto' }}>
                        <option>Alle</option>
                        <option>Siste 30 dg</option>
                        <option>Mine endringer</option>
                      </select>
                    </span>
                  </div>
                  <div>
                    <div className="changelog-row">
                      <div className="when">21.05<br/>14:23</div>
                      <div>
                        <div className="what">
                          Endret HCP <span className="diff-old">+5,2</span> → <span className="diff-new">+4,8</span>
                        </div>
                        <div className="by">av Anders K. · System-bekreftet</div>
                      </div>
                    </div>
                    <div className="changelog-row">
                      <div className="when">12.05<br/>09:14</div>
                      <div>
                        <div className="what">
                          Endret cohort <span className="diff-old">A2</span> → <span className="diff-new">A1</span>
                        </div>
                        <div className="by">av Anders K. · etter testbatteri</div>
                      </div>
                    </div>
                    <div className="changelog-row">
                      <div className="when">08.05<br/>16:42</div>
                      <div>
                        <div className="what">
                          La til forelder <span className="diff-new">Jon Pedersen</span>
                        </div>
                        <div className="by">av Markus (spiller-onboarding)</div>
                      </div>
                    </div>
                    <div className="changelog-row">
                      <div className="when">02.05<br/>11:08</div>
                      <div>
                        <div className="what">
                          Oppgradert tier <span className="diff-old">GRATIS</span> → <span className="diff-new">PRO</span>
                        </div>
                        <div className="by">av Kari P. (forelder) · Stripe-checkout</div>
                      </div>
                    </div>
                    <div className="changelog-row">
                      <div className="when">28.04<br/>13:55</div>
                      <div>
                        <div className="what">
                          Endret telefon · 3 siffer
                        </div>
                        <div className="by">av Markus (spiller)</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Danger zone */}
                <div className="danger-zone">
                  <div className="text">
                    <strong>Slett spiller</strong>
                    <div className="meta">Sletter all historikk, økter og data. Kan ikke angres.</div>
                  </div>
                  <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)', borderColor: 'rgba(163,45,45,0.30)' }}>
                    <Ic id="ic-trash"/>Slett
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function RedigerSpillerMobile() {
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
          <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.10em', textTransform: 'uppercase' }}>Markus R. · rediger</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>
            Rediger <em>spiller</em>
          </div>
        </div>
      </div>

      <div className="m-body" style={{ height: 'calc(100% - 36px - 60px - 64px)', paddingBottom: 80 }}>
        <div className="form-section" style={{ padding: 16 }}>
          <div className="sect-head" style={{ paddingBottom: 10 }}>
            <h3 style={{ fontSize: 14 }}>Personalia</h3>
            <span className="meta" style={{ fontSize: 10 }}>5 felter</span>
          </div>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: 12 }}>
            <div className="field">
              <label className="field-label">Fornavn<span className="req">*</span></label>
              <input className="field-input" defaultValue="Markus" />
            </div>
            <div className="field">
              <label className="field-label">Etternavn<span className="req">*</span></label>
              <input className="field-input" defaultValue="Pedersen" />
            </div>
            <div className="field">
              <label className="field-label">Telefon<span className="req">*</span></label>
              <input className="field-input mono error" defaultValue="+47 412 33 56" />
              <div className="field-error">⚠ Mangler ett siffer</div>
            </div>
            <div className="field">
              <label className="field-label">E-post<span className="req">*</span></label>
              <input className="field-input" defaultValue="markus.rp@gmail.com" />
            </div>
          </div>
        </div>

        <div className="form-section" style={{ padding: 16 }}>
          <div className="sect-head" style={{ paddingBottom: 10 }}>
            <h3 style={{ fontSize: 14 }}>Coaching</h3>
            <span className="meta" style={{ fontSize: 10 }}>3 felter</span>
          </div>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr', gap: 12 }}>
            <div className="field">
              <label className="field-label">Cohort</label>
              <select className="field-select">
                <option>A1 · Topp talent</option>
              </select>
            </div>
            <div className="field">
              <label className="field-label">HCP</label>
              <input className="field-input mono" defaultValue="+4,8" />
            </div>
          </div>
        </div>

        {/* Collapsed history accordion */}
        <div className="card" style={{ padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="ttl-mono">Endrings-historikk · 12</span>
            <Ic id="ic-chev-r" style={{ width: 14, height: 14, color: 'var(--muted)', transform: 'rotate(90deg)' }}/>
          </div>
          <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--muted)', letterSpacing: '0.04em' }}>
            Sist: 21.05 14:23 · HCP +5,2 → +4,8 av Anders K.
          </div>
        </div>

        <div className="danger-zone" style={{ padding: 12 }}>
          <div className="text">
            <strong style={{ fontSize: 13 }}>Slett spiller</strong>
            <div className="meta" style={{ fontSize: 10 }}>Kan ikke angres.</div>
          </div>
          <button className="btn btn-xs" style={{ color: 'var(--danger)', border: '1px solid rgba(163,45,45,0.30)' }}>Slett</button>
        </div>
      </div>

      {/* sticky save bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'var(--brand-primary-dark)', color: '#fff',
        padding: '14px 16px', display: 'flex', gap: 8, alignItems: 'center',
        borderTop: '2px solid var(--brand-accent)',
      }}>
        <div className="mono" style={{ fontSize: 10.5, color: 'rgba(209,248,67,0.7)', flex: 1 }}>
          3 endringer · <span style={{ color: 'var(--brand-accent)', fontWeight: 600 }}>OK</span>
        </div>
        <button className="btn btn-ghost btn-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Avbryt</button>
        <button className="btn btn-primary btn-sm">Lagre</button>
      </div>
    </div>
  );
}

Object.assign(window, { RedigerSpiller, RedigerSpillerMobile });
