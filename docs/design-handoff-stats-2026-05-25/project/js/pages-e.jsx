// Pages 22-29: Klubbdatabase, Tour deep-dive, Sesong, Regions, Verktøy, Søk, Turneringsdetalj, Admin

// ───── 22 Klubbdatabase ─────
function Klubbdatabase() {
  const D = window.AKG_DATA;
  const [region, setRegion] = useState("Alle");
  const klubber = region === "Alle" ? D.klubber : D.klubber.filter(k => k.region === region);

  return (
    <div>
      <section className="hero compact">
        <Reveal>
          <Eyebrow>AK Golf Stats · Norske klubber</Eyebrow>
          <h1>Alle norske <em className="italic-accent">golfklubber</em>.</h1>
          <p className="hero-sub" style={{ maxWidth: 600 }}>
            100+ klubber. Hvem produserer flest talenter? Hvor arrangeres mest?
          </p>
        </Reveal>
      </section>

      <Reveal>
        <div className="kpi-strip" style={{ borderRadius: 0 }}>
          <div className="kpi">
            <div className="kpi-eyebrow">Klubber</div>
            <div className="kpi-value mono" style={{ fontSize: 36 }}>100+</div>
            <div className="kpi-sub">i databasen</div>
          </div>
          <div className="kpi">
            <div className="kpi-eyebrow">Regioner</div>
            <div className="kpi-value">12</div>
            <div className="kpi-sub">dekket</div>
          </div>
          <div className="kpi">
            <div className="kpi-eyebrow">Turneringer</div>
            <div className="kpi-value">287</div>
            <div className="kpi-sub">arrangert siden 2016</div>
          </div>
        </div>
      </Reveal>

      <section className="section section-divider">
        <Reveal>
          <div className="section-head">
            <div>
              <Eyebrow>Featured</Eyebrow>
              <h2>Topp-3 <em className="italic-accent">klubber</em>.</h2>
            </div>
          </div>
        </Reveal>
        <div className="grid-3">
          {[
            { tit: "FLEST SPILLERE",     navn: "Oslo Golfklubb",    val: "112 spillere",  icon: "Users" },
            { tit: "MEST TURNERINGER",   navn: "Bærum Golfklubb",   val: "47 turneringer",icon: "Trophy" },
            { tit: "MEST PRO-TALENT",    navn: "Oslo Golfklubb",    val: "3 PGA-spillere",icon: "Sparkles" },
          ].map((c, i) => (
            <Reveal key={i} delay={i * 80}>
              <div style={{ background: i === 1 ? "var(--primary)" : "var(--card)", color: i === 1 ? "var(--bg)" : "var(--fg)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 32 }}>
                <Icon name={c.icon} size={28} style={{ color: i === 1 ? "var(--accent)" : "var(--primary)" }}/>
                <div className="mini-mono" style={{ marginTop: 16, color: i === 1 ? "var(--accent)" : "var(--muted-fg)" }}>{c.tit}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, marginTop: 8 }}>{c.navn}</div>
                <div className="mono" style={{ marginTop: 12, fontSize: 18, color: i === 1 ? "var(--accent)" : "var(--primary)" }}>{c.val}</div>
                <a href="#" style={{ marginTop: 20, display: "inline-block", fontSize: 13, color: i === 1 ? "var(--bg)" : "var(--primary)", fontWeight: 600 }}>Se klubb →</a>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div style={{ maxWidth: 520, marginBottom: 24 }}>
            <SearchBox value="" onChange={() => {}} placeholder="Søk klubb…"/>
          </div>
          <ChipGroup label="Region" options={["Alle", "Øst", "Vest", "Midt", "Sør", "Nord"]} value={region} onChange={setRegion}/>
        </Reveal>

        <div className="grid-3">
          {klubber.map((k, i) => (
            <Reveal key={k.slug} delay={i * 40}>
              <div className="norske-card" style={{ minHeight: 240, cursor: "pointer" }}>
                <div>
                  <div className="mini-mono">{k.region.toUpperCase()} · {k.kommune.toUpperCase()}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22, marginTop: 8 }}>{k.navn}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 8 }}>
                  <div>
                    <div className="mini-mono">SPILLERE</div>
                    <div className="mono" style={{ fontSize: 24, fontWeight: 500, marginTop: 4 }}>{k.spillere}</div>
                  </div>
                  <div>
                    <div className="mini-mono">TURNERINGER</div>
                    <div className="mono" style={{ fontSize: 24, fontWeight: 500, marginTop: 4 }}>{k.turneringer}</div>
                  </div>
                </div>
                <div style={{ borderTop: "1px dashed var(--border)", paddingTop: 14, marginTop: "auto", fontSize: 12, color: "var(--muted-fg)" }}>
                  Beste 18-hull: <strong className="mono" style={{ color: "var(--primary)" }}>62</strong> (Anders H.)
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

// ───── 23 Tour deep-dive ─────
function TourDeepDive() {
  const D = window.AKG_DATA;
  const t = D.srixon;
  const [sesong, setSesong] = useState("2026");

  return (
    <div>
      <section className="hero compact">
        <Reveal>
          <Eyebrow>{t.klasse} · siden {t.startAar}</Eyebrow>
          <h1 style={{ fontSize: 88 }}>
            Srixon <em className="italic-accent">Tour</em>.
          </h1>
          <p className="hero-sub" style={{ maxWidth: 580 }}>
            Norges fremste junior-tour. Vinner-mønstre, all-time-leaderboard, klubb-fordeling.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div className="kpi-strip cols-4" style={{ marginTop: 40, borderRadius: "var(--r-md)", border: "1px solid var(--border)" }}>
            <div className="kpi">
              <div className="kpi-eyebrow">Turneringer</div>
              <div className="kpi-value"><CountUp value={t.totalTurneringer}/></div>
              <div className="kpi-sub">siden {t.startAar}</div>
            </div>
            <div className="kpi">
              <div className="kpi-eyebrow">Deltakelser</div>
              <div className="kpi-value mono" style={{ fontSize: 36 }}>6 117</div>
              <div className="kpi-sub">totale</div>
            </div>
            <div className="kpi">
              <div className="kpi-eyebrow">Unike spillere</div>
              <div className="kpi-value"><CountUp value={t.uniqueSpillere}/></div>
            </div>
            <div className="kpi">
              <div className="kpi-eyebrow">Sesong nå</div>
              <div className="kpi-value">{t.aktivSesong}</div>
              <div className="kpi-sub">aktiv · pågående</div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="section section-divider">
        <Reveal>
          <p style={{ fontSize: 18, lineHeight: 1.7, maxWidth: 720, color: "var(--muted-fg)" }}>
            Srixon Tour ble startet i 2018 som Norges nasjonale juniorturnering. 4 klasser (J15, J19, G15, G19) spilles på 11 turneringer per sesong, fordelt på 7 klubber i Øst- og Vest-Norge. Touren regnes som det viktigste utviklingstrinnet før amatør-WAGR-runden, og dominerende spillere har historisk gått videre til college.
          </p>
        </Reveal>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div className="section-head">
            <div>
              <Eyebrow>Sesong</Eyebrow>
              <h2>Velg <em className="italic-accent">sesong</em>.</h2>
            </div>
          </div>
          <div className="chips">
            {t.sesonger.map(s => (
              <button key={s} className={`chip ${s === sesong ? "active" : ""}`} onClick={() => setSesong(s)}>{s}</button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={60}>
          <table className="dtable" style={{ marginTop: 32 }}>
            <thead>
              <tr><th>Dato</th><th>Turnering</th><th>Klubb</th><th className="num">Deltakere</th><th>Vinner</th><th className="num">Score</th></tr>
            </thead>
            <tbody>
              {t.sesongTurneringer.map((r, i) => (
                <tr key={i}>
                  <td className="mono">{r.dato}</td>
                  <td>{r.navn} {r.major && <span style={{ color: "var(--primary)", marginLeft: 4 }}>★</span>}</td>
                  <td>{r.klubb}</td>
                  <td className="num">{r.deltakere}</td>
                  <td><a href="#">{r.vinner}</a></td>
                  <td className="num" style={{ color: "var(--primary)" }}>{r.score}</td>
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
              <Eyebrow>All-time</Eyebrow>
              <h2>Dominerende spillere <em className="italic-accent">noensinne</em>.</h2>
            </div>
          </div>
        </Reveal>
        <table className="dtable">
          <thead>
            <tr><th>#</th><th>Spiller</th><th>Karriere</th><th className="num">Turneringer</th><th className="num">Seire</th><th className="num">Snitt</th></tr>
          </thead>
          <tbody>
            {t.alltime.map(p => (
              <tr key={p.rank}>
                <td className="mono">{p.rank}</td>
                <td><a href="#"><strong>{p.navn}</strong></a></td>
                <td className="mono muted-foreground">{p.karriere}</td>
                <td className="num">{p.turneringer}</td>
                <td className="num" style={{ color: "var(--primary)" }}>{p.seire}</td>
                <td className="num">{p.snitt.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div className="section-head">
            <div>
              <Eyebrow>Klubber</Eyebrow>
              <h2>Hvem <em className="italic-accent">arrangerer</em>?</h2>
            </div>
          </div>
        </Reveal>
        <div className="stack-md">
          {t.klubber.map((k, i) => {
            const maxN = Math.max(...t.klubber.map(c => c.n));
            return (
              <Reveal key={i} delay={i * 40}>
                <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 60px", gap: 16, alignItems: "center" }}>
                  <span style={{ fontWeight: 500 }}>{k.klubb}</span>
                  <div style={{ height: 24, background: "var(--secondary)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${(k.n / maxN) * 100}%`, height: "100%", background: "var(--primary)", transition: "width .6s ease" }}/>
                  </div>
                  <span className="mono" style={{ textAlign: "right", fontWeight: 500 }}>{k.n}</span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <MersalgBand/>
    </div>
  );
}

// ───── 24 Sesong / Årsoversikt ─────
function Sesong() {
  return (
    <div>
      <section className="hero" style={{ paddingBottom: 32 }}>
        <Reveal>
          <Eyebrow>Den norske golf-sesongen</Eyebrow>
        </Reveal>
        <Reveal delay={60}>
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 240, fontStyle: "italic", color: "var(--primary)", fontWeight: 600, lineHeight: 0.85, fontVariantNumeric: "tabular-nums" }}>2026</div>
            <div className="mini-mono" style={{ marginTop: 16, color: "var(--muted-fg)" }}>SESONGEN SÅ LANGT · OPPDATERT 25. MAI</div>
          </div>
        </Reveal>
      </section>

      <Reveal>
        <div className="kpi-strip cols-4" style={{ borderRadius: 0 }}>
          <div className="kpi">
            <div className="kpi-eyebrow">Turneringer</div>
            <div className="kpi-value"><CountUp value={187}/></div>
            <div className="kpi-sub">arrangert</div>
          </div>
          <div className="kpi">
            <div className="kpi-eyebrow">Norske i aksjon</div>
            <div className="kpi-value mono" style={{ fontSize: 36 }}>1 287</div>
          </div>
          <div className="kpi">
            <div className="kpi-eyebrow">Pro-debuter</div>
            <div className="kpi-value"><CountUp value={2}/></div>
            <div className="kpi-sub">nye proffer</div>
          </div>
          <div className="kpi">
            <div className="kpi-eyebrow">Beste runde</div>
            <div className="kpi-value" style={{ color: "var(--primary)" }}>62</div>
            <div className="kpi-sub">Anders H. · Bærum GK</div>
          </div>
        </div>
      </Reveal>

      <section className="section section-divider">
        <Reveal>
          <div className="section-head">
            <div>
              <Eyebrow>Tidslinje</Eyebrow>
              <h2>Norske <em className="italic-accent">milepæler</em> i 2026.</h2>
            </div>
          </div>
        </Reveal>
        <div className="stack-md" style={{ position: "relative", paddingLeft: 28 }}>
          <div style={{ position: "absolute", left: 8, top: 16, bottom: 16, width: 2, background: "var(--border)" }}/>
          {[
            { dato: "14. apr", t: "Viggo Halvorsen T-5 i Masters",       sub: "Beste norske resultat i en major siden 2017." },
            { dato: "3. mai",  t: "Anders Halvorsen vinner Srixon Tour 5", sub: "Tre slag foran andreplassen. −9 over 3 runder." },
            { dato: "22. mai", t: "Maria Olsen → Stanford-commit",        sub: "Tredje norske jente til D1 på 5 år." },
            { dato: "28. mai", t: "63 av Marius Larsen",                  sub: "Sesongens beste 18-hull. Klubbmesterskap Bærum." },
          ].map((e, i) => (
            <Reveal key={i} delay={i * 80}>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: -28, top: 4, width: 18, height: 18, borderRadius: "50%", background: "var(--accent)", border: "2px solid var(--primary)" }}/>
                <div className="mini-mono">{e.dato.toUpperCase()}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, marginTop: 6 }}>{e.t}</div>
                <p style={{ fontSize: 14, color: "var(--muted-fg)", marginTop: 6, lineHeight: 1.5 }}>{e.sub}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div className="section-head">
            <div>
              <Eyebrow>Rekorder</Eyebrow>
              <h2>Sesongens <em className="italic-accent">tre topper</em>.</h2>
            </div>
          </div>
        </Reveal>
        <div className="grid-3">
          {[
            { lbl: "LAVESTE RUNDE",    val: "62",      hvem: "Anders Halvorsen",  ctx: "Bærum GK · 4. mai" },
            { lbl: "FLESTE SEIRE",     val: "3",       hvem: "Anders Halvorsen",  ctx: "Srixon Tour 1, 3, 5" },
            { lbl: "YNGSTE VINNER",    val: "16 år",   hvem: "Marius Larsen",     ctx: "Srixon 4 · 17. mai" },
          ].map((r, i) => (
            <Reveal key={i} delay={i * 80}>
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 28 }}>
                <div className="mini-mono">{r.lbl}</div>
                <div className="editorial-num" style={{ fontSize: 72, marginTop: 12 }}>{r.val}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, marginTop: 12 }}>{r.hvem}</div>
                <div className="muted-foreground" style={{ fontSize: 12, marginTop: 4 }}>{r.ctx}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <MersalgBand/>
    </div>
  );
}

// ───── 25 Regions ─────
function Regions() {
  const D = window.AKG_DATA;
  const [active, setActive] = useState("ost");
  const region = D.regioner.find(r => r.slug === active);

  return (
    <div>
      <section className="hero compact">
        <Reveal>
          <Eyebrow>AK Golf Stats · Regioner</Eyebrow>
          <h1>Norsk golf, <em className="italic-accent">region for region</em>.</h1>
          <p className="hero-sub" style={{ maxWidth: 580 }}>
            Velg en region for å utforske klubber, spillere og turneringer.
          </p>
        </Reveal>
      </section>

      <section className="section section-divider">
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 64, alignItems: "center" }}>
          <Reveal>
            <NorwayMap activeRegion={active} onSelect={setActive} regions={D.regioner}/>
          </Reveal>
          <Reveal delay={100}>
            <div>
              <div className="mini-mono">VALGT</div>
              <h2 style={{ fontSize: 56, marginTop: 12 }}>{region.navn}</h2>
              <div className="kpi-strip cols-4" style={{ marginTop: 32, border: "1px solid var(--border)", borderRadius: "var(--r-md)" }}>
                <div className="kpi"><div className="kpi-eyebrow">Klubber</div><div className="kpi-value">{region.klubber}</div></div>
                <div className="kpi"><div className="kpi-eyebrow">Spillere</div><div className="kpi-value">{region.spillere}</div></div>
                <div className="kpi"><div className="kpi-eyebrow">Pro</div><div className="kpi-value">{region.pro}</div></div>
                <div className="kpi"><div className="kpi-eyebrow">College</div><div className="kpi-value">{region.college}</div></div>
              </div>
              <div style={{ marginTop: 32 }}>
                <Btn variant="primary" icon="ArrowRight">Utforsk {region.navn}</Btn>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div className="section-head">
            <div>
              <Eyebrow>Alle regioner</Eyebrow>
              <h2>Hvem dominerer <em className="italic-accent">hvor</em>?</h2>
            </div>
          </div>
        </Reveal>
        <div className="grid-4" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
          {D.regioner.map((r, i) => (
            <Reveal key={r.slug} delay={i * 50}>
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 24, cursor: "pointer" }} onClick={() => setActive(r.slug)}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: r.color, marginBottom: 16 }}/>
                <h3 style={{ fontSize: 22, fontWeight: 600 }}>{r.navn.split("-")[0]}</h3>
                <div className="mini-mono" style={{ marginTop: 12 }}>{r.klubber} KLUBBER</div>
                <div className="mono" style={{ fontSize: 22, marginTop: 4, fontWeight: 500 }}>{r.spillere}</div>
                <div className="muted-foreground" style={{ fontSize: 12 }}>spillere</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section section-divider">
        <div className="pull-quote">
          Mest pro-spillere kommer fra <em className="italic-accent">Øst</em> (8 av 12). Vest har flest spillere per klubb (17). Sør har høyest snitt-prestasjon på Srixon Tour.
          <div className="pull-quote-credit">Fakta · oppdatert mai 2026</div>
        </div>
      </section>

      <MersalgBand/>
    </div>
  );
}

// ───── 26 Verktøy (hub + score-til-HCP) ─────
function Verktoy() {
  const [activeTool, setActiveTool] = useState("hub");

  const tools = [
    { id: "score-til-hcp",   navn: "Score til HCP",      desc: "Hvilken HCP har du basert på snittscoren din?",                            icon: "Gauge" },
    { id: "tour-ekvivalent", navn: "Tour-ekvivalent",    desc: "Hva tilsvarer scoren din på en PGA Tour-bane?",                            icon: "Target" },
    { id: "whs",             navn: "WHS-kalkulator",     desc: "Full WHS handicap fra dine 8 beste runder av siste 20.",                  icon: "LineChart" },
    { id: "sg",              navn: "SG-estimator",       desc: "Estimert SG-fordeling fra snittscoren — Broadie-tabell.",                  icon: "Sparkles" },
    { id: "avstand",         navn: "Avstand",            desc: "Yards ↔ meter, kontekstualisert for ditt nivå.",                          icon: "Crosshair" },
  ];

  if (activeTool === "score-til-hcp") return <ScoreTilHcp onBack={() => setActiveTool("hub")}/>;

  return (
    <div>
      <section className="hero compact">
        <Reveal>
          <Eyebrow>AK Golf Stats · Verktøy</Eyebrow>
          <h1>Beregn det du <em className="italic-accent">lurer på</em>.</h1>
          <p className="hero-sub" style={{ maxWidth: 580 }}>
            Score-til-HCP, Tour-ekvivalent, WHS, SG-estimator. Alt gratis, alt nøyaktig.
          </p>
        </Reveal>

        <Reveal delay={80}>
          <div style={{ maxWidth: 520, marginTop: 32 }}>
            <SearchBox value="" onChange={() => {}} placeholder="Søk etter verktøy…"/>
          </div>
        </Reveal>
      </section>

      <section className="section section-divider">
        <div className="grid-3">
          {tools.map((t, i) => (
            <Reveal key={t.id} delay={i * 60}>
              <div className="norske-card" style={{ minHeight: 200 }} onClick={() => setActiveTool(t.id)}>
                <div className="bento-icon" style={{ marginBottom: 0 }}><Icon name={t.icon} size={22}/></div>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22 }}>{t.navn}</div>
                  <p style={{ fontSize: 14, color: "var(--muted-fg)", marginTop: 8, lineHeight: 1.5 }}>{t.desc}</p>
                </div>
                <div className="mini-mono" style={{ marginTop: "auto", color: "var(--primary)" }}>PRØV →</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <MersalgBand/>
    </div>
  );
}

function ScoreTilHcp({ onBack }) {
  const [snitt, setSnitt] = useState(78);
  const [antall, setAntall] = useState(20);
  const [calc, setCalc] = useState(false);

  const hcp = ((snitt - 70) * 1.0).toFixed(1);
  const tourEq = (snitt + 4.4).toFixed(1);

  return (
    <div>
      <section className="hero compact">
        <Reveal>
          <a href="#" className="breadcrumb" onClick={(e) => { e.preventDefault(); onBack(); }}>← Verktøy</a>
          <div style={{ marginTop: 24 }}>
            <Eyebrow>Verktøy · Score til HCP</Eyebrow>
          </div>
          <h1>Hvilken <em className="italic-accent">HCP</em> har du?</h1>
          <p className="hero-sub">Skriv inn snittscoren din, så estimerer vi HCP basert på Broadie-data.</p>
        </Reveal>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div style={{ maxWidth: 640, margin: "0 auto", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-xl)", padding: 48, textAlign: "center" }}>
            <div className="mini-mono">DIN SNITTSCORE (BRUTTO)</div>
            <div className="editorial-num" style={{ fontSize: 120, marginTop: 12 }}>{snitt}</div>
            <div style={{ maxWidth: 400, margin: "32px auto 0" }}>
              <RangeSlider value={snitt} min={60} max={140} step={0.5} onChange={setSnitt}/>
            </div>
            <div style={{ borderTop: "1px solid var(--border)", margin: "32px 0", paddingTop: 24, display: "flex", gap: 24, justifyContent: "center" }}>
              <div>
                <div className="mini-mono">ANTALL RUNDER</div>
                <input type="number" value={antall} onChange={(e) => setAntall(Number(e.target.value))}
                  style={{ fontFamily: "var(--font-mono)", fontSize: 24, width: 80, marginTop: 8, padding: "4px 8px", border: "1px solid var(--border)", borderRadius: 6, textAlign: "center", background: "var(--bg)" }}/>
              </div>
            </div>
            <Btn variant="primary" icon="ArrowRight" size="lg" onClick={() => setCalc(true)}>Beregn HCP</Btn>
          </div>
        </Reveal>
      </section>

      {calc && (
        <section className="section section-divider">
          <Reveal>
            <div style={{ background: "var(--primary)", color: "var(--bg)", borderRadius: "var(--r-xl)", padding: 48, maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
              <Eyebrow tone="lime">Din estimerte HCP</Eyebrow>
              <div className="editorial-num" style={{ fontSize: 160, marginTop: 16, color: "var(--accent)" }}>
                <CountUp value={Number(hcp)} decimals={1}/>
              </div>
              <div style={{ fontSize: 18, marginTop: 16, color: "rgba(250,250,247,0.8)" }}>HCP-nivå: <strong className="mono" style={{ color: "var(--accent)" }}>Single-figure</strong></div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", margin: "32px 0", paddingTop: 24, fontSize: 14, lineHeight: 1.7, color: "rgba(250,250,247,0.85)" }}>
                Dette tilsvarer:
                <ul style={{ listStyle: "none", padding: 0, marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  <li>• Bedre enn 87 % av norske amatører</li>
                  <li>• Ca. samme nivå som AK Golf Academy juniorgruppen</li>
                  <li>• Tour-ekvivalent: <strong style={{ color: "var(--accent)" }}>{tourEq}</strong> på en PGA-bane</li>
                </ul>
              </div>

              <Btn variant="outline" icon="ArrowRight">Se Tour-ekvivalent</Btn>
            </div>
          </Reveal>
        </section>
      )}
    </div>
  );
}

// ───── 27 Global søk ─────
function GlobalSok() {
  const D = window.AKG_DATA;
  const [q, setQ] = useState("hovland");
  const matchesSpillere = D.norskeSpillere.filter(s => s.name.toLowerCase().includes(q.toLowerCase()));
  const matchesPGA      = D.pgaSpillere.filter(s => s.navn.toLowerCase().includes(q.toLowerCase()));
  const matchesKlubber  = D.klubber.filter(k => k.navn.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <section className="hero compact">
        <Reveal>
          <Eyebrow>AK Golf Stats · Søk</Eyebrow>
          <h1>Søk <em className="italic-accent">alt</em>.</h1>
          <p className="hero-sub">Spillere, turneringer, klubber, artikler — alt i én søkeboks.</p>
        </Reveal>

        <Reveal delay={80}>
          <div style={{ marginTop: 40, maxWidth: 720 }}>
            <SearchBox value={q} onChange={setQ} placeholder="Søk navn, klubb, turnering…" size="lg" autoFocus/>
          </div>
        </Reveal>
      </section>

      <section className="section section-divider">
        <div className="mini-mono" style={{ marginBottom: 32 }}>
          SØKERESULTATER FOR «{q.toUpperCase()}»
        </div>

        <div className="stack-lg">
          <Reveal>
            <div>
              <div className="row-between" style={{ marginBottom: 16 }}>
                <Eyebrow>Norske spillere ({matchesSpillere.length})</Eyebrow>
                {matchesSpillere.length > 5 && <a href="#" className="section-head-link">Se alle →</a>}
              </div>
              <div className="grid-3">
                {matchesSpillere.slice(0, 6).map(s => (
                  <a key={s.slug} href="#" style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", textDecoration: "none", color: "inherit" }}>
                    <div className="qpick-avatar">{s.name.split(" ").map(n => n[0]).join("")}</div>
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>{s.name}</div>
                      <div className="mini-mono">{s.ar} år · {s.klubb}</div>
                    </div>
                  </a>
                ))}
              </div>
              {matchesSpillere.length === 0 && <div className="muted-foreground" style={{ fontSize: 14, padding: 16 }}>Ingen treff</div>}
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div>
              <div className="row-between" style={{ marginBottom: 16 }}>
                <Eyebrow>PGA Tour-spillere ({matchesPGA.length})</Eyebrow>
              </div>
              <div className="grid-3">
                {matchesPGA.slice(0, 3).map(s => (
                  <a key={s.dgId} href="#" style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", textDecoration: "none", color: "inherit" }}>
                    <FlagGlyph code={s.land} size={18}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>{s.navn}</div>
                      <div className="mini-mono">#{D.pgaSpillere.indexOf(s) + 1} I SG TOTAL</div>
                    </div>
                    <span className="mono" style={{ color: "var(--primary)", fontWeight: 600 }}>+{s.sgTotal.toFixed(2)}</span>
                  </a>
                ))}
              </div>
              {matchesPGA.length === 0 && <div className="muted-foreground" style={{ fontSize: 14, padding: 16 }}>Ingen treff</div>}
            </div>
          </Reveal>

          <Reveal delay={160}>
            <div>
              <Eyebrow>Klubber ({matchesKlubber.length})</Eyebrow>
              {matchesKlubber.length > 0 ? (
                <div className="grid-3" style={{ marginTop: 16 }}>
                  {matchesKlubber.slice(0, 3).map(k => (
                    <a key={k.slug} href="#" style={{ padding: 16, background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", textDecoration: "none", color: "inherit", display: "block" }}>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>{k.navn}</div>
                      <div className="mini-mono" style={{ marginTop: 4 }}>{k.kommune.toUpperCase()} · {k.spillere} SPILLERE</div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="muted-foreground" style={{ fontSize: 14, padding: 16 }}>Ingen treff</div>
              )}
            </div>
          </Reveal>
        </div>

        <div style={{ marginTop: 64, padding: 24, background: "var(--secondary)", borderRadius: "var(--r-md)" }}>
          <div className="mini-mono">POPULÆRE SØK</div>
          <div className="chips" style={{ marginTop: 12 }}>
            {["Hovland", "Bærum GK", "Srixon Tour", "PGA Tour 2026", "Norske college"].map(t => (
              <button key={t} className="chip" onClick={() => setQ(t)}>{t}</button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ───── 28 Turneringsdetalj ─────
function Turneringsdetalj() {
  const D = window.AKG_DATA;
  const t = D.turnering;

  return (
    <div>
      <section className="hero compact">
        <Reveal>
          <a href="#" className="breadcrumb">← Turneringer</a>
          <div style={{ marginTop: 20 }}>
            <Eyebrow>{t.tour.toUpperCase()} · {t.datoer.toUpperCase()}</Eyebrow>
          </div>
          <div className="row-between" style={{ alignItems: "flex-start", marginTop: 16 }}>
            <h1>{t.navn}</h1>
            <div style={{ textAlign: "right" }}>
              <div className="muted-foreground">{t.bane}</div>
              <div className="muted-foreground" style={{ fontSize: 13 }}>{t.sted}</div>
              <div className="mono" style={{ marginTop: 4, fontSize: 13 }}>{t.purse} purse</div>
            </div>
          </div>
          <div style={{ marginTop: 24, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ background: "var(--accent)", color: "var(--accent-fg)", fontFamily: "var(--font-mono)", fontSize: 11, padding: "4px 10px", borderRadius: 4, letterSpacing: "0.12em", fontWeight: 600 }}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", marginRight: 6, animation: "pulse 2s infinite" }}/>
              IN PROGRESS · R4
            </span>
            <Btn variant="secondary" icon="ExternalLink">Live leaderboard på DataGolf</Btn>
          </div>
        </Reveal>
      </section>

      <Reveal>
        <div className="kpi-strip cols-4" style={{ borderRadius: 0 }}>
          <div className="kpi">
            <div className="kpi-eyebrow">Deltakere</div>
            <div className="kpi-value"><CountUp value={t.deltakere}/></div>
          </div>
          <div className="kpi">
            <div className="kpi-eyebrow">Norske</div>
            <div className="kpi-value" style={{ color: "var(--primary)" }}><CountUp value={t.norskeAntall}/></div>
          </div>
          <div className="kpi">
            <div className="kpi-eyebrow">Korteste runde</div>
            <div className="kpi-value mono" style={{ fontSize: 32, marginTop: 8 }}>−7</div>
            <div className="kpi-sub">R2 · S. Devlin</div>
          </div>
          <div className="kpi">
            <div className="kpi-eyebrow">Cut-linje</div>
            <div className="kpi-value mono" style={{ fontSize: 32, marginTop: 8 }}>+3</div>
            <div className="kpi-sub">76 spillere gjorde cut</div>
          </div>
        </div>
      </Reveal>

      <section className="section section-divider">
        <Reveal>
          <div className="section-head">
            <div>
              <Eyebrow>Norske i aksjon</Eyebrow>
              <h2>Hvem <em className="italic-accent">spiller</em> for Norge?</h2>
            </div>
          </div>
        </Reveal>
        <div className="grid-2">
          {t.norske.map((n, i) => (
            <Reveal key={i} delay={i * 80}>
              <div style={{ background: "rgba(209,248,67,0.10)", border: "1px solid var(--accent)", borderRadius: "var(--r-lg)", padding: 28 }}>
                <div className="row" style={{ gap: 14 }}>
                  <FlagGlyph code="no" size={20}/>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600 }}>{n.navn}</div>
                </div>
                <div className="row" style={{ marginTop: 20, gap: 32 }}>
                  <div>
                    <div className="mini-mono">RUNDE 1</div>
                    <div className="mono" style={{ fontSize: 28, fontWeight: 500 }}>{n.r1}</div>
                    <div className="mono" style={{ color: n.til_par < 0 ? "var(--primary)" : "var(--muted-fg)", fontSize: 12 }}>{n.til_par > 0 ? "+" : ""}{n.til_par} to par</div>
                  </div>
                  <div>
                    <div className="mini-mono">POSISJON</div>
                    <div className="mono" style={{ fontSize: 28, fontWeight: 500, color: "var(--primary)" }}>{n.pos}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div className="section-head">
            <div>
              <Eyebrow>Leaderboard</Eyebrow>
              <h2>Topp 10 <em className="italic-accent">finalrunde</em>.</h2>
            </div>
          </div>
        </Reveal>
        <table className="dtable">
          <thead>
            <tr><th>Pos</th><th>Spiller</th><th>Land</th><th>R1</th><th>R2</th><th>R3</th><th>R4</th><th className="num">Totalt</th><th className="num">To par</th></tr>
          </thead>
          <tbody>
            {t.leaderboard.map((r, i) => (
              <tr key={i} className={r.norsk ? "norsk-row" : ""}>
                <td className="mono">{r.pos}</td>
                <td><a href="#"><strong>{r.navn}</strong></a> {r.norsk && <span style={{ color: "var(--primary)" }}>★</span>}</td>
                <td><FlagGlyph code={r.land}/></td>
                {r.r.map((rn, ix) => <td key={ix} className="num mono">{rn}</td>)}
                <td className="num mono" style={{ fontWeight: 500 }}>{r.total}</td>
                <td className="num mono" style={{ color: "var(--primary)", fontWeight: 600 }}>{r.parTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div className="section-head">
            <div>
              <Eyebrow>Historikk</Eyebrow>
              <h2>Tidligere <em className="italic-accent">vinnere</em>.</h2>
            </div>
          </div>
        </Reveal>
        <div className="stack-md">
          {t.tidligereVinnere.map(v => (
            <div key={v.aar} style={{ display: "grid", gridTemplateColumns: "100px 1fr auto", gap: 24, padding: "16px 0", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
              <span className="mono" style={{ fontSize: 18, fontWeight: 500 }}>{v.aar}</span>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18 }}>{v.navn}</span>
              <span className="mono" style={{ color: "var(--primary)", fontSize: 16 }}>{v.score}</span>
            </div>
          ))}
        </div>
      </section>

      <MersalgBand/>
    </div>
  );
}

// ───── 29 Admin Stats Overview ─────
function AdminOverview() {
  const D = window.AKG_DATA;
  const a = D.admin;

  return (
    <div>
      <section style={{ padding: "32px 64px 24px", background: "var(--secondary)", borderBottom: "1px solid var(--border)" }}>
        <div className="row-between">
          <div>
            <div className="mini-mono">ADMIN · STATS</div>
            <h1 style={{ fontSize: 36, marginTop: 8 }}>Overview</h1>
          </div>
          <div className="mini-mono">SIST OPPDATERT 13:42</div>
        </div>
      </section>

      <Reveal>
        <div className="kpi-strip cols-4" style={{ borderRadius: 0, background: "var(--bg)" }}>
          <div className="kpi">
            <div className="kpi-eyebrow">Besøk 30d</div>
            <div className="kpi-value mono" style={{ fontSize: 36 }}>4 287</div>
            <div className="kpi-sub"><TrendChip value={a.besokEndring}/> mot forrige</div>
          </div>
          <div className="kpi">
            <div className="kpi-eyebrow">Signups</div>
            <div className="kpi-value"><CountUp value={a.signups}/></div>
            <div className="kpi-sub"><TrendChip value={a.signupsEndring}/> mot forrige</div>
          </div>
          <div className="kpi">
            <div className="kpi-eyebrow">PlayerHQ-conv</div>
            <div className="kpi-value">{a.playerHQConv} <span className="unit">({a.playerHQConvPct}%)</span></div>
            <div className="kpi-sub"><TrendChip value={a.playerHQConvEndring}/> mot forrige</div>
          </div>
          <div className="kpi">
            <div className="kpi-eyebrow">Revenue</div>
            <div className="kpi-value mono" style={{ fontSize: 32 }}>{a.revenue} kr</div>
            <div className="kpi-sub"><TrendChip value={a.revenueEndring}/> mot forrige</div>
          </div>
        </div>
      </Reveal>

      <section className="section-tight section-divider">
        <div className="grid-2">
          <Reveal>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 28 }}>
              <div className="row-between" style={{ marginBottom: 16 }}>
                <Eyebrow>Top 5 sider</Eyebrow>
                <a className="section-head-link" href="#">Full liste →</a>
              </div>
              <table className="dtable">
                <thead>
                  <tr><th>Side</th><th className="num">Besøk</th><th className="num">Snittid</th><th className="num">Konv.</th></tr>
                </thead>
                <tbody>
                  {a.topSider.map((s, i) => (
                    <tr key={i}>
                      <td><a href="#" className="mono" style={{ fontSize: 12 }}>{s.url}</a></td>
                      <td className="num">{s.besok}</td>
                      <td className="num mono">{s.snittTid}</td>
                      <td className="num" style={{ color: s.konv >= 20 ? "var(--primary)" : "inherit", fontWeight: s.konv >= 20 ? 600 : 500 }}>{s.konv}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 28 }}>
              <Eyebrow>Trafikkilder</Eyebrow>
              <div style={{ display: "flex", gap: 32, alignItems: "center", marginTop: 24 }}>
                <Donut data={[
                  { n: a.trafikk.google, label: "Google" },
                  { n: a.trafikk.direkte, label: "Direkte" },
                  { n: a.trafikk.sosial, label: "Sosial" },
                  { n: a.trafikk.referer, label: "Referer" },
                ]} size={180}/>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { n: a.trafikk.google,  lbl: "Google search", c: "#005840" },
                    { n: a.trafikk.direkte, lbl: "Direkte",       c: "#D1F843" },
                    { n: a.trafikk.sosial,  lbl: "Sosial",        c: "#F1EEE5" },
                    { n: a.trafikk.referer, lbl: "Referer",       c: "#5E5C57" },
                  ].map((r, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed var(--border)", fontSize: 13 }}>
                      <span><span style={{ display: "inline-block", width: 10, height: 10, background: r.c, borderRadius: 2, marginRight: 8 }}/>{r.lbl}</span>
                      <span className="mono" style={{ fontWeight: 500 }}>{r.n}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-tight section-divider">
        <Reveal>
          <Eyebrow>Sync-status</Eyebrow>
          <h2 style={{ marginTop: 12, marginBottom: 24 }}>Pipelinen — siste kjøring.</h2>
        </Reveal>
        <div className="stack-md">
          {a.sync.map((s, i) => {
            const cfg = {
              ok:      { c: "#2EA66B", icon: "✓", lbl: "OK" },
              warning: { c: "#B57317", icon: "⚠", lbl: "Manuell" },
              error:   { c: "#BE3D3D", icon: "✗", lbl: "FEIL" },
            }[s.status];
            return (
              <Reveal key={i} delay={i * 40}>
                <div style={{ display: "grid", gridTemplateColumns: "32px 1fr auto auto", gap: 16, alignItems: "center", padding: 14, background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-md)" }}>
                  <span style={{ width: 28, height: 28, borderRadius: "50%", background: `${cfg.c}15`, color: cfg.c, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 14 }}>{cfg.icon}</span>
                  <span style={{ fontWeight: 500 }}>{s.navn}</span>
                  <span className="mono muted-foreground" style={{ fontSize: 12 }}>{s.tid}</span>
                  <span className="mono" style={{ fontSize: 12, color: cfg.c, fontWeight: 500 }}>{s.detalj}</span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="section-tight section-divider">
        <Reveal>
          <Eyebrow>Modereringskø</Eyebrow>
          <div className="row-between" style={{ marginTop: 12 }}>
            <h2>12 ventende handlinger.</h2>
            <Btn variant="primary" icon="ArrowRight">Til moderering</Btn>
          </div>
        </Reveal>
        <div className="grid-4" style={{ marginTop: 24 }}>
          {[
            { lbl: "Turneringer", n: 4 },
            { lbl: "Resultater",  n: 5 },
            { lbl: "Profiler",    n: 2 },
            { lbl: "Slett (haster)", n: 1 },
          ].map((m, i) => (
            <div key={i} style={{ background: i === 3 ? "rgba(190,61,61,0.06)" : "var(--secondary)", border: i === 3 ? "1px solid #BE3D3D" : "1px solid var(--border)", borderRadius: "var(--r-md)", padding: 20 }}>
              <div className="mini-mono">{m.lbl.toUpperCase()}</div>
              <div className="editorial-num" style={{ fontSize: 48, marginTop: 8, color: i === 3 ? "#BE3D3D" : "var(--fg)" }}>{m.n}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-tight section-divider">
        <Reveal>
          <Eyebrow>Raske handlinger</Eyebrow>
          <h2 style={{ marginTop: 12, marginBottom: 24 }}>Cron + admin-snarveier.</h2>
        </Reveal>
        <div className="grid-4">
          {["Kjør manuell sync av PGA-data", "Send ukentlig roundup nå", "Sjekk DB-helse", "Roter CRON_SECRET"].map((t, i) => (
            <Reveal key={i} delay={i * 40}>
              <button style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: 20, textAlign: "left", cursor: "pointer", fontFamily: "inherit", fontSize: 13, lineHeight: 1.4 }}>
                <Icon name="Play" size={16} style={{ color: "var(--primary)" }}/>
                <div style={{ marginTop: 10, fontWeight: 500 }}>{t}</div>
              </button>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}

Object.assign(window, { Klubbdatabase, TourDeepDive, Sesong, Regions, Verktoy, GlobalSok, Turneringsdetalj, AdminOverview });
