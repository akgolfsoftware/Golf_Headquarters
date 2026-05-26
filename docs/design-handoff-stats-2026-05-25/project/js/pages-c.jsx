// Pages 11-15: Wrapped, Roundup, Banedatabase, Leaderboards, Årgang

// ───── 11 Wrapped ─────
function Wrapped() {
  const D = window.AKG_DATA;
  const w = D.wrapped;
  const [slide, setSlide] = useState(0);

  const slides = [
    { bg: "default", eyebrow: "DIN GOLFSESONG", big: w.sesong, label: w.navn, sub: "Klikk for å starte →" },
    { bg: "default", eyebrow: "RUNDER",        big: w.totalRunder, label: `Du spilte ${w.totalRunder} runder i ${w.sesong}`, sub: "Det er 8 flere enn i fjor. Norske amatører spiller 28 i snitt." },
    { bg: "lime",    eyebrow: "SNITT",         big: w.snittScore, label: "Sesongsnitt — brutto", sub: "Tilsvarer HCP 9,5. Norge-snittet for menn er HCP 18." },
    { bg: "default", eyebrow: "BESTE RUNDE",   big: w.besteRunde.score, label: `${w.besteRunde.bane} · ${w.besteRunde.turnering}`, sub: "Du hadde 28 putter den runden — Tour-snitt er 28,5." },
    { bg: "lime",    eyebrow: "KLUBBER",       big: w.klubberSpilt.length, label: "Forskjellige baner besøkt", sub: `Mest spilte: ${w.klubberSpilt[0]} (12 runder).` },
    { bg: "default", eyebrow: "UTVIKLING",     big: w.forbedring, label: "Strokes forbedring fra 2025", sub: "Det er bedre enn 78 % av spillerne i din aldersgruppe." },
    { bg: "lime",    eyebrow: "STREAK",        big: `${w.streak} dager`, label: "Lengste runde-streak", sub: "I løpet av sommer-finalsen — turneringer rygg-i-rygg." },
    { bg: "dark",    eyebrow: "RANKING",       big: `#${w.rankingINasjon}`, label: "av 1 547 norske spillere", sub: `#${w.rankingIAldersgruppe} av 142 i din aldersgruppe (2007-årgangen).` },
    { bg: "default", eyebrow: "SAMMENLIGNING", big: "📊", label: `Du ligner ${w.ligneSpiller}`, sub: "Han ble pro 2 år etter dette. Din neste sesong er kritisk." },
    { bg: "lime",    eyebrow: "KLAR FOR 2027?", big: "→", label: "Del eller logg neste runde", sub: "" },
  ];

  const current = slides[slide];

  return (
    <div>
      <div className={`wrapped-stage ${current.bg === "lime" ? "lime" : (current.bg === "dark" ? "dark" : "")}`}>
        <div className="wrapped-progress">
          {slides.map((_, i) => (
            <div key={i} className={i < slide ? "done" : (i === slide ? "active" : "")}/>
          ))}
        </div>

        <div className="wrapped-eyebrow">{current.eyebrow}</div>

        {slide === 0 ? (
          <>
            <div className="wrapped-big italic">{current.big}</div>
            <div className="wrapped-sub" style={{ marginTop: 32 }}>{w.navn}</div>
          </>
        ) : slide === 8 ? (
          <>
            <div className="qpick-avatar" style={{ width: 96, height: 96, fontSize: 32, color: "var(--primary)" }}>KV</div>
            <div className="wrapped-sub" style={{ marginTop: 24 }}>{current.label}</div>
            <div className="wrapped-context">{current.sub}</div>
          </>
        ) : slide === 9 ? (
          <>
            <div className="wrapped-sub" style={{ fontSize: 36 }}>{current.eyebrow}</div>
            <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap", justifyContent: "center" }}>
              <Btn variant="primary" icon="ExternalLink"><span style={{ color: "var(--bg)" }}>Del på X / Instagram</span></Btn>
              <Btn variant="outline" icon="ArrowRight">Prøv PlayerHQ</Btn>
            </div>
          </>
        ) : (
          <>
            <div className="wrapped-big">
              {typeof current.big === "number"
                ? <CountUp value={current.big} duration={900} decimals={current.big % 1 !== 0 ? 1 : 0}/>
                : current.big}
            </div>
            <div className="wrapped-sub">{current.label}</div>
            {current.sub && <div className="wrapped-context">{current.sub}</div>}
          </>
        )}

        <div className="wrapped-controls">
          <button onClick={() => setSlide(Math.max(0, slide - 1))} disabled={slide === 0}>
            ← Forrige
          </button>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, padding: "8px 14px", opacity: 0.7 }}>
            {slide + 1} / {slides.length}
          </span>
          <button onClick={() => setSlide(Math.min(slides.length - 1, slide + 1))} disabled={slide === slides.length - 1}>
            Neste →
          </button>
        </div>
      </div>

      <section className="section">
        <Reveal>
          <div style={{ textAlign: "center" }}>
            <Eyebrow>Om denne sesongen</Eyebrow>
            <h2 style={{ marginTop: 12 }}>{w.navn}s år i tall.</h2>
            <p className="muted-foreground" style={{ maxWidth: 520, margin: "16px auto 0" }}>
              Wrapped genereres automatisk 31. desember hvert år. Vis denne fra mobilen for portrait-modus.
            </p>
          </div>
        </Reveal>
      </section>

      <MersalgBand/>
    </div>
  );
}

// ───── 12 Ukentlig roundup ─────
function Roundup() {
  const D = window.AKG_DATA;
  const u = D.uka;

  return (
    <div>
      <section className="hero compact">
        <Reveal>
          <div className="row-between">
            <Eyebrow>Uke {u.ukenr} · {u.aar}</Eyebrow>
            <span className="mini-mono">{u.fra.toUpperCase()} — {u.til.toUpperCase()}</span>
          </div>
          <h1 style={{ marginTop: 24, fontSize: 88, fontStyle: "italic", fontWeight: 500 }}>
            Norsk golf<br/>denne uken.
          </h1>
          <p className="hero-sub" style={{ maxWidth: 580 }}>
            Tre podiumplasseringer, én seier. {u.norskeAntall} nordmenn i aksjon på {u.turneringerAntall} ulike turneringer.
          </p>
        </Reveal>
      </section>

      <Reveal>
        <div className="kpi-strip" style={{ borderRadius: 0 }}>
          <div className="kpi">
            <div className="kpi-eyebrow">Norske</div>
            <div className="kpi-value"><CountUp value={u.norskeAntall}/></div>
            <div className="kpi-sub">spilte denne uka</div>
          </div>
          <div className="kpi">
            <div className="kpi-eyebrow">Turneringer</div>
            <div className="kpi-value"><CountUp value={u.turneringerAntall}/></div>
            <div className="kpi-sub">på 4 ulike tourer</div>
          </div>
          <div className="kpi">
            <div className="kpi-eyebrow">Podium</div>
            <div className="kpi-value"><CountUp value={u.podium}/></div>
            <div className="kpi-sub">hvorav 1 seier</div>
          </div>
        </div>
      </Reveal>

      <section className="section section-divider">
        <Reveal>
          <div style={{ background: "rgba(0,88,64,0.05)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: 48 }}>
            <Eyebrow>Ukens spiller</Eyebrow>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 48, marginTop: 20, alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: 64, fontWeight: 600, lineHeight: 1 }}>
                  Anders <em className="italic-accent">Halvorsen</em>
                </h2>
                <p style={{ fontSize: 18, lineHeight: 1.5, marginTop: 24, maxWidth: 560 }}>
                  {u.ukensSpiller.hvorfor}
                </p>
                <a href="#" style={{ marginTop: 24, display: "inline-block", fontSize: 14, color: "var(--primary)", fontWeight: 600 }}>
                  Se hele profilen →
                </a>
              </div>
              <div style={{ width: 120, height: 120, borderRadius: "50%", background: "var(--accent)", color: "var(--primary)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 32, fontWeight: 700 }}>
                {u.ukensSpiller.initials}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div className="grid-2">
            <div>
              <Eyebrow>Ukens runde</Eyebrow>
              <div className="editorial-num" style={{ fontSize: 96, marginTop: 16, color: "var(--primary)" }}>
                {u.ukensRunde.score}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, marginTop: 8 }}>
                {u.ukensRunde.bane}
              </div>
              <div className="muted-foreground" style={{ marginTop: 6, fontSize: 14 }}>
                av {u.ukensRunde.spiller} · Srixon Tour 5
              </div>
              <p style={{ fontSize: 14, fontStyle: "italic", color: "var(--muted-fg)", marginTop: 20, maxWidth: 380 }}>
                «{u.ukensRunde.kontekst}»
              </p>
            </div>

            <div className="pull-quote" style={{ borderTop: "none", borderBottom: "none", padding: 0, margin: 0 }}>
              «{u.fakta}»
              <div className="pull-quote-credit">AK Golf Stats redaksjon</div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div className="section-head">
            <div>
              <Eyebrow>Alle resultater</Eyebrow>
              <h2>Hvor norske <em className="italic-accent">stod fram</em>.</h2>
            </div>
            <div className="chips">
              {["Alle", "Pro", "Amatør", "Junior"].map(t => (
                <button key={t} className={`chip ${t === "Alle" ? "active" : ""}`}>{t}</button>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={60}>
          <table className="dtable">
            <thead>
              <tr><th>Tour</th><th>Spiller</th><th>Turnering</th><th>Posisjon</th><th className="num">Score</th></tr>
            </thead>
            <tbody>
              {u.resultater.map((r, i) => (
                <tr key={i} className={r.star ? "norsk-row" : ""}>
                  <td><span className="mini-mono">{r.tour.toUpperCase()}</span></td>
                  <td><a href="#">{r.spiller}</a> {r.star && <span style={{ color: "var(--primary)", marginLeft: 6 }}>★</span>}</td>
                  <td>{r.turnering}</td>
                  <td className="mono">{r.pos}</td>
                  <td className="num">{r.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div className="section-head">
            <div>
              <Eyebrow>Kommende uke</Eyebrow>
              <h2>26. mai — 1. juni</h2>
            </div>
          </div>
        </Reveal>
        <Reveal delay={60}>
          <div className="grid-4" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
            {u.kommende.map((day, i) => (
              <div key={i} style={{ background: day.t ? "var(--card)" : "transparent", border: day.t ? "1px solid var(--border)" : "1px dashed var(--border)", borderRadius: "var(--r-md)", padding: 14, minHeight: 120 }}>
                <div className="mini-mono">{day.dag} · {day.dato}</div>
                {day.t ? (
                  <>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14, marginTop: 10, lineHeight: 1.3 }}>{day.t.navn}</div>
                    <div className="muted-foreground" style={{ fontSize: 11, marginTop: 4 }}>{day.t.bane}</div>
                    <div style={{ marginTop: 10, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--primary)", fontWeight: 600 }}>{day.t.norske} norske</div>
                  </>
                ) : (
                  <div className="muted-foreground" style={{ fontSize: 11, marginTop: 12 }}>—</div>
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div style={{ background: "var(--secondary)", borderRadius: "var(--r-lg)", padding: 40, textAlign: "center" }}>
            <h3 style={{ fontSize: 28, fontWeight: 600 }}>Få ukens roundup i innboksen.</h3>
            <p className="muted-foreground" style={{ marginTop: 12, fontSize: 15 }}>Hver mandag morgen, 60 sekunder å lese.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
              <input type="email" placeholder="din@email.com"
                style={{ padding: "12px 16px", borderRadius: 999, border: "1px solid var(--border)", fontFamily: "inherit", fontSize: 14, minWidth: 280, background: "var(--bg)" }}/>
              <Btn variant="primary" icon="ArrowRight">Meld på</Btn>
            </div>
            <div className="mini-mono" style={{ marginTop: 20 }}>
              2 547 ABONNENTER · AVREGISTRER NÅR SOM HELST
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

// ───── 13 Banedatabase ─────
function Banedatabase() {
  const D = window.AKG_DATA;
  const [region, setRegion] = useState("Alle");
  const banes = region === "Alle" ? D.baner : D.baner.filter(b => b.region === region);

  return (
    <div>
      <section className="hero compact">
        <Reveal>
          <Eyebrow>AK Golf Stats · Baner</Eyebrow>
          <h1>Alle <em className="italic-accent">norske</em> golfbaner.</h1>
          <p className="hero-sub" style={{ maxWidth: 580 }}>
            Vanskelighetsgrad, slope, course rating + vår statistikk fra ekte turneringer på hver bane.
          </p>
        </Reveal>
      </section>

      <Reveal>
        <div className="kpi-strip" style={{ borderRadius: 0 }}>
          <div className="kpi">
            <div className="kpi-eyebrow">Baner</div>
            <div className="kpi-value"><CountUp value={50}/></div>
            <div className="kpi-sub">i databasen</div>
          </div>
          <div className="kpi">
            <div className="kpi-eyebrow">Turneringer</div>
            <div className="kpi-value"><CountUp value={287}/></div>
            <div className="kpi-sub">arrangert her</div>
          </div>
          <div className="kpi">
            <div className="kpi-eyebrow">Spillere</div>
            <div className="kpi-value mono" style={{ fontSize: 28, marginTop: 8 }}>1 547</div>
            <div className="kpi-sub" style={{ marginTop: 8 }}>har spilt her</div>
          </div>
        </div>
      </Reveal>

      <section className="section section-divider">
        <Reveal>
          <div style={{ maxWidth: 520, margin: "0 auto 24px" }}>
            <SearchBox value="" onChange={() => {}} placeholder="Søk bane eller klubb…" size="lg"/>
          </div>
          <ChipGroup label="Region" options={["Alle", "Øst", "Vest", "Midt", "Sør", "Nord"]} value={region} onChange={setRegion}/>
        </Reveal>

        <div className="grid-3" style={{ marginTop: 32 }}>
          {banes.map((b, i) => (
            <Reveal key={b.slug} delay={i * 50}>
              <div className="media-card">
                <div className="media-card-img">[ Hovedbilde · {b.navn} ]</div>
                <div className="media-card-body">
                  <div className="media-card-eyebrow">
                    <span>{b.kommune.toUpperCase()} · {b.region.toUpperCase()}</span>
                    <span>{b.oppstart}</span>
                  </div>
                  <h3 className="media-card-title">{b.navn}</h3>
                  <div className="row" style={{ marginTop: 14, gap: 18, flexWrap: "wrap" }}>
                    <div>
                      <div className="mini-mono">LENGDE</div>
                      <div className="mono" style={{ fontWeight: 500 }}>{b.lengde} m</div>
                    </div>
                    <div>
                      <div className="mini-mono">SLOPE</div>
                      <div className="mono" style={{ fontWeight: 500 }}>{b.slope}</div>
                    </div>
                    <div>
                      <div className="mini-mono">CR</div>
                      <div className="mono" style={{ fontWeight: 500 }}>{b.cr}</div>
                    </div>
                    <div>
                      <div className="mini-mono">PAR</div>
                      <div className="mono" style={{ fontWeight: 500 }}>{b.par}</div>
                    </div>
                  </div>
                  <div className="media-card-foot">
                    ★ {b.turneringer} TURNERINGER ARRANGERT
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <MersalgBand/>
    </div>
  );
}

// ───── 14 Leaderboards ─────
function Leaderboards() {
  const D = window.AKG_DATA;

  const LBoard = ({ title, sub, rows, valueKey = "value", valueFmt = (v) => v, nameKey = "name", icon }) => (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 24 }}>
      <div className="row-between" style={{ marginBottom: 4 }}>
        <div className="mini-mono">{title}</div>
        {icon && <Icon name={icon} size={14} style={{ color: "var(--muted-fg)" }}/>}
      </div>
      {sub && <div className="muted-foreground" style={{ fontSize: 11, marginBottom: 14 }}>{sub}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {rows.slice(0, 10).map((r, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "20px 1fr auto", gap: 10, padding: "6px 0", borderBottom: i < 9 ? "1px dashed var(--border)" : "none", alignItems: "center", fontSize: 13 }}>
            <span className="mono muted-foreground" style={{ fontSize: 11 }}>{i+1}</span>
            <span style={{ fontWeight: i < 3 ? 600 : 500 }}>{r[nameKey]}</span>
            <span className="mono" style={{ fontWeight: 500, color: i < 3 ? "var(--primary)" : "inherit" }}>{valueFmt(r[valueKey])}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <section className="hero compact">
        <Reveal>
          <Eyebrow>AK Golf Stats · Leaderboards</Eyebrow>
          <h1>Alle topp-10-ene. <em className="italic-accent">Ett sted.</em></h1>
          <p className="hero-sub">Tverrkategori-leaderboards på tvers av tourer, kategorier og kuriositeter.</p>
        </Reveal>

        <Reveal delay={80}>
          <div style={{ maxWidth: 600, marginTop: 32 }}>
            <SearchBox value="" onChange={() => {}} placeholder="Søk i leaderboards — «drive», «sg total», «forbedring»…"/>
          </div>
        </Reveal>
      </section>

      <section className="section section-divider">
        <TabBar tabs={[
          { id: "pga",      label: "PGA Tour" },
          { id: "norske",   label: "Norske" },
          { id: "klubber",  label: "Klubber" },
          { id: "kuriosa",  label: "Kuriositeter" },
        ]} active="pga" onChange={() => {}} sticky/>

        <div style={{ marginTop: 40 }}>
          <Eyebrow>PGA Tour 2026</Eyebrow>
          <h2 style={{ marginTop: 12, marginBottom: 32 }}>Topp 10 per kategori.</h2>

          <div className="grid-3">
            <LBoard
              title="DRIVE DISTANCE"
              sub="yds · sesong 2026"
              rows={D.pgaKategorier.find(k => k.id === "drive").topp3.concat(
                [{ name: "A. Stenmark", value: 316.4 }, { name: "M. Klemmer", value: 314.8 }, { name: "L. Whitfield", value: 313.5 },
                 { name: "B. Castillo", value: 312.1 }, { name: "J. Tanaka", value: 310.4 }, { name: "C. Nieuwhuys", value: 309.8 }, { name: "P. Donato", value: 308.2 }]
              )}
              valueFmt={(v) => v.toFixed(1)}
              icon="Crosshair"/>
            <LBoard
              title="FAIRWAY-TREFF"
              sub="% · sesong 2026"
              rows={D.pgaKategorier.find(k => k.id === "fairway").topp3.concat([
                { name: "P. Bertl",   value: 70.4 }, { name: "M. Andersen", value: 69.8 },
                { name: "T. Knudsen", value: 68.5 }, { name: "K. Larson",   value: 67.9 },
                { name: "J. Halvorsen", value: 67.2 }, { name: "S. Tan",   value: 66.4 }, { name: "A. Kovac", value: 65.8 }])}
              valueFmt={(v) => v.toFixed(1) + "%"}
              icon="Target"/>
            <LBoard
              title="GIR"
              sub="% · sesong 2026"
              rows={D.pgaKategorier.find(k => k.id === "gir").topp3.concat([
                { name: "R. Holmberg", value: 75.1 }, { name: "S. Devlin", value: 74.6 },
                { name: "J. Hoffmann", value: 74.1 }, { name: "K. Vangen",  value: 73.8 },
                { name: "P. Donato",   value: 73.4 }, { name: "M. Andersen", value: 73.0 }, { name: "B. Castillo", value: 72.6 }])}
              valueFmt={(v) => v.toFixed(1) + "%"}
              icon="Flag"/>
            <LBoard
              title="PUTTER PER RUNDE"
              sub="lavere = bedre · sesong 2026"
              rows={D.pgaKategorier.find(k => k.id === "putter").topp3.concat([
                { name: "S. Devlin", value: 27.9 }, { name: "O. Yamagata", value: 28.1 },
                { name: "J. Sørli", value: 28.2 }, { name: "M. Olafsson", value: 28.3 },
                { name: "P. Laaksonen", value: 28.4 }, { name: "C. Møller", value: 28.5 }, { name: "T. Knudsen", value: 28.6 }])}
              valueFmt={(v) => v.toFixed(1)}
              icon="Circle"/>
            <LBoard
              title="SCORING AVERAGE"
              sub="lavere = bedre · sesong 2026"
              rows={D.pgaKategorier.find(k => k.id === "scoring").topp3.concat([
                { name: "R. McIlroy", value: 69.42 }, { name: "X. Schauffele", value: 69.58 },
                { name: "S. Scheffler", value: 69.74 }, { name: "T. Fleetwood", value: 69.92 },
                { name: "J. Rahm", value: 70.04 }, { name: "P. Cantlay", value: 70.18 }, { name: "C. Morikawa", value: 70.32 }])}
              valueFmt={(v) => v.toFixed(2)}
              icon="LineChart"/>
            <LBoard
              title="SG TOTAL"
              sub="strokes/runde vs Tour-snitt"
              rows={D.sgTotal}
              valueFmt={(v) => "+" + v.toFixed(2)}
              icon="Sparkles"/>
          </div>
        </div>

        <div style={{ marginTop: 64 }}>
          <Eyebrow>Norske · sesong 2026</Eyebrow>
          <h2 style={{ marginTop: 12, marginBottom: 32 }}>
            Hvem dominerer <em className="italic-accent">i Norge</em>?
          </h2>
          <div className="grid-3">
            <LBoard title="BESTE SNITT" sub="2026 · min 15 runder" rows={D.norskeBesteSnitt} valueKey="snitt" nameKey="spiller" valueFmt={(v) => v.toFixed(1)}/>
            <LBoard title="STØRSTE FORBEDRING" sub="2025 → 2026" rows={D.norskeForbedring} valueKey="diff" nameKey="spiller" valueFmt={(v) => v.toFixed(1)}/>
            <LBoard title="MEST AKTIVE" sub="turneringer i 2026" rows={D.norskeMestAktive} valueKey="antall" nameKey="spiller" valueFmt={(v) => v}/>
          </div>
        </div>

        <div style={{ marginTop: 64 }}>
          <Eyebrow>Kuriositeter</Eyebrow>
          <h2 style={{ marginTop: 12, marginBottom: 32 }}>Gøy <em className="italic-accent">data</em> fra arkivet.</h2>
          <div className="grid-3">
            {[
              { tit: "Laveste 18-hulls runde", big: "62", who: "Anders Halvorsen", ctx: "Srixon Tour 5, Bærum GK · 14. juni 2024", txt: "«Hadde 7 birdies og én eagle»" },
              { tit: "Yngste turneringsvinner", big: "15 år", who: "Marius Larsen", ctx: "Srixon Tour 4 · 17. mai 2025", txt: "«Visste ikke han kunne vinne»" },
              { tit: "Lengste streak uten 3-putt", big: "8 runder", who: "Sofie Næss", ctx: "April–mai 2026", txt: "Norsk amatør-rekord siden 2020" },
            ].map((c, i) => (
              <div key={i} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 28 }}>
                <div className="mini-mono">{c.tit.toUpperCase()}</div>
                <div className="editorial-num" style={{ fontSize: 64, marginTop: 12, color: "var(--primary)" }}>{c.big}</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, marginTop: 12 }}>{c.who}</div>
                <div className="muted-foreground" style={{ fontSize: 12, marginTop: 4 }}>{c.ctx}</div>
                <p style={{ fontStyle: "italic", color: "var(--muted-fg)", fontSize: 13, marginTop: 16, lineHeight: 1.5 }}>{c.txt}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MersalgBand/>
    </div>
  );
}

// ───── 15 Årgang/Kohort ─────
function ArgangKohort() {
  const D = window.AKG_DATA;
  const k = D.kohort2009;

  return (
    <div>
      <section className="hero compact">
        <Reveal>
          <Eyebrow>Årgang {k.aar} · {k.alder} år gamle nå</Eyebrow>
          <h1>Norges <em className="italic-accent">{k.aar}-talenter</em>.</h1>
          <p className="hero-sub">
            {k.totalSpillere} norske spillere født i {k.aar}. Vi tracker dem alle siden første Srixon-turneringen i 2018.
          </p>
        </Reveal>
      </section>

      <Reveal>
        <div className="kpi-strip cols-4" style={{ borderRadius: 0 }}>
          <div className="kpi">
            <div className="kpi-eyebrow">Spillere</div>
            <div className="kpi-value"><CountUp value={k.totalSpillere}/></div>
          </div>
          <div className="kpi">
            <div className="kpi-eyebrow">Runder</div>
            <div className="kpi-value mono" style={{ fontSize: 36 }}>2 487</div>
          </div>
          <div className="kpi">
            <div className="kpi-eyebrow">Turneringer</div>
            <div className="kpi-value"><CountUp value={k.totalTurneringer}/></div>
          </div>
          <div className="kpi">
            <div className="kpi-eyebrow">College-commits</div>
            <div className="kpi-value"><CountUp value={k.collegeCommits}/></div>
          </div>
        </div>
      </Reveal>

      <section className="section section-divider">
        <Reveal>
          <div className="section-head">
            <div>
              <Eyebrow>Toppen av kohorten</Eyebrow>
              <h2>Topp 10 etter <em className="italic-accent">snittscore 2026</em>.</h2>
            </div>
          </div>
        </Reveal>
        <Reveal delay={60}>
          <table className="dtable">
            <thead>
              <tr><th>#</th><th>Spiller</th><th>Klubb</th><th className="num">Snitt</th><th className="num">Turneringer</th></tr>
            </thead>
            <tbody>
              {k.topp10.map(r => (
                <tr key={r.rank}>
                  <td className="mono">{r.rank}</td>
                  <td><a href="#">{r.navn}</a></td>
                  <td>{r.klubb}</td>
                  <td className="num" style={{ color: r.rank <= 3 ? "var(--primary)" : "inherit" }}>{r.snitt.toFixed(1)}</td>
                  <td className="num">{r.antall}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </section>

      <section className="section section-divider">
        <div className="grid-2">
          <Reveal>
            <div>
              <Eyebrow>Fordeling</Eyebrow>
              <h2 style={{ marginTop: 12 }}>Score-fordeling i kohorten.</h2>
              <p className="muted-foreground" style={{ marginTop: 12, fontSize: 14 }}>
                Norsk snitt 17-åringer: 76.5 · Tour-snitt: 70.5
              </p>
              <div style={{ marginTop: 20 }}>
                <Histogram data={k.scoreDist} highlight={2} valueKey="n" labelKey="bin" height={160}/>
              </div>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div>
              <Eyebrow>Klubb-fordeling</Eyebrow>
              <h2 style={{ marginTop: 12 }}>Hvor talentet kommer fra.</h2>
              <div style={{ display: "flex", gap: 32, alignItems: "center", marginTop: 20 }}>
                <Donut data={k.klubbFordeling.map(c => ({ n: c.n, label: c.klubb }))} size={200}/>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                  {k.klubbFordeling.map((c, i) => {
                    const colors = ["#005840", "#D1F843", "#F1EEE5", "#5E5C57", "#A6E3CF"];
                    return (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: "1px dashed var(--border)" }}>
                        <span><span style={{ display: "inline-block", width: 10, height: 10, background: colors[i], borderRadius: 2, marginRight: 8 }}/>{c.klubb}</span>
                        <span className="mono" style={{ fontWeight: 500 }}>{c.n}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div className="section-head">
            <div>
              <Eyebrow>College</Eyebrow>
              <h2>{k.aar}-kohortens <em className="italic-accent">college-commits</em>.</h2>
            </div>
          </div>
        </Reveal>
        <div className="grid-3">
          {k.college.map((c, i) => (
            <Reveal key={i} delay={i * 80}>
              <div style={{ background: "var(--primary)", color: "var(--bg)", borderRadius: "var(--r-lg)", padding: 28 }}>
                <Icon name="Trophy" size={24} style={{ color: "var(--accent)" }}/>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, marginTop: 14 }}>{c.navn}</div>
                <div style={{ color: "var(--accent)", fontSize: 14, marginTop: 8, fontWeight: 500 }}>{c.universitet}</div>
                <div className="mini-mono" style={{ color: "var(--accent)", marginTop: 6 }}>{c.div}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <MersalgBand/>
    </div>
  );
}

Object.assign(window, { Wrapped, Roundup, Banedatabase, Leaderboards, ArgangKohort });
