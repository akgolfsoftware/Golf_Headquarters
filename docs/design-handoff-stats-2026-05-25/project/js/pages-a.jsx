// Pages 03-06: PGA kategori-detalj, Putt Explorer, Spillerbase søk, Spillerprofil

// ───── 03 PGA kategori-detalj ─────
function PGAKategoriDetalj() {
  const D = window.AKG_DATA;
  const [katId, setKat] = useState("drive");
  const kat = D.pgaKategorier.find(k => k.id === katId);

  // Drive distance config (only fully wired for drive — others show same UI)
  const config = {
    drive:   { min: 220, max: 340, default: 268, unit: "yds", verb: "langt slår", noun: "Drive distance" },
    fairway: { min: 30,  max: 85,  default: 55,  unit: "%",   verb: "presist treffer", noun: "Fairway-treff" },
    gir:     { min: 20,  max: 80,  default: 50,  unit: "%",   verb: "godt rammer", noun: "Greens in Regulation" },
    putter:  { min: 24,  max: 36,  default: 30,  unit: "",    verb: "effektivt putter", noun: "Putter per runde" },
    scoring: { min: 65,  max: 85,  default: 76,  unit: "",    verb: "lavt scorer", noun: "Scoring average" },
  }[katId] || { min: 220, max: 340, default: 268, unit: "", verb: "presterer", noun: kat.navn };

  const [value, setValue] = useState(config.default);

  // Compute percentile from histogram for drive (illustrative)
  const total = D.driveHistogram.reduce((s, b) => s + b.count, 0);
  const percentile = useMemo(() => {
    if (katId !== "drive") return 50; // illustrative for other cats
    let below = 0;
    for (const b of D.driveHistogram) {
      const [lo] = b.range.split("-").map(Number);
      const hi = lo + 10;
      if (value >= hi) below += b.count;
      else if (value > lo) below += b.count * ((value - lo) / 10);
    }
    return Math.round((below / total) * 100);
  }, [value, katId]);

  const narrative =
    percentile < 25  ? { h: "Her er det mest å hente", t: "Du er i nederste kvartil på Tour. Drive distance er en av de mest trenbare statistikkene — speed-trening kan gi 15–20 yds på 12 uker." } :
    percentile < 50  ? { h: "Du er under snittet",      t: "Tour-spillere på ditt nivå har 60 % færre 3-putter enn deg fordi de er nærmere etter drive. Speed + presisjon må jobbes parallelt." } :
    percentile < 75  ? { h: "Du kvalifiserer for konferansen", t: "Du slår langt nok til å spille D1 college-golf i USA. Neste nivå er konsekvent over 290 yds." } :
    percentile < 95  ? { h: "Du er i toppsjiktet",      t: "Få amatører slår så langt. Spørsmålet er om du klarer å holde fairway under turneringspress." } :
                       { h: "Tour-nivå bekreftet",      t: "Distansen din er på Tour-spillernes nivå. Spør coachen din om SG-data — det er der gapet sannsynligvis ligger." };

  const highlightBucket = useMemo(() => {
    if (katId !== "drive") return -1;
    const idx = D.driveHistogram.findIndex(b => {
      const [lo] = b.range.split("-").map(Number);
      return value >= lo && value < lo + 10;
    });
    return idx;
  }, [value, katId]);

  const nearest = useMemo(() => {
    if (katId !== "drive") return kat.topp3[0];
    // pick from topp3
    return kat.topp3.reduce((best, p) =>
      Math.abs(p.value - value) < Math.abs(best.value - value) ? p : best, kat.topp3[0]);
  }, [value, kat]);

  return (
    <div>
      <section className="hero compact">
        <Reveal>
          <a href="#" className="breadcrumb">← PGA Tour Stats</a>
          <div style={{ marginTop: 20 }}>
            <Eyebrow><Icon name={kat.icon} size={12}/> PGA TOUR · {config.noun.toUpperCase()}</Eyebrow>
          </div>
          <h1 style={{ maxWidth: 920 }}>
            Hvor <em className="italic-accent">{config.verb.split(" ")[0]}</em> slår de{config.unit ? " egentlig" : ""}?
          </h1>
          <p className="hero-sub">
            PGA Tour-snittet er <strong className="mono">{kat.verdi}{config.unit}</strong>. Lek deg med slideren og se hvor du står — på percentile og mot konkrete spillere.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div style={{ display: "flex", gap: 32, marginTop: 36, flexWrap: "wrap" }}>
            <div>
              <div className="mini-mono">TOUR-SNITT</div>
              <div className="editorial-num" style={{ fontSize: 64, marginTop: 4 }}>
                <CountUp value={kat.verdi} decimals={1}/>
                <span style={{ fontSize: 20, color: "var(--muted-fg)", marginLeft: 6 }}>{config.unit}</span>
              </div>
            </div>
            <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 24 }}>
              <div className="mini-mono">TOPP-1</div>
              <div className="editorial-num" style={{ fontSize: 36, marginTop: 4 }}>{kat.topp3[0].value}<span style={{ fontSize: 14, color: "var(--muted-fg)", marginLeft: 4 }}>{config.unit}</span></div>
              <div style={{ fontSize: 13, color: "var(--muted-fg)", marginTop: 4 }}>{kat.topp3[0].name}</div>
            </div>
            <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 24 }}>
              <div className="mini-mono">SPILLERE MED DATA</div>
              <div className="editorial-num" style={{ fontSize: 36, marginTop: 4 }}>433</div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div className="section-head">
            <div>
              <Eyebrow>Interaktivt</Eyebrow>
              <h2>Hvor <em className="italic-accent">står du</em>?</h2>
            </div>
            <ChipGroup
              options={D.pgaKategorier.map(k => ({ id: k.id, label: k.navn }))}
              value={katId}
              onChange={(v) => { setKat(v); /* reset value */ }}/>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="kategori-interactive">
            <div className="kategori-bignum-q">Dine {config.noun.toLowerCase()}</div>
            <div className="kategori-bignum">
              {config.unit === "%" ? value.toFixed(0) : (config.unit === "yds" ? value.toFixed(0) : value.toFixed(1))}
              <span className="unit">{config.unit}</span>
            </div>

            <div style={{ maxWidth: 720, margin: "32px auto 0" }}>
              <RangeSlider
                value={value} min={config.min} max={config.max}
                step={config.unit === "%" ? 1 : (config.unit === "yds" ? 1 : 0.1)}
                onChange={setValue}
                unit={config.unit}/>
            </div>

            <div className="grid-2" style={{ marginTop: 40 }}>
              <div className="percentile-card">
                <div className="pe-eyebrow">PERCENTILE</div>
                <div className="pe-big">P{percentile}</div>
                <div className="pe-sub">
                  Du slår {percentile >= 50 ? "lenger" : "kortere"} enn {percentile}% av PGA Tour-spillerne.
                </div>
              </div>
              <div className="nearest-card">
                <div className="ne-eyebrow">NÆRMESTE PROFF</div>
                <div className="ne-name">
                  <FlagGlyph code={nearest.country}/> {nearest.name}
                </div>
                <div className="ne-val">{nearest.value}{config.unit}</div>
                <div style={{ fontSize: 12, color: "var(--muted-fg)", marginTop: 6, fontFamily: "var(--font-mono)" }}>
                  {Math.abs(nearest.value - value).toFixed(1)}{config.unit} {nearest.value > value ? "lenger" : "kortere"} enn deg
                </div>
              </div>
            </div>

            {katId === "drive" && (
              <div style={{ marginTop: 40 }}>
                <div className="mini-mono" style={{ marginBottom: 10 }}>FORDELING · 433 SPILLERE</div>
                <Histogram data={D.driveHistogram} highlight={highlightBucket} valueKey="count" labelKey="range" height={160}/>
              </div>
            )}
          </div>
        </Reveal>
      </section>

      <section className="section section-divider">
        <div className="grid-2">
          <Reveal>
            <div>
              <Eyebrow>Din analyse</Eyebrow>
              <h2 style={{ marginTop: 12 }}>
                {narrative.h.split(" ").slice(0, -2).join(" ")}{" "}
                <em className="italic-accent">{narrative.h.split(" ").slice(-2).join(" ")}</em>
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.55, color: "var(--muted-fg)", marginTop: 20 }}>
                {narrative.t}
              </p>
              <div style={{ marginTop: 28 }}>
                <Btn variant="primary" icon="ArrowRight">Få gratis treningsplan i PlayerHQ</Btn>
              </div>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div style={{ background: "var(--secondary)", borderRadius: "var(--r-lg)", padding: 32 }}>
              <div className="mini-mono">SLIK BEREGNES PERCENTILE</div>
              <ul style={{ marginTop: 20, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
                <li style={{ fontSize: 14, lineHeight: 1.5 }}>
                  <strong>P{percentile}</strong> betyr at du slår lenger enn {percentile}% av spillerne i datasettet vårt.
                </li>
                <li style={{ fontSize: 14, lineHeight: 1.5, color: "var(--muted-fg)" }}>
                  Datasett: 433 aktive PGA Tour-spillere, sesong 2026. Vektet snitt over alle målte runder.
                </li>
                <li style={{ fontSize: 14, lineHeight: 1.5, color: "var(--muted-fg)" }}>
                  Krav: minimum 20 målte runder per spiller.
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div className="section-head">
            <div>
              <Eyebrow>Topp 20</Eyebrow>
              <h2>De som <em className="italic-accent">slår lengst</em>.</h2>
            </div>
            <a className="section-head-link" href="#">Se topp 50 →</a>
          </div>
        </Reveal>

        <Reveal delay={60}>
          <table className="dtable">
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Spiller</th>
                <th style={{ width: 80 }}>Land</th>
                <th className="num">Verdi</th>
                <th className="num">Vs snitt</th>
              </tr>
            </thead>
            <tbody>
              {[
                ...kat.topp3,
                { initials: "AS", name: "A. Stenmark",  country: "se", value: 316.4 },
                { initials: "MK", name: "M. Klemmer",   country: "de", value: 314.8 },
                { initials: "LW", name: "L. Whitfield", country: "us", value: 313.5 },
                { initials: "BC", name: "B. Castillo",  country: "ar", value: 312.1 },
                { initials: "JT", name: "J. Tanaka",    country: "jp", value: 310.4 },
                { initials: "CN", name: "C. Nieuwhuys", country: "za", value: 309.8 },
                { initials: "PD", name: "P. Donato",    country: "us", value: 308.2 },
              ].map((p, i) => {
                const diff = p.value - kat.verdi;
                return (
                  <tr key={i}>
                    <td className="mono muted-foreground">{i + 1}</td>
                    <td><a href="#">{p.name}</a></td>
                    <td><FlagGlyph code={p.country}/></td>
                    <td className="num">{p.value.toFixed(1)} <span className="muted-foreground" style={{ fontSize: 11 }}>{config.unit}</span></td>
                    <td className="num" style={{ color: diff > 0 ? "var(--primary)" : "var(--muted-fg)" }}>
                      {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mini-mono" style={{ marginTop: 14 }}>KRAV: MIN 20 RUNDER SPILT</div>
        </Reveal>
      </section>

      <MersalgBand variant="default"/>
    </div>
  );
}

// ───── 04 Putt Explorer ─────
function PuttExplorer() {
  const D = window.AKG_DATA;
  const [distance, setDistance] = useState(3);
  const distances = [1, 2, 3, 4, 5, 6, 8, 10, 15, 20];

  const idx = distances.indexOf(distance);
  const row = D.puttMatrix[idx] || D.puttMatrix[2];

  const narrative =
    distance <= 2 ? "Selv proffer bommer her av og til. Konsentrasjon avgjør." :
    distance === 3 ? "Den klassiske «birdie putt»-avstanden. Forskjellen mellom amatør og proff er størst her." :
    distance <= 5 ? "PGA Tour synker hver tredje. Du? Statistikk fra Broadie sier hver fjerde." :
    distance <= 10 ? "Lag-up-territorium. Proffer prioriterer 3-putt-unngåelse over chans for birdie." :
    "Ren chans. Tour-snittet er rundt 15 %. Bra første putt = god start på neste hull.";

  return (
    <div>
      <section className="hero compact">
        <Reveal>
          <a href="#" className="breadcrumb">← PGA Tour Stats</a>
          <div style={{ marginTop: 20 }}>
            <Eyebrow>PGA Tour · Putt Explorer</Eyebrow>
          </div>
          <h1 style={{ maxWidth: 940 }}>
            Selv proffer <em className="italic-accent">bommer</em> fra 3 meter.
          </h1>
          <p className="hero-sub" style={{ maxWidth: 640 }}>
            PGA Tour synker 82 % fra 3m. Amatører tror tallet er høyere. Lek deg med data og se hvor stor forskjellen egentlig er.
          </p>
        </Reveal>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div className="putt-big-block">
            <div>
              <div className="mini-mono">PGA TOUR SYNKER</div>
              <div className="putt-big-pct">{row.pga}%</div>
            </div>
            <div className="putt-big-x">fra</div>
            <div>
              <div className="mini-mono">AVSTAND</div>
              <div className="putt-big-dist">{row.d}</div>
            </div>
          </div>

          <div style={{ maxWidth: 760, margin: "40px auto 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span className="mini-mono">1m</span>
              <span className="mini-mono">20m</span>
            </div>
            <input type="range" min="0" max={distances.length - 1} step="1"
              value={idx}
              onChange={(e) => setDistance(distances[Number(e.target.value)])}
              style={{
                width: "100%",
                appearance: "none",
                background: "linear-gradient(to right, var(--primary), var(--accent))",
                height: 8, borderRadius: 4, outline: "none",
                accentColor: "var(--primary)",
              }}/>
            <div style={{ marginTop: 24, fontFamily: "var(--font-display)", fontSize: 18, fontStyle: "italic", color: "var(--muted-fg)", maxWidth: 520, margin: "24px auto 0", textAlign: "center" }}>
              {narrative}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div className="section-head">
            <div>
              <Eyebrow>Sammenligning</Eyebrow>
              <h2>{row.d} — synket-prosent <em className="italic-accent">per nivå</em>.</h2>
            </div>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="grid-4">
            {[
              { label: "PGA Tour-snitt",      pct: row.pga,   color: "var(--primary)" },
              { label: "Topp 10 putters",     pct: row.top10, color: "var(--accent)" },
              { label: "Amatør HCP 0",        pct: row.hcp0,  color: "var(--muted-fg)" },
              { label: "Amatør HCP 10",       pct: row.hcp10, color: "var(--border-strong)" },
            ].map(c => (
              <div key={c.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: 24 }}>
                <div className="mini-mono">{c.label}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 48, fontWeight: 500, lineHeight: 1, margin: "12px 0", color: c.color === "var(--accent)" ? "var(--primary)" : c.color }}>
                  {c.pct}%
                </div>
                <div style={{ height: 6, background: "var(--secondary)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${c.pct}%`, height: "100%", background: c.color, transition: "width .4s ease" }}/>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div className="section-head">
            <div>
              <Eyebrow>Innsikt</Eyebrow>
              <h2>Tre avstander der amatører <em className="italic-accent">taper mest</em>.</h2>
            </div>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div className="grid-3">
            {[
              { d: "3m", diff: "−37%-poeng", h: "3-meteren",      t: "Lavhengende frukt. 30 putter à 5 min i uka = +1 birdie per runde." },
              { d: "5m", diff: "−33%-poeng", h: "5-meteren",      t: "Speed-control. Amatører er 2× mer offensive enn de burde." },
              { d: "1m", diff: "−1%-poeng",  h: "Tomp-tomp", t: "Du synker like ofte som proffene. Glem ikke det." },
            ].map((c, i) => (
              <div key={i} className="step-card">
                <div className="mini-mono">{c.d} · DIFF HCP 10 VS TOUR</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 40, color: "var(--primary)", fontWeight: 500, marginTop: 12 }}>
                  {c.diff}
                </div>
                <h3 style={{ marginTop: 16 }}>{c.h}</h3>
                <p>{c.t}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div className="section-head">
            <div>
              <Eyebrow>Heatmap</Eyebrow>
              <h2>Hele fordelingen — <em className="italic-accent">avstand × nivå</em>.</h2>
            </div>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div style={{ "--cols": 10 }}>
            <Heatmap
              rows={["PGA Tour", "Topp 10", "HCP 0", "HCP 10", "HCP 20"]}
              cols={D.puttMatrix.map(r => r.d)}
              data={[
                D.puttMatrix.map(r => r.pga),
                D.puttMatrix.map(r => r.top10),
                D.puttMatrix.map(r => r.hcp0),
                D.puttMatrix.map(r => r.hcp10),
                D.puttMatrix.map(r => r.hcp20),
              ]}
              getValue={(v) => v}/>
          </div>
        </Reveal>

        <div className="pull-quote">
          Amatører undervurderer 5-meteren og overvurderer 10-meteren. Tour-spillerne vet at 5 meter er gjennombrudd-avstanden — den de jobber hardest med.
          <div className="pull-quote-credit">Mark Broadie · «Every Shot Counts»</div>
        </div>
      </section>

      <MersalgBand/>
    </div>
  );
}

// ───── 05 Norsk spillerbase søk ─────
function Spillerbase({ onOpenSpiller }) {
  const D = window.AKG_DATA;
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState("Alle");
  const [arGroup, setArGroup] = useState("Alle");
  const [view, setView] = useState("grid");

  const tiers = ["Alle", "Pro", "College", "Amatør", "Junior"];
  const ars = ["Alle", "2009", "2008", "2007", "2006", "2005"];

  const tierMap = { "Pro": ["pro-pga", "pro"], "College": ["college"], "Amatør": ["amateur"], "Junior": ["junior"] };
  const filtered = D.norskeSpillere.filter(s => {
    if (query && !s.name.toLowerCase().includes(query.toLowerCase())) return false;
    if (tier !== "Alle" && !tierMap[tier].includes(s.tier)) return false;
    if (arGroup !== "Alle" && String(2026 - s.ar) !== arGroup) return false;
    return true;
  });

  return (
    <div>
      <section className="hero compact">
        <Reveal>
          <Eyebrow>AK Golf Stats · Norsk golfdatabase</Eyebrow>
          <h1 style={{ maxWidth: 880 }}>
            Alle norske <em className="italic-accent">golfspillere</em>. Ett sted.
          </h1>
          <p className="hero-sub">
            1 500+ spillere · 14 000+ turneringsresultater siden 2016 · oppdateres månedlig.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div style={{ marginTop: 40, maxWidth: 720 }}>
            <SearchBox
              value={query}
              onChange={setQuery}
              placeholder="Søk etter navn — for eksempel «Hovland» eller «Bærum GK»…"
              size="lg"
              autoFocus={false}/>
          </div>
        </Reveal>
      </section>

      <section className="section section-divider" style={{ paddingTop: 32 }}>
        <Reveal>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            <ChipGroup label="Tier" options={tiers} value={tier} onChange={setTier}/>
            <ChipGroup label="Årgang" options={ars} value={arGroup} onChange={setArGroup}/>
          </div>
        </Reveal>

        <Reveal delay={60}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, marginBottom: 24 }}>
            <div className="mini-mono">
              VISER {filtered.length} AV {D.norskeSpillere.length} SPILLERE
            </div>
            <div style={{ display: "flex", gap: 4, background: "var(--secondary)", borderRadius: 999, padding: 3, border: "1px solid var(--border)" }}>
              <button onClick={() => setView("grid")}
                className="viewport-btn" style={{ background: view === "grid" ? "var(--card)" : "transparent", boxShadow: view === "grid" ? "var(--shadow-sm)" : "none" }}>
                Kort
              </button>
              <button onClick={() => setView("table")}
                className="viewport-btn" style={{ background: view === "table" ? "var(--card)" : "transparent", boxShadow: view === "table" ? "var(--shadow-sm)" : "none" }}>
                Tabell
              </button>
            </div>
          </div>
        </Reveal>

        {view === "grid" ? (
          <div className="grid-3">
            {filtered.map((s, i) => (
              <Reveal key={s.slug} delay={i * 30}>
                <div className="norske-card" onClick={() => onOpenSpiller && onOpenSpiller(s.slug)} style={{ minHeight: 220 }}>
                  <div className="norske-head">
                    <div className="norske-avatar">{s.name.split(" ").map(n => n[0]).join("")}</div>
                    <div>
                      <div className="norske-name">{s.name}</div>
                      <div className="norske-tour">{s.ar} år · {s.klubb}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span className={`tier-badge ${s.tier}`}>{s.tier.replace("pro-pga", "PRO PGA").replace("-", " ")}</span>
                    {s.wagr && <span className="tier-badge">WAGR #{s.wagr}</span>}
                  </div>
                  <div style={{ borderTop: "1px dashed var(--border)", paddingTop: 14, display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div className="mini-mono">BESTE ÅR</div>
                      <div className="mono" style={{ fontSize: 18, fontWeight: 500 }}>{s.besteAr}</div>
                    </div>
                    <div>
                      <div className="mini-mono" style={{ textAlign: "right" }}>TURNERINGER</div>
                      <div className="mono" style={{ fontSize: 18, fontWeight: 500, textAlign: "right" }}>{s.antall}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal>
            <table className="dtable">
              <thead>
                <tr>
                  <th>#</th><th>Spiller</th><th>Klubb</th><th>Tier</th><th className="num">Beste år</th><th className="num">Turneringer</th><th className="num">Trend</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.slug} onClick={() => onOpenSpiller && onOpenSpiller(s.slug)} style={{ cursor: "pointer" }}>
                    <td className="mono muted-foreground">{i+1}</td>
                    <td><a href="#">{s.name}</a></td>
                    <td>{s.klubb}</td>
                    <td><span className={`tier-badge ${s.tier}`}>{s.tier.replace("pro-pga", "PRO PGA")}</span></td>
                    <td className="num">{s.besteAr}</td>
                    <td className="num">{s.antall}</td>
                    <td className="num"><TrendChip value={s.trend} suffix=""/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        )}
      </section>

      <section className="section section-divider">
        <Reveal>
          <div className="section-head">
            <div>
              <Eyebrow>Talent</Eyebrow>
              <h2>Spillere vi <em className="italic-accent">følger med på</em>.</h2>
            </div>
          </div>
        </Reveal>
        <div className="grid-4">
          {D.norskeSpillere.filter(s => s.trend < -2).slice(0, 4).map((s, i) => (
            <Reveal key={s.slug} delay={i * 80}>
              <div className="norske-card">
                <div className="norske-live-badge" style={{ color: "var(--primary)" }}>
                  <span style={{ background: "var(--accent)" }}/>Trending
                </div>
                <div className="norske-head" style={{ marginTop: 8 }}>
                  <div className="norske-avatar">{s.name.split(" ").map(n => n[0]).join("")}</div>
                  <div>
                    <div className="norske-name">{s.name}</div>
                    <div className="norske-tour">{s.ar} år · {s.klubb}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "var(--muted-fg)", lineHeight: 1.5 }}>
                  Forbedring 2025→2026: <span className="mono" style={{ color: "var(--primary)", fontWeight: 600 }}>{s.trend.toFixed(1)} strokes</span>. Bedre enn 92 % av jevnaldrende.
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

// ───── 06 Norsk spillerprofil ─────
function Spillerprofil() {
  const D = window.AKG_DATA;
  const p = D.profil;
  const [tab, setTab] = useState("resultater");

  return (
    <div>
      <section className="hero compact">
        <Reveal>
          <a href="#" className="breadcrumb">← Norske spillere</a>
        </Reveal>

        <Reveal delay={60}>
          <div style={{ display: "flex", gap: 32, alignItems: "flex-start", marginTop: 32, flexWrap: "wrap" }}>
            <div style={{ width: 120, height: 120, borderRadius: "50%", background: "var(--accent)", color: "var(--primary)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 38, fontWeight: 600, flexShrink: 0 }}>
              {p.initials}
            </div>
            <div style={{ flex: 1, minWidth: 280 }}>
              <Eyebrow><FlagGlyph code={p.flag}/> PGA TOUR · NORGE</Eyebrow>
              <h1 style={{ fontSize: 64, fontStyle: "italic", fontWeight: 500, marginTop: 12 }}>
                {p.navn}
              </h1>
              <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap", color: "var(--muted-fg)", fontSize: 15 }}>
                <span>{p.alder} år</span>
                <span>·</span>
                <span>{p.klubb}</span>
                <span>·</span>
                <span className={`tier-badge ${p.tier === "Pro PGA" ? "pro-pga" : "pro"}`}>{p.tier}</span>
              </div>
              <div style={{ marginTop: 10, color: "var(--muted-fg)", fontSize: 14 }}>
                Pro siden {p.proSiden} · {p.college}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="kpi-strip" style={{ marginTop: 48, border: "1px solid var(--border)", borderRadius: "var(--r-md)" }}>
            <div className="kpi">
              <div className="kpi-eyebrow">Turneringer</div>
              <div className="kpi-value"><CountUp value={p.totalTurneringer}/></div>
            </div>
            <div className="kpi">
              <div className="kpi-eyebrow">Runder</div>
              <div className="kpi-value"><CountUp value={p.totalRunder}/></div>
            </div>
            <div className="kpi">
              <div className="kpi-eyebrow">Beste runde</div>
              <div className="kpi-value">
                <CountUp value={p.besteScore}/>
                <span className="unit">({p.besteAr})</span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="section-tight section-divider">
        <TabBar tabs={[
          { id: "resultater", label: "Resultater" },
          { id: "trend",      label: "Trend" },
          { id: "sammenlign", label: "Sammenlign" },
          { id: "stats",      label: "Stats" },
        ]} active={tab} onChange={setTab}/>

        <div style={{ marginTop: 32 }}>
          {tab === "resultater" && (
            <div className="stack-md">
              <div className="chips">
                {["Alle", "PGA Tour", "Korn Ferry", "NCAA"].map(t => (
                  <button key={t} className={`chip ${t === "Alle" ? "active" : ""}`}>{t}</button>
                ))}
              </div>
              {p.resultater.map((r, i) => (
                <Reveal key={i} delay={i * 40}>
                  <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: 24 }}>
                    <div className="mini-mono">{r.dato.toUpperCase()} · {r.turnering.toUpperCase().includes("U.S.") ? "PGA TOUR" : "PGA TOUR"}</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, marginTop: 6 }}>
                      {r.turnering}
                    </div>
                    <div style={{ color: "var(--muted-fg)", fontSize: 13, marginTop: 4 }}>{r.sted}</div>
                    <div style={{ display: "flex", gap: 24, marginTop: 16, alignItems: "baseline", flexWrap: "wrap" }}>
                      {r.rounds.map((rn, ix) => (
                        <div key={ix} style={{ display: "flex", flexDirection: "column" }}>
                          <span className="mini-mono">R{ix+1}</span>
                          <span className="mono" style={{ fontSize: 28, fontWeight: 500 }}>{rn}</span>
                        </div>
                      ))}
                      <div style={{ flex: 1, minWidth: 120 }}/>
                      <div style={{ textAlign: "right" }}>
                        <div className="mini-mono">TOTAL</div>
                        <div className="mono" style={{ fontSize: 28, fontWeight: 500 }}>{r.total}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="mini-mono">POSISJON</div>
                        <div className="mono" style={{ fontSize: 28, fontWeight: 500, color: r.pos.includes("T-3") || r.pos.includes("T-7") ? "var(--primary)" : "inherit" }}>{r.pos}</div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}

          {tab === "trend" && (
            <div>
              <Reveal>
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 32 }}>
                  <div className="mini-mono">SNITTSCORE PER ÅR · LAVERE = BEDRE</div>
                  <div style={{ marginTop: 20 }}>
                    <LineChart
                      series={[{ values: p.perAar.map(y => y.snitt), color: "#005840" }]}
                      xLabels={p.perAar.map(y => y.ar)}
                      inverted
                      height={260}/>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={100}>
                <table className="dtable" style={{ marginTop: 32 }}>
                  <thead>
                    <tr><th>År</th><th className="num">Runder</th><th className="num">Snitt</th><th className="num">Beste</th><th>Tourer</th></tr>
                  </thead>
                  <tbody>
                    {[...p.perAar].reverse().map(y => (
                      <tr key={y.ar}>
                        <td className="mono">{y.ar}</td>
                        <td className="num">{y.antall}</td>
                        <td className="num">{y.snitt.toFixed(1)}</td>
                        <td className="num" style={{ color: "var(--primary)" }}>{y.beste}</td>
                        <td>{y.tourer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Reveal>
            </div>
          )}

          {tab === "sammenlign" && (
            <div style={{ textAlign: "center", padding: 64 }}>
              <h2 style={{ marginBottom: 16 }}>Sammenlign {p.navn} med en annen norsk spiller</h2>
              <p className="muted-foreground" style={{ maxWidth: 480, margin: "0 auto 24px" }}>
                Velg en annen norsk spiller for å se side-by-side stats, beste resultater og snittscore over tid.
              </p>
              <div style={{ maxWidth: 480, margin: "0 auto" }}>
                <SearchBox value="" onChange={() => {}} placeholder="Søk norsk spiller…"/>
              </div>
            </div>
          )}

          {tab === "stats" && (
            <div className="grid-2">
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: 28 }}>
                <div className="mini-mono">SG TOTAL · 2026</div>
                <div className="editorial-num" style={{ fontSize: 56, color: "var(--primary)", marginTop: 12 }}>+1.62</div>
                <div style={{ marginTop: 16, fontSize: 13, color: "var(--muted-fg)" }}>#42 av 433 PGA-spillere</div>
              </div>
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: 28 }}>
                <div className="mini-mono">DRIVE DISTANCE</div>
                <div className="editorial-num" style={{ fontSize: 56, marginTop: 12 }}>294.8<span className="unit">yds</span></div>
                <div style={{ marginTop: 16, fontSize: 13, color: "var(--muted-fg)" }}>−2.5 yds fra Tour-snittet</div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section section-divider">
        <div className="pull-quote">
          {p.sammendrag}
          <div className="pull-quote-credit">AK Golf Stats redaksjon · oppdatert mai 2026</div>
        </div>
      </section>

      <MersalgBand/>
    </div>
  );
}

Object.assign(window, { PGAKategoriDetalj, PuttExplorer, Spillerbase, Spillerprofil });
