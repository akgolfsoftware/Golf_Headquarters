// Page 01 — /stats Hub Landing

function HubHero({ variant = "A" }) {
  const D = window.AKG_DATA;

  // Variants for the headline
  const heroByVariant = {
    A: { eyebrow: "AK GOLF STATS", line1: "All statistikken.", line2Pre: "", line2Em: "Gratis.", line2Post: " Alltid." },
    B: { eyebrow: "AK GOLF STATS · 2026", line1: "Hvor langt slår de", line2Pre: "", line2Em: "egentlig", line2Post: "?" },
    C: { eyebrow: "NORGES GOLF-STATISTIKK", line1: "Tall som forteller", line2Pre: "", line2Em: "hele historien", line2Post: "." },
  };
  const h = heroByVariant[variant] || heroByVariant.A;

  return (
    <section className="hero">
      <div className="hero-bg-glyph" aria-hidden="true">
        <Icon name="Flag" size={560} stroke={1}/>
      </div>
      <div className="hero-grid">
        <Reveal>
          <Eyebrow>{h.eyebrow}</Eyebrow>
          <h1>
            {h.line1}<br/>
            {h.line2Pre}<em className="italic-accent">{h.line2Em}</em>{h.line2Post}
          </h1>
          <p className="hero-sub">
            Live PGA Tour-data, norske spillere over hele verden, og verktøy for å sammenligne ditt eget spill mot proffene. Bygget i Norge, åpent for alle.
          </p>
          <div className="hero-ctas">
            <Btn variant="primary" icon="ArrowRight">Se ukens turneringer</Btn>
            <Btn variant="ghost" icon="ArrowDown">Utforsk alle verktøy</Btn>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="hero-side">
            <div className="hero-side-row">
              <span>Sesong</span>
              <span className="hero-side-val">{D.meta.sesong}</span>
            </div>
            <div className="hero-side-row">
              <span>Turneringer i DB</span>
              <span className="hero-side-val">{D.meta.totalTurneringer.toLocaleString("nb-NO")}</span>
            </div>
            <div className="hero-side-row">
              <span>PGA-spillere</span>
              <span className="hero-side-val">{D.meta.totalPGASpillere}</span>
            </div>
            <div className="hero-side-row">
              <span>Norske spillere</span>
              <span className="hero-side-val">{D.meta.totalNorske.toLocaleString("nb-NO")}</span>
            </div>
            <div className="hero-side-row">
              <span>Siste sync</span>
              <span className="hero-side-val">{D.meta.sisteSync}</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function HubKPIStrip() {
  const D = window.AKG_DATA;
  return (
    <div className="kpi-strip">
      <div className="kpi">
        <div className="kpi-eyebrow"><Icon name="Flag" size={14}/> Denne uken</div>
        <div className="kpi-value">
          <CountUp value={D.meta.norskeIAksjon} duration={700}/>
        </div>
        <div className="kpi-sub">norske spillere i aksjon på proffturneringer</div>
      </div>
      <div className="kpi">
        <div className="kpi-eyebrow"><Icon name="Trophy" size={14}/> Neste 30 dager</div>
        <div className="kpi-value">
          <CountUp value={D.meta.kommendeTurneringer} duration={700}/>
        </div>
        <div className="kpi-sub">kommende turneringer å følge med på</div>
      </div>
      <div className="kpi">
        <div className="kpi-eyebrow"><Icon name="Zap" size={14}/> Database</div>
        <div className="kpi-value mono" style={{ fontSize: 28, marginTop: 8 }}>oppdatert<br/>
          <span style={{ fontSize: 22, color: "var(--muted-fg)" }}>{D.meta.sisteSync}</span>
        </div>
      </div>
    </div>
  );
}

function NorskeIAksjon() {
  const D = window.AKG_DATA;
  return (
    <section className="section">
      <Reveal>
        <div className="section-head">
          <div>
            <Eyebrow>Denne uken</Eyebrow>
            <h2>Norske spillere i aksjon</h2>
          </div>
          <a className="section-head-link" href="#">Se alle 6 →</a>
        </div>
      </Reveal>

      <div className="norske-grid">
        {D.norske.map((p, i) => (
          <Reveal key={p.initials} delay={i * 60}>
            <div className="norske-card">
              <div className="norske-head">
                <div className="norske-avatar">{p.initials}</div>
                <div>
                  <div className="norske-name">{p.name}</div>
                  <div className="norske-tour">
                    <FlagGlyph code={p.flag}/> {p.tour}
                  </div>
                </div>
              </div>
              <div className="norske-event">{p.event}</div>
              <div className="norske-pos">
                <div>
                  {p.live && <div className="norske-live-badge">Live</div>}
                  {!p.live && <span className="pos-label">Cut</span>}
                </div>
                <div style={{ display: "flex", alignItems: "baseline" }}>
                  <span className="pos-value">{p.pos}</span>
                  <span className={`pos-score ${p.score.startsWith("-") ? "under-par" : ""}`}>{p.score}</span>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function HubBento() {
  const D = window.AKG_DATA;
  return (
    <section className="section section-divider">
      <Reveal>
        <div className="section-head">
          <div>
            <Eyebrow>Verktøy</Eyebrow>
            <h2>Fire moduler. <em className="italic-accent">Én plattform.</em></h2>
          </div>
        </div>
      </Reveal>

      <div className="bento">
        {/* Turneringer */}
        <Reveal className="b-turneringer">
          <div className="bento-card">
            <div className="bento-arrow"><Icon name="ArrowRight" size={20}/></div>
            <div className="bento-icon"><Icon name="Trophy" size={22}/></div>
            <h3>Turneringer</h3>
            <div className="bento-desc">PGA Tour, DP World, LET, Korn Ferry og norske amatørtourer i én kalender.</div>

            <div className="mini-lb-preview">
              <div className="mini-lb-row">
                <span className="mini-pos">1</span>
                <span className="mini-name">S. Devlin</span>
                <span className="mini-mono">−12</span>
                <span className="mini-score">F</span>
              </div>
              <div className="mini-lb-row">
                <span className="mini-pos">2</span>
                <span className="mini-name">O. Yamagata</span>
                <span className="mini-mono">−10</span>
                <span className="mini-score">F</span>
              </div>
              <div className="mini-lb-row">
                <span className="mini-pos">T-12</span>
                <span className="mini-name" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <FlagGlyph code="no" size={12}/> V. Halvorsen
                </span>
                <span className="mini-mono">−4</span>
                <span className="mini-score" style={{ color: "var(--accent-fg)", background: "var(--accent)", padding: "1px 6px", borderRadius: 3 }}>LIVE</span>
              </div>
            </div>

            <div className="bento-foot">
              {D.meta.totalTurneringer.toLocaleString("nb-NO")} TURNERINGER · OPPDATERT DAGLIG
            </div>
          </div>
        </Reveal>

        {/* PGA Stats */}
        <Reveal delay={80} className="b-pga">
          <div className="bento-card">
            <div className="bento-arrow"><Icon name="ArrowRight" size={20}/></div>
            <div className="bento-icon"><Icon name="LineChart" size={22}/></div>
            <h3>PGA Tour Stats</h3>
            <div className="bento-desc">Drive distance, GIR, putter — alt målt mot Tour-snittet.</div>

            <div className="drive-bars-wrap">
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted-fg)", marginBottom: 8 }}>
                Drive distance · topp 5
              </div>
              <SparkBars values={[327, 322, 320, 317, 314]} height={48} highlight={0}/>
            </div>
            <div className="bento-foot">
              {D.meta.totalPGASpillere} SPILLERE · 6 KATEGORIER
            </div>
          </div>
        </Reveal>

        {/* Norsk spillerbase */}
        <Reveal delay={160} className="b-spillere">
          <div className="bento-card">
            <div className="bento-arrow"><Icon name="ArrowRight" size={20}/></div>
            <div className="bento-icon"><Icon name="Users" size={22}/></div>
            <h3>Norsk spillerbase</h3>
            <div className="bento-desc">2 500+ norske spillere — proffer, amatører, juniorer. Søkbart.</div>

            <div className="avatar-stack">
              <div className="av">VH</div>
              <div className="av">KR</div>
              <div className="av">SH</div>
              <div className="av">KV</div>
              <div className="av av-more">+2k</div>
            </div>
            <div className="bento-foot">
              SØK · FILTER · SAMMENLIGN
            </div>
          </div>
        </Reveal>

        {/* SG sammenlign */}
        <Reveal delay={240} className="b-sg">
          <div className="bento-card">
            <div className="bento-arrow"><Icon name="ArrowRight" size={20}/></div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24 }}>
              <div style={{ flex: 1 }}>
                <div className="bento-icon"><Icon name="Crosshair" size={22}/></div>
                <h3>SG-sammenligning</h3>
                <div className="bento-desc">Legg inn dine egne tall. Se hvor du står mot Tour-snittet på 4 SG-akser.</div>
              </div>
              <div style={{ flexShrink: 0 }}>
                <MiniRadar size={140} values={[0.7, 0.55, 0.65, 0.4]} values2={[0.85, 0.85, 0.85, 0.85]}/>
              </div>
            </div>
            <div className="bento-foot">
              GRATIS · KREVER KONTO · DELBAR
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function MersalgBand({ variant = "default" }) {
  const D = window.AKG_DATA;
  return (
    <Reveal>
      <section className="section section-divider">
        <div className="mersalg">
          <div className="mersalg-bg-glyph" aria-hidden>
            <Icon name="Crosshair" size={420} stroke={1}/>
          </div>
          <div>
            <Eyebrow tone="lime">PlayerHQ · Treningsdagbok</Eyebrow>
            <h2>
              Vil du følge<br/>
              <em className="italic-accent">dine egne</em> tall?
            </h2>
            <p>
              PlayerHQ regner ut Strokes Gained automatisk fra hvert scorekort. Du ser hvor strokene tapes, og om treningen virker. Trenden over måneder — ikke synsing.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Btn variant="primary" icon="ArrowRight" iconAfter={true}>
                <span style={{ color: "var(--bg)" }}>Prøv gratis i 30 dager</span>
              </Btn>
              <Btn variant="outline" icon={null}>Se priser</Btn>
            </div>
          </div>

          <div className="mersalg-card">
            <h4>Inkludert i abonnement</h4>
            <ul>
              {D.playerHQFordeler.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
            <div className="mersalg-price">
              <strong>300 kr/mnd</strong> · gratis under beta
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

function TrenerSteg() {
  const D = window.AKG_DATA;
  return (
    <section className="section section-divider">
      <Reveal>
        <div className="section-head">
          <div>
            <Eyebrow>Coaching</Eyebrow>
            <h2>Slik bruker treneren<br/><em className="italic-accent">tallene</em>.</h2>
          </div>
        </div>
      </Reveal>

      <div className="steps">
        {D.trenerSteg.map((s, i) => (
          <Reveal key={s.n} delay={i * 100}>
            <div className="step-card">
              <span className="step-num">{s.n}</span>
              <Icon name={s.icon} size={28} className="step-icon"/>
              <h3>{s.tittel}</h3>
              <p>{s.tekst}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={300}>
        <div className="coaching-card">
          <div className="coaching-text">
            <strong>Vil du jobbe med en av våre coacher?</strong><br/>
            <span className="muted">Vi har plass til nye spillere på AK Golf Academy i 2026 — junior, amatør og proffspillere.</span>
          </div>
          <Btn variant="secondary" icon="ArrowRight">Se coaching-tilbud</Btn>
        </div>
      </Reveal>
    </section>
  );
}

function BunnCTA() {
  return (
    <section className="bottom-cta">
      <Reveal>
        <Eyebrow>Kom i gang</Eyebrow>
        <h2>Klar for å bli <em className="italic-accent">bedre</em>?</h2>
        <div className="bottom-cta-sub">
          Det tar fem minutter å sette opp PlayerHQ. Etter første scorekort har du din egen SG-profil.
        </div>
        <div className="bottom-cta-buttons">
          <Btn variant="primary" icon="ArrowRight" size="lg">Start PlayerHQ gratis</Btn>
          <Btn variant="on-light-outline" icon={null} size="lg">Se norske i aksjon</Btn>
        </div>
        <div className="bottom-cta-footnote">
          INGEN KREDITTKORT NØDVENDIG · AVSLUTT NÅR DU VIL
        </div>
      </Reveal>
    </section>
  );
}

function HubLanding({ heroVariant }) {
  return (
    <div>
      <HubHero variant={heroVariant}/>
      <HubKPIStrip/>
      <NorskeIAksjon/>
      <HubBento/>
      <MersalgBand/>
      <TrenerSteg/>
      <BunnCTA/>
    </div>
  );
}

Object.assign(window, { HubLanding, MersalgBand });
