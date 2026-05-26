// Page 02 — /stats/pga PGA Tour Hub

function PGAHero() {
  const D = window.AKG_DATA;
  return (
    <section className="hero compact">
      <Reveal>
        <a href="#" className="breadcrumb">← AK Golf Stats</a>
        <div style={{ marginTop: 24 }}>
          <Eyebrow>PGA Tour · Statistikk</Eyebrow>
        </div>
        <h1 style={{ maxWidth: 940 }}>
          Hva er <em className="italic-accent">snittet</em> egentlig?
        </h1>
        <p className="hero-sub" style={{ maxWidth: 620 }}>
          Alt fra drive distance til putter per runde — hentet rett fra DataGolf, vektet mot Tour-snittet. Lek deg gjennom seks kategorier.
        </p>
        <div style={{ display: "flex", gap: 20, marginTop: 28, alignItems: "center", flexWrap: "wrap" }}>
          <div className="mini-mono">{D.meta.totalPGASpillere} SPILLERE</div>
          <span className="mini-mono" style={{ color: "var(--border-strong)" }}>·</span>
          <div className="mini-mono">SESONG {D.meta.sesong}</div>
          <span className="mini-mono" style={{ color: "var(--border-strong)" }}>·</span>
          <div className="mini-mono">OPPDATERT MANDAGER</div>
        </div>
      </Reveal>
    </section>
  );
}

function PGAKpiStrip() {
  const D = window.AKG_DATA.pgaKPI;
  return (
    <div className="kpi-strip cols-4">
      <div className="kpi">
        <div className="kpi-eyebrow">Lengde</div>
        <div className="kpi-value">
          <CountUp value={D.drive} decimals={0}/><span className="unit">yds</span>
        </div>
        <div className="kpi-sub">Snitt drive</div>
      </div>
      <div className="kpi">
        <div className="kpi-eyebrow">Presisjon</div>
        <div className="kpi-value">
          <CountUp value={D.fairway} decimals={1}/><span className="unit">%</span>
        </div>
        <div className="kpi-sub">Fairway-treff</div>
      </div>
      <div className="kpi">
        <div className="kpi-eyebrow">Green</div>
        <div className="kpi-value">
          <CountUp value={D.gir} decimals={1}/><span className="unit">%</span>
        </div>
        <div className="kpi-sub">GIR</div>
      </div>
      <div className="kpi">
        <div className="kpi-eyebrow">Putter</div>
        <div className="kpi-value">
          <CountUp value={D.putter} decimals={1}/>
        </div>
        <div className="kpi-sub">Per runde</div>
      </div>
    </div>
  );
}

// Helper — top3 list block
function Topp3List({ items, unit, decimals = 1 }) {
  return (
    <div className="topp3">
      {items.map((p, i) => (
        <div className="topp3-row" key={p.initials + i}>
          <span className="topp3-rank">{i + 1}</span>
          <span className="topp3-name">
            <FlagGlyph code={p.country}/> {p.name}
          </span>
          <span className="topp3-val">
            {decimals > 0 ? p.value.toFixed(decimals) : Math.round(p.value)}{unit && <span className="muted" style={{ marginLeft: 4 }}>{unit}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

function PGABento() {
  const D = window.AKG_DATA;
  const cats = D.pgaKategorier;
  const drive = cats.find(c => c.id === "drive");
  const fairway = cats.find(c => c.id === "fairway");
  const gir = cats.find(c => c.id === "gir");
  const putter = cats.find(c => c.id === "putter");
  const scoring = cats.find(c => c.id === "scoring");

  return (
    <section className="section">
      <Reveal>
        <div className="section-head">
          <div>
            <Eyebrow>Kategorier</Eyebrow>
            <h2>Seks tall som forteller<br/><em className="italic-accent">alt</em> om en runde.</h2>
          </div>
        </div>
      </Reveal>

      <div className="bento pga">
        {/* Drive distance — featured */}
        <Reveal className="b-drive">
          <div className="bento-card">
            <div className="bento-arrow"><Icon name="ArrowRight" size={20}/></div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="bento-icon"><Icon name={drive.icon} size={22}/></div>
                <h3>{drive.navn}</h3>
                <div className="bento-desc">{drive.undertittel}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="mini-mono">TOUR-SNITT</div>
                <div className="bento-big-number">
                  <CountUp value={drive.verdi} decimals={1}/>
                  <span className="unit">{drive.enhet}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "end" }}>
              <Topp3List items={drive.topp3} unit={drive.enhet}/>
              <div>
                <div className="mini-mono" style={{ marginBottom: 8 }}>FORDELING · TOPP 5</div>
                <SparkBars values={drive.sparkline} height={64} highlight={3}/>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Fairway-treff */}
        <Reveal delay={80} className="b-fairway">
          <div className="bento-card">
            <div className="bento-arrow"><Icon name="ArrowRight" size={20}/></div>
            <div className="bento-icon"><Icon name={fairway.icon} size={22}/></div>
            <h3>{fairway.navn}</h3>
            <div className="bento-desc">{fairway.undertittel}</div>
            <div className="bento-med-number">
              <CountUp value={fairway.verdi} decimals={1}/>
              <span className="unit">{fairway.enhet}</span>
            </div>
            <Topp3List items={fairway.topp3} unit={fairway.enhet}/>
          </div>
        </Reveal>

        {/* GIR */}
        <Reveal delay={120} className="b-gir">
          <div className="bento-card">
            <div className="bento-arrow"><Icon name="ArrowRight" size={20}/></div>
            <div className="bento-icon"><Icon name={gir.icon} size={22}/></div>
            <h3>{gir.navn}</h3>
            <div className="bento-desc">{gir.undertittel}</div>
            <div className="bento-med-number">
              <CountUp value={gir.verdi} decimals={1}/>
              <span className="unit">{gir.enhet}</span>
            </div>
            <Topp3List items={gir.topp3} unit={gir.enhet}/>
          </div>
        </Reveal>

        {/* Putter per runde */}
        <Reveal delay={160} className="b-putter">
          <div className="bento-card">
            <div className="bento-arrow"><Icon name="ArrowRight" size={20}/></div>
            <div className="bento-icon"><Icon name={putter.icon} size={22}/></div>
            <h3>{putter.navn}</h3>
            <div className="bento-desc">{putter.undertittel}</div>
            <div className="bento-med-number">
              <CountUp value={putter.verdi} decimals={1}/>
            </div>
            <Topp3List items={putter.topp3} unit="" decimals={1}/>
          </div>
        </Reveal>

        {/* Scoring average */}
        <Reveal delay={200} className="b-scoring">
          <div className="bento-card">
            <div className="bento-arrow"><Icon name="ArrowRight" size={20}/></div>
            <div className="bento-icon"><Icon name={scoring.icon} size={22}/></div>
            <h3>{scoring.navn}</h3>
            <div className="bento-desc">{scoring.undertittel}</div>
            <div className="bento-med-number">
              <CountUp value={scoring.verdi} decimals={2}/>
            </div>
            <Topp3List items={scoring.topp3} unit="" decimals={2}/>
          </div>
        </Reveal>

        {/* SG Total — full width leaderboard */}
        <Reveal delay={240} className="b-sgtotal">
          <div className="bento-card">
            <div className="bento-arrow"><Icon name="ArrowRight" size={20}/></div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
              <div>
                <div className="bento-icon"><Icon name="Sparkles" size={22}/></div>
                <h3>Strokes Gained · Total</h3>
                <div className="bento-desc">Den enkleste måten å rangere golfere på. Høyere er bedre — vektet mot felt-snittet, ikke par.</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="mini-mono">TOPP 10 · OPPDATERT MANDAG</div>
                <div className="bento-med-number" style={{ color: "var(--primary)" }}>
                  +<CountUp value={2.34} decimals={2}/>
                </div>
                <div className="mini-mono" style={{ color: "var(--muted-fg)" }}>SG/runde · #1</div>
              </div>
            </div>

            <SGLeaderboard rows={D.sgTotal}/>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SGLeaderboard({ rows }) {
  const [sortBy, setSortBy] = useState("value");
  const sorted = useMemo(() => [...rows].sort((a, b) => b[sortBy] - a[sortBy]), [rows, sortBy]);

  const ths = [
    { id: "value",  label: "SG TOTAL" },
    { id: "sgOTT",  label: "OFF TEE" },
    { id: "sgAPP",  label: "APPROACH" },
    { id: "sgPUT",  label: "PUTTING" },
  ];

  return (
    <div className="lb">
      <div className="lb-row lb-head">
        <span>#</span>
        <span></span>
        <span>SPILLER</span>
        {ths.map(t => (
          <span key={t.id}
                onClick={() => setSortBy(t.id)}
                style={{ cursor: "pointer", textAlign: "right", color: sortBy === t.id ? "var(--primary)" : "inherit" }}>
            {t.label} {sortBy === t.id && "↓"}
          </span>
        ))}
      </div>
      {sorted.map((r, i) => (
        <div className="lb-row" key={r.name}>
          <span className="lb-rank">{i + 1}</span>
          <FlagGlyph code={r.country} size={16}/>
          <span className="lb-name">
            <span className="lb-avatar">{r.initials}</span>
            {r.name}
          </span>
          <span className="lb-chip" style={{ textAlign: "right" }}>+{r.value.toFixed(2)}</span>
          <span className="lb-val pos" style={{ textAlign: "right" }}>{r.sgOTT > 0 ? "+" : ""}{r.sgOTT.toFixed(2)}</span>
          <span className="lb-val pos" style={{ textAlign: "right" }}>{r.sgAPP > 0 ? "+" : ""}{r.sgAPP.toFixed(2)}</span>
          <span className="lb-val pos" style={{ textAlign: "right" }}>{r.sgPUT > 0 ? "+" : ""}{r.sgPUT.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

function PuttExplorerTeaser() {
  const D = window.AKG_DATA;
  return (
    <Reveal>
      <section className="section section-divider">
        <div className="putt-teaser">
          <div>
            <Eyebrow tone="lime">Interaktivt</Eyebrow>
            <h2>
              Hva senker snittet<br/>
              fra <em className="italic-accent">3 meter</em>?
            </h2>
            <p>
              PGA Tour-snittet fra 3 meter er 48%. Du hadde gjettet høyere, hadde du ikke?
              Putt Explorer lar deg utforske hver avstand, og se hvor amatøren faller bak proffen.
            </p>
            <Btn variant="outline" icon="ArrowRight">Lek deg med putt-data</Btn>
          </div>
          <div>
            <PuttPreview data={D.puttDistribusjon} height={220}/>
            <div className="putt-legend">
              <span><span className="putt-legend-dot" style={{ background: "var(--accent)" }}/>PGA Tour</span>
              <span><span className="putt-legend-dot" style={{ background: "rgba(209, 248, 67, 0.25)" }}/>Amatør hcp 10</span>
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

function PGAMersalg() {
  return (
    <Reveal>
      <section className="section section-divider">
        <div className="mersalg">
          <div className="mersalg-bg-glyph" aria-hidden>
            <Icon name="LineChart" size={420} stroke={1}/>
          </div>
          <div>
            <Eyebrow tone="lime">Din egen statistikk</Eyebrow>
            <h2>
              Lurer du på<br/>
              hvordan <em className="italic-accent">du</em> ligger an?
            </h2>
            <p>
              PlayerHQ regner ut din egen Strokes Gained fra hvert scorekort. Du ser hvor strokene tapes — drive, innspill, putt — og hvor du står mot Tour-snittet over tid.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Btn variant="primary" icon="ArrowRight">
                <span style={{ color: "var(--bg)" }}>Prøv gratis</span>
              </Btn>
              <Btn variant="outline" icon="ArrowRight">Sammenlign uten konto</Btn>
            </div>
          </div>

          <div className="mersalg-card">
            <h4>Du vs Tour</h4>
            <DuVsTour/>
            <div className="mersalg-price">
              <strong>300 kr/mnd</strong> · gratis under beta
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}

function DuVsTour() {
  // Simple SG comparison strip
  const rows = [
    { label: "Off the tee", du: -0.42, tour: 0 },
    { label: "Approach",    du: -0.91, tour: 0 },
    { label: "Around green", du: -0.28, tour: 0 },
    { label: "Putting",     du: -0.65, tour: 0 },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
      {rows.map((r, i) => {
        const total = 2.5; // full scale
        const tourPos = 50; // center
        const duPos = 50 + (r.du / total) * 50;
        return (
          <div key={r.label}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 11, marginBottom: 6 }}>
              <span style={{ color: "var(--accent)" }}>{r.label}</span>
              <span style={{ color: "var(--bg)" }}>{r.du.toFixed(2)}</span>
            </div>
            <div style={{ position: "relative", height: 6, background: "rgba(209,248,67,0.12)", borderRadius: 3 }}>
              <div style={{
                position: "absolute", left: "50%", top: -3, bottom: -3, width: 1,
                background: "rgba(209, 248, 67, 0.4)"
              }}/>
              <div style={{
                position: "absolute", height: 6, borderRadius: 3,
                left: `${Math.min(duPos, 50)}%`, right: `${100 - Math.max(duPos, 50)}%`,
                background: "var(--accent)",
              }}/>
              <div style={{
                position: "absolute", width: 10, height: 10, borderRadius: 5,
                background: "var(--bg)", border: "2px solid var(--accent)",
                left: `${duPos}%`, top: "50%", transform: "translate(-50%, -50%)"
              }}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PGAFooterNudge() {
  return (
    <section className="section-sm" style={{ borderTop: "1px solid var(--border)", textAlign: "center" }}>
      <Reveal>
        <p style={{ fontSize: 14, color: "var(--muted-fg)" }}>
          Vil du legge inn dine egne SG-tall?{" "}
          <a href="#" style={{ color: "var(--primary)", fontWeight: 500, textDecoration: "underline", textUnderlineOffset: 4 }}>
            Prøv sammenligningsverktøyet →
          </a>
        </p>
      </Reveal>
    </section>
  );
}

function PGAHub() {
  return (
    <div>
      <PGAHero/>
      <PGAKpiStrip/>
      <PGABento/>
      <PuttExplorerTeaser/>
      <PGAMersalg/>
      <PGAFooterNudge/>
    </div>
  );
}

Object.assign(window, { PGAHub });
