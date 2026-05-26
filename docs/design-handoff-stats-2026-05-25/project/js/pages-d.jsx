// Pages 16-21: Min progresjon, Quiz, Blogg, Portal stats, Moderering, PGA spillerdatabase

// ───── 16 Min progresjon ─────
function MinProgresjon() {
  const D = window.AKG_DATA;
  const m = D.minProgresjon;

  return (
    <div>
      <section className="hero compact">
        <Reveal>
          <Eyebrow>Innlogget · Min progresjon</Eyebrow>
          <h1 style={{ fontSize: 72 }}>
            Velkommen tilbake,<br/>
            <em className="italic-accent">{m.navn}</em>.
          </h1>
          <p className="hero-sub" style={{ maxWidth: 560 }}>
            Du har lagt inn SG {m.sammenligninger} ganger siden {m.forsteDato}. Her er trenden din.
          </p>
        </Reveal>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 32 }}>
            <div className="row-between" style={{ marginBottom: 24 }}>
              <Eyebrow>Siste sammenligning</Eyebrow>
              <span className="mini-mono">{m.historikk[0].dato.toUpperCase()} 2026</span>
            </div>
            <div className="grid-3">
              <div>
                <div className="mini-mono">DIN SG TOTAL</div>
                <div className="editorial-num" style={{ marginTop: 8 }}>−2.1</div>
                <div className="muted-foreground" style={{ fontSize: 13, marginTop: 6 }}>per runde</div>
              </div>
              <div>
                <div className="mini-mono">VS RORY</div>
                <div className="editorial-num" style={{ marginTop: 8, color: "var(--primary)" }}>−4.20</div>
                <div className="muted-foreground" style={{ fontSize: 13, marginTop: 6 }}>differanse</div>
              </div>
              <div>
                <div className="mini-mono">STØRSTE GAP</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, marginTop: 8 }}>Innspill</div>
                <div className="muted-foreground" style={{ fontSize: 13, marginTop: 6 }}>−3.2 strokes</div>
              </div>
            </div>
            <div style={{ marginTop: 24 }}>
              <Btn variant="primary" icon="ArrowRight">Ny sammenligning</Btn>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div className="section-head">
            <div>
              <Eyebrow>SG-trend</Eyebrow>
              <h2>Du forbedret deg <em className="italic-accent">1,2 strokes</em> på 6 måneder.</h2>
            </div>
          </div>
        </Reveal>
        <Reveal delay={60}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 32 }}>
            <LineChart
              series={[{ values: m.sgTrend.map(t => t.sg), color: "#005840", width: 2.5 }]}
              xLabels={m.sgTrend.map(t => t.dato)}
              height={260}/>
            <div className="mini-mono" style={{ marginTop: 16, textAlign: "right" }}>
              TOUR-SNITT = 0 · DU = −2.1 PER RUNDE
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="grid-2" style={{ marginTop: 32 }}>
            {[
              { key: "ott",  lbl: "SG: OFF THE TEE",  data: m.perKategori.ott  },
              { key: "app",  lbl: "SG: APPROACH",     data: m.perKategori.app  },
              { key: "arg",  lbl: "SG: AROUND GREEN", data: m.perKategori.arg  },
              { key: "putt", lbl: "SG: PUTTING",      data: m.perKategori.putt },
            ].map((c, i) => {
              const diff = c.data.til - c.data.fra;
              const better = diff > 0;
              return (
                <div key={c.key} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: 24 }}>
                  <div className="row-between">
                    <div className="mini-mono">{c.lbl}</div>
                    <TrendChip value={Math.round(diff * 100) / 100} suffix=""/>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <LineChart series={[{ values: c.data.trend, color: "#005840", width: 1.5 }]} height={70} showDots={false} showArea={false}/>
                  </div>
                  <div className="row-between" style={{ marginTop: 8 }}>
                    <span className="mono muted-foreground" style={{ fontSize: 12 }}>{c.data.fra.toFixed(1)}</span>
                    <span className="mono" style={{ fontSize: 14, fontWeight: 500, color: better ? "var(--primary)" : "inherit" }}>→ {c.data.til.toFixed(1)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div className="section-head">
            <div>
              <Eyebrow>Historikk</Eyebrow>
              <h2>Alle dine <em className="italic-accent">sammenligninger</em>.</h2>
            </div>
          </div>
        </Reveal>
        <table className="dtable">
          <thead>
            <tr><th>Dato</th><th>Referanse</th><th className="num">SG-diff</th><th className="num">Est. Tour-score</th></tr>
          </thead>
          <tbody>
            {m.historikk.map((h, i) => (
              <tr key={i}>
                <td>{h.dato}</td>
                <td><a href="#">{h.ref}</a></td>
                <td className="num">{h.diff.toFixed(2)}</td>
                <td className="num mono">{h.tourScore.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div className="pull-quote">
            Største og mest konsistente gap er <strong>innspill</strong> (SG: APP), som har vært −1.5 til −2.1 hver gang. Det er sannsynligvis der mest å hente.
            <div className="pull-quote-credit">Automatisk analyse · oppdatert 12. mai 2026</div>
          </div>
        </Reveal>
      </section>

      <MersalgBand/>
    </div>
  );
}

// ───── 17 Quiz ─────
function Quiz() {
  const D = window.AKG_DATA;
  const questions = D.quiz;
  const [phase, setPhase] = useState("intro"); // intro | q | result
  const [qIdx, setQIdx] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);

  const current = questions[qIdx];

  const choose = (i) => {
    if (showFeedback) return;
    setAnswer(i);
    setShowFeedback(true);
    if (i === current.correct) setScore(s => s + 1);
  };

  const next = () => {
    setShowFeedback(false);
    setAnswer(null);
    if (qIdx + 1 >= questions.length) {
      setPhase("result");
    } else {
      setQIdx(qIdx + 1);
    }
  };

  if (phase === "intro") {
    return (
      <div>
        <div className="quiz-stage" style={{ textAlign: "center", paddingTop: 96 }}>
          <Eyebrow>AK Golf Stats · Quiz</Eyebrow>
          <h1 style={{ fontSize: 64, marginTop: 24 }}>
            Hvor mye <em className="italic-accent">vet du</em> om proffene?
          </h1>
          <div className="mini-mono" style={{ marginTop: 32 }}>
            {questions.length} SPØRSMÅL · 3 MINUTTER · DEL RESULTATET
          </div>
          <div style={{ marginTop: 40 }}>
            <Btn variant="primary" icon="ArrowRight" size="lg" onClick={() => setPhase("q")}>Start quiz</Btn>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 56 }}>
            {questions.map((_, i) => (
              <div key={i} style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--secondary)", border: "1.5px solid var(--border)", display: "grid", placeItems: "center", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-fg)" }}>?</div>
            ))}
          </div>
        </div>
        <MersalgBand/>
      </div>
    );
  }

  if (phase === "result") {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div>
        <div className="quiz-stage" style={{ textAlign: "center", paddingTop: 64 }}>
          <Eyebrow>Resultat</Eyebrow>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 24, marginTop: 12, color: "var(--muted-fg)" }}>Du fikk</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 160, fontWeight: 600, lineHeight: 1, marginTop: 12, fontVariantNumeric: "tabular-nums" }}>
            <CountUp value={score} duration={1200}/> / {questions.length}
          </div>
          <p style={{ fontSize: 18, marginTop: 24, color: "var(--muted-fg)", maxWidth: 480, margin: "24px auto 0" }}>
            Du er bedre enn <strong style={{ color: "var(--primary)" }}>{pct >= 60 ? 78 : 42}%</strong> av nordmenn som har tatt denne quizen.
          </p>

          <div style={{ marginTop: 48 }}>
            <div className="mini-mono">PER KATEGORI</div>
            <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
              {[
                { lbl: "Drive",     n: 3, total: 3 },
                { lbl: "Approach",  n: 2, total: 3 },
                { lbl: "Kort spill",n: 1, total: 2 },
                { lbl: "Putting",   n: 1, total: 2 },
              ].map(k => (
                <div key={k.lbl} style={{ textAlign: "center" }}>
                  <div className="mini-mono">{k.lbl}</div>
                  <div style={{ display: "flex", gap: 4, marginTop: 8, justifyContent: "center" }}>
                    {[...Array(k.total)].map((_, i) => (
                      <span key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: i < k.n ? "var(--primary)" : "var(--secondary)", border: "1px solid var(--border)" }}/>
                    ))}
                  </div>
                  <div className="mono" style={{ fontSize: 11, marginTop: 6, color: "var(--muted-fg)" }}>{k.n}/{k.total}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 56, flexWrap: "wrap" }}>
            <Btn variant="primary" icon="ExternalLink">Del resultatet</Btn>
            <Btn variant="secondary" icon="ArrowRight" onClick={() => { setPhase("intro"); setQIdx(0); setScore(0); }}>Ta på nytt</Btn>
          </div>
        </div>
        <MersalgBand/>
      </div>
    );
  }

  return (
    <div>
      <div className="quiz-stage">
        <div className="quiz-progress">
          <span>Spørsmål {qIdx + 1} av {questions.length}</span>
          <span>Kategori: {current.kategori}</span>
        </div>

        <div className="quiz-question">{current.q}</div>

        <div className="quiz-options">
          {current.a.map((opt, i) => {
            let cls = "quiz-option";
            if (showFeedback) {
              if (i === current.correct) cls += " correct";
              else if (i === answer) cls += " wrong";
            }
            return (
              <button key={i} className={cls} onClick={() => choose(i)}>
                {opt}
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <Reveal>
            <div style={{ marginTop: 32, padding: 24, background: answer === current.correct ? "rgba(209,248,67,0.15)" : "rgba(190,61,61,0.06)", borderRadius: "var(--r-md)", border: "1px solid var(--border)" }}>
              <div className="mini-mono" style={{ color: answer === current.correct ? "var(--primary)" : "#BE3D3D" }}>
                {answer === current.correct ? "✓ RIKTIG" : `✗ FEIL · RIKTIG VAR ${current.a[current.correct]}`}
              </div>
              <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.5 }}>{current.forklaring}</p>
              <div style={{ marginTop: 16, textAlign: "right" }}>
                <Btn variant="primary" icon="ArrowRight" onClick={next}>
                  {qIdx + 1 >= questions.length ? "Se resultatet" : "Neste"}
                </Btn>
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}

// ───── 18 Blog (list + article) ─────
function Blog() {
  const D = window.AKG_DATA;
  const [view, setView] = useState("list");
  const featured = D.blogPosts.find(p => p.featured);
  const rest = D.blogPosts.filter(p => !p.featured);

  if (view === "article") {
    return (
      <div>
        <section className="hero compact" style={{ paddingBottom: 0 }}>
          <Reveal>
            <a href="#" className="breadcrumb" onClick={(e) => { e.preventDefault(); setView("list"); }}>← Alle artikler</a>
            <div style={{ marginTop: 24 }}>
              <Eyebrow>{featured.kategori} · Junior · Putt-statistikk</Eyebrow>
            </div>
            <h1 style={{ fontSize: 64, maxWidth: 880 }}>
              Hvorfor norske <em className="italic-accent">17-åringer</em> er dårligere på putt
            </h1>
            <p className="hero-sub" style={{ fontSize: 22, maxWidth: 720 }}>
              {featured.undertittel}
            </p>
            <div className="mini-mono" style={{ marginTop: 24 }}>
              AV {featured.forfatter.toUpperCase()} · {featured.dato.toUpperCase()} · {featured.lestid} MIN LESETID
            </div>
          </Reveal>
        </section>

        <section style={{ maxWidth: 720, margin: "64px auto", padding: "0 32px" }}>
          <Reveal>
            <p style={{ fontSize: 19, lineHeight: 1.8, color: "var(--fg)" }}>
              Vi tracker hver putt i Srixon Tour. Det gir et datasett på <strong>14 247 putter</strong> over de siste tre sesongene. Når vi sammenligner med <strong>Sverige Junior Open</strong>-tilsvarende sett, dukker et tydelig mønster opp: norske 17-åringer synker færre putter i 3- til 5-meters-sonen.
            </p>

            <div style={{ background: "var(--accent)", color: "var(--accent-fg)", padding: 32, borderRadius: "var(--r-lg)", margin: "40px 0", textAlign: "center" }}>
              <div className="editorial-num" style={{ fontSize: 88 }}>82%</div>
              <div style={{ fontSize: 17, marginTop: 12, fontWeight: 500 }}>av PGA Tour-putter fra 3m går inn.</div>
              <div style={{ fontSize: 14, marginTop: 4, opacity: 0.75 }}>Norsk junior-snitt: 45%</div>
            </div>

            <p style={{ fontSize: 19, lineHeight: 1.8 }}>
              Forskjellen er størst på 5-meteren — det Broadie kaller "<em>gjennombrudd-avstanden</em>". Her synker svenske 17-åringer 24 % av puttene, mens norske ligger på 18 %. Det høres lite ut, men over en sesong er det ca. <strong>1,4 birdies per spiller per måned</strong>.
            </p>

            <div style={{ background: "var(--secondary)", padding: 32, borderRadius: "var(--r-md)", margin: "40px 0" }}>
              <div className="mini-mono">KORT FORTALT</div>
              <ul style={{ marginTop: 16, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10, fontSize: 15, lineHeight: 1.5 }}>
                <li>• Norske 17-åringer synker 12 % færre 5m-putter enn svenske</li>
                <li>• Forskjellen er størst på 8–10m</li>
                <li>• Trolig forskjell i treningsmetodikk</li>
              </ul>
            </div>

            <h2 style={{ fontSize: 32, fontWeight: 600, marginTop: 56 }}>Hvorfor?</h2>
            <p style={{ fontSize: 19, lineHeight: 1.8, marginTop: 16 }}>
              Vi snakket med tre svenske juniortrenere. Alle tre nevner samme ting: <strong>speed control</strong>. Svenske akademier bruker fast 30 min per uke på speed-drills. I Norge er det ad-hoc.
            </p>

            <div className="pull-quote">
              En 5-meter er ikke en birdie-mulighet — den er en forsvarsslag. Norske juniorer behandler den feil.
              <div className="pull-quote-credit">Mark Broadie · Columbia Business School</div>
            </div>
          </Reveal>
        </section>

        <section className="section section-divider">
          <Reveal>
            <div className="section-head">
              <div>
                <Eyebrow>Les også</Eyebrow>
                <h2>Andre <em className="italic-accent">analyser</em>.</h2>
              </div>
            </div>
          </Reveal>
          <div className="grid-3">
            {rest.slice(0, 3).map((p, i) => (
              <Reveal key={p.slug} delay={i * 60}>
                <div className="media-card">
                  <div className="media-card-img">[ {p.kategori} ]</div>
                  <div className="media-card-body">
                    <div className="media-card-eyebrow">
                      <span>{p.kategori.toUpperCase()} · {p.dato.toUpperCase()}</span>
                      <span>{p.lestid} min</span>
                    </div>
                    <h3 className="media-card-title">{p.tittel}</h3>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <section className="hero compact">
        <Reveal>
          <Eyebrow>AK Golf Stats · Analyse</Eyebrow>
          <h1>Tall som <em className="italic-accent">betyr noe</em>.</h1>
          <p className="hero-sub" style={{ maxWidth: 580 }}>
            Datadrevne artikler om norsk og internasjonal golf. Skrevet av folk som faktisk forstår SG.
          </p>
        </Reveal>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div className="media-card" onClick={() => setView("article")} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, minHeight: 320 }}>
            <div className="media-card-img" style={{ aspectRatio: "auto" }}>[ Hovedbilde · {featured.kategori} ]</div>
            <div className="media-card-body" style={{ padding: 40, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div className="media-card-eyebrow">
                <span>DENNE UKEN · {featured.kategori.toUpperCase()}</span>
                <span>{featured.lestid} MIN</span>
              </div>
              <h2 style={{ fontSize: 36, fontWeight: 600, marginTop: 16, lineHeight: 1.1 }}>
                Hvorfor norske 17-åringer er <em className="italic-accent">dårligere</em> på putt
              </h2>
              <p style={{ fontSize: 15, color: "var(--muted-fg)", lineHeight: 1.5, marginTop: 16 }}>{featured.undertittel}</p>
              <div className="media-card-foot">AV {featured.forfatter.toUpperCase()} · {featured.dato.toUpperCase()}</div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div className="row-between" style={{ marginBottom: 24 }}>
            <ChipGroup options={["Alle", "Analyse", "Junior", "PGA Tour", "Norske spillere", "Banedata"]} value="Alle" onChange={() => {}}/>
          </div>
        </Reveal>
        <div className="grid-3">
          {rest.map((p, i) => (
            <Reveal key={p.slug} delay={i * 50}>
              <div className="media-card" onClick={() => setView("article")}>
                <div className="media-card-img">[ {p.kategori} ]</div>
                <div className="media-card-body">
                  <div className="media-card-eyebrow">
                    <span>{p.kategori.toUpperCase()} · {p.dato.toUpperCase()}</span>
                    <span>{p.lestid} min</span>
                  </div>
                  <h3 className="media-card-title">{p.tittel}</h3>
                  <p className="media-card-sub">{p.undertittel}</p>
                  <div className="media-card-foot">
                    LESETID {p.lestid} MIN <Icon name="ArrowRight" size={14}/>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}

// ───── 19 Portal Stats Dashboard ─────
function PortalStats() {
  const D = window.AKG_DATA;
  const p = D.portal;

  return (
    <div>
      <section style={{ padding: "48px 64px 32px" }}>
        <Reveal>
          <div className="row-between">
            <div>
              <h1 style={{ fontSize: 56 }}>
                God morgen, <em className="italic-accent">{p.navn}</em>.
              </h1>
              <p className="hero-sub" style={{ maxWidth: 560 }}>
                Du spilte 3 runder forrige uke. Snittet ditt forbedret seg <strong className="mono">0,8 strokes</strong> mot uka før.
              </p>
            </div>
            <div className="mini-mono" style={{ textAlign: "right" }}>
              MANDAG 25. MAI<br/>09:42
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
            <Btn variant="primary" icon="ArrowRight">Logg ny runde</Btn>
            <Btn variant="secondary" icon="ArrowRight">Se siste runde</Btn>
          </div>
        </Reveal>
      </section>

      <Reveal>
        <div className="kpi-strip cols-4" style={{ borderRadius: 0 }}>
          <div className="kpi">
            <div className="kpi-eyebrow">Siste 30 dager</div>
            <div className="kpi-value"><CountUp value={p.snittSiste30} decimals={1}/></div>
            <div className="kpi-sub"><TrendChip value={p.diffForrigeUke} suffix=""/> fra forrige</div>
          </div>
          <div className="kpi">
            <div className="kpi-eyebrow">Runder</div>
            <div className="kpi-value"><CountUp value={p.runderSiste30}/></div>
            <div className="kpi-sub">siste 30 dager</div>
          </div>
          <div className="kpi">
            <div className="kpi-eyebrow">Siste runde</div>
            <div className="kpi-value">{p.sisteRunde.score} <span className="unit">({p.sisteRunde.tilPar})</span></div>
            <div className="kpi-sub">{p.sisteRunde.bane} · {p.sisteRunde.dato}</div>
          </div>
          <div className="kpi">
            <div className="kpi-eyebrow">Beste i 2026</div>
            <div className="kpi-value" style={{ color: "var(--primary)" }}>{p.besteIAar.score}</div>
            <div className="kpi-sub">{p.besteIAar.tilPar} til par</div>
          </div>
        </div>
      </Reveal>

      <section className="section section-divider">
        <div className="grid-2">
          <Reveal>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 32 }}>
              <div className="mini-mono">SCORE-TREND · LAVERE = BEDRE</div>
              <div style={{ marginTop: 16 }}>
                <LineChart
                  series={[{ values: p.scoreTrend.map(s => s.score), color: "#005840", width: 2.5 }]}
                  xLabels={p.scoreTrend.map(s => s.dato)}
                  inverted
                  height={220}/>
              </div>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 32 }}>
              <div className="mini-mono">SG-PROFIL · VS TOUR-SNITT</div>
              <div style={{ display: "grid", placeItems: "center", marginTop: 16 }}>
                <BigRadar
                  you={[0.5 + p.sgPerKategori.ott / 4, 0.5 + p.sgPerKategori.app / 4, 0.5 + p.sgPerKategori.arg / 4, 0.5 + p.sgPerKategori.putt / 4]}
                  them={[0.85, 0.85, 0.85, 0.85]}
                  size={240}/>
              </div>
              <div className="mini-mono" style={{ marginTop: 16, textAlign: "center" }}>
                STØRSTE GAP: INNSPILL (−1.5) → ÅPNE FULL SAMMENLIGNING
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div className="section-head">
            <div>
              <Eyebrow>Insights</Eyebrow>
              <h2>Tre <em className="italic-accent">observasjoner</em> denne uka.</h2>
            </div>
          </div>
        </Reveal>
        <div className="stack-md">
          {p.insights.map((ins, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className={`insight-card ${ins.type}`}>
                <div className="insight-icon">
                  <Icon name={ins.type === "celebrate" ? "Sparkles" : ins.type === "warning" ? "Zap" : "Trophy"} size={18}/>
                </div>
                <div className="insight-body">
                  <div className="insight-tit">{ins.tittel}</div>
                  <div className="insight-text">{ins.tekst}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section section-divider">
        <Reveal>
          <div style={{ background: "var(--primary)", color: "var(--bg)", borderRadius: "var(--r-xl)", padding: 40 }}>
            <div className="row-between" style={{ alignItems: "flex-start" }}>
              <div>
                <Eyebrow tone="lime">Din plan</Eyebrow>
                <h2 style={{ fontSize: 36, marginTop: 12, color: "var(--bg)" }}>
                  {p.nesteTurnering.dato} — <em style={{ color: "var(--accent)", fontStyle: "italic", fontWeight: 400 }}>{p.nesteTurnering.navn}</em>
                </h2>
                <div style={{ marginTop: 12, color: "rgba(250,250,247,0.7)", fontSize: 15 }}>
                  {p.nesteTurnering.bane} · 3 runder · {p.nesteTurnering.paameldte} norske påmeldt · Du er #{p.nesteTurnering.dinRanking} i ranking
                </div>
              </div>
              <Btn variant="outline" icon="ArrowRight">Forberedelse</Btn>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

// ───── 20 Moderering (admin) ─────
function Moderering() {
  const D = window.AKG_DATA;
  const m = D.modko;
  const [tab, setTab] = useState("turneringer");
  const [selected, setSelected] = useState([]);

  return (
    <div>
      <section style={{ padding: "32px 64px 24px", background: "var(--secondary)", borderBottom: "1px solid var(--border)" }}>
        <div className="row-between">
          <div>
            <div className="mini-mono">ADMIN · STATS</div>
            <h1 style={{ fontSize: 36, marginTop: 8 }}>Moderering</h1>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="editorial-num" style={{ fontSize: 56, color: "var(--primary)" }}>
              {m.statsTurneringer + m.statsResultater + m.statsProfilEndringer + m.statsSlett}
            </div>
            <div className="mini-mono">VENTENDE</div>
          </div>
        </div>
      </section>

      <Reveal>
        <div className="kpi-strip cols-4" style={{ borderRadius: 0, background: "var(--bg)" }}>
          <div className="kpi">
            <div className="kpi-eyebrow">Ventende</div>
            <div className="kpi-value">{m.statsTurneringer + m.statsResultater + m.statsProfilEndringer + m.statsSlett}</div>
          </div>
          <div className="kpi">
            <div className="kpi-eyebrow">Godkjent denne uka</div>
            <div className="kpi-value">{m.godkjentDenneUka}</div>
          </div>
          <div className="kpi">
            <div className="kpi-eyebrow">Avvist denne uka</div>
            <div className="kpi-value">{m.avvistDenneUka}</div>
          </div>
          <div className="kpi">
            <div className="kpi-eyebrow">Snittid</div>
            <div className="kpi-value mono" style={{ fontSize: 28, marginTop: 8 }}>{m.snittTid}</div>
          </div>
        </div>
      </Reveal>

      <section className="section-sm section-divider">
        <TabBar tabs={[
          { id: "turneringer", label: "Turneringer", count: m.statsTurneringer },
          { id: "resultater",  label: "Resultater",  count: m.statsResultater },
          { id: "profil",      label: "Profil-endringer", count: m.statsProfilEndringer },
          { id: "slett",       label: "Slett-forespørsler", count: m.statsSlett },
          { id: "historikk",   label: "Historikk" },
        ]} active={tab} onChange={setTab}/>

        <div style={{ marginTop: 32 }}>
          {tab === "turneringer" && (
            <div className="stack-md">
              {m.turneringer.map(t => (
                <div key={t.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: 20, display: "flex", gap: 16 }}>
                  <input type="checkbox"
                    checked={selected.includes(t.id)}
                    onChange={(e) => setSelected(e.target.checked ? [...selected, t.id] : selected.filter(s => s !== t.id))}/>
                  <div style={{ flex: 1 }}>
                    <div className="row" style={{ gap: 16 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600 }}>{t.navn}</div>
                      <span className="mini-mono">{t.dato.toUpperCase()}</span>
                      {t.flagg > 0 && (
                        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: t.flagg >= 3 ? "#BE3D3D" : "#B57317", fontWeight: 600, background: t.flagg >= 3 ? "rgba(190,61,61,0.1)" : "rgba(181,115,23,0.1)", padding: "2px 8px", borderRadius: 4 }}>
                          ⚠ {t.flagg} FLAGG
                        </span>
                      )}
                    </div>
                    <div className="muted-foreground" style={{ fontSize: 13, marginTop: 6 }}>
                      Innlagt av <strong>{t.innlegger}</strong>
                      {t.dubletter.length > 0 && <> · Mulige dubletter: {t.dubletter.join(", ")}</>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button style={{ background: "var(--accent)", border: "none", borderRadius: 6, width: 36, height: 36, color: "var(--primary)", cursor: "pointer", fontSize: 16 }}>✓</button>
                    <button style={{ background: "rgba(190,61,61,0.1)", border: "none", borderRadius: 6, width: 36, height: 36, color: "#BE3D3D", cursor: "pointer", fontSize: 16 }}>✗</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "slett" && (
            <div style={{ background: "rgba(190,61,61,0.05)", border: "1px solid #BE3D3D", borderRadius: "var(--r-lg)", padding: 32 }}>
              <div className="mini-mono" style={{ color: "#BE3D3D" }}>GDPR · SLETT-FORESPØRSEL</div>
              <h2 style={{ fontSize: 28, fontWeight: 600, marginTop: 12 }}>{m.slett.spiller}</h2>
              <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 24px", fontSize: 14 }}>
                <span className="muted-foreground">Forespurt av:</span><span>{m.slett.forespurAv}</span>
                <span className="muted-foreground">Mottatt:</span><span>{m.slett.mottatt}</span>
                <span className="muted-foreground">Grunn:</span><span>«{m.slett.grunn}»</span>
              </div>

              <div style={{ marginTop: 24, padding: 16, background: "rgba(190,61,61,0.08)", borderRadius: "var(--r-md)" }}>
                <div className="mini-mono" style={{ color: "#BE3D3D" }}>KONSEKVENS</div>
                <ul style={{ marginTop: 10, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
                  <li>• Sletter PublicPlayer + {m.slett.rader} PublicPlayerEntry-rader</li>
                  <li>• Markerer {m.slett.rader} turneringer som «anonym deltaker»</li>
                  <li>• Sender bekreftelse til {m.slett.forespurAv}</li>
                </ul>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <Btn variant="primary" icon={null}>Bekreft sletting</Btn>
                <Btn variant="secondary" icon={null}>Avvis med begrunnelse</Btn>
              </div>
            </div>
          )}

          {tab !== "turneringer" && tab !== "slett" && (
            <div style={{ padding: 64, textAlign: "center", color: "var(--muted-fg)" }}>
              <Icon name="Sparkles" size={32} style={{ opacity: 0.4 }}/>
              <div style={{ marginTop: 16, fontSize: 14 }}>Ingen ventende i denne kategorien akkurat nå.</div>
            </div>
          )}
        </div>

        {selected.length > 0 && (
          <div style={{ position: "sticky", bottom: 16, background: "var(--primary)", color: "var(--bg)", borderRadius: 999, padding: "12px 24px", marginTop: 32, display: "flex", alignItems: "center", gap: 16, boxShadow: "var(--shadow-lg)" }}>
            <span className="mono" style={{ fontSize: 13 }}>{selected.length} VALGT</span>
            <Btn variant="outline" icon={null}>Godkjenn alle</Btn>
            <Btn variant="outline" icon={null}>Avvis alle</Btn>
          </div>
        )}
      </section>
    </div>
  );
}

// ───── 21 PGA spillerdatabase ─────
function PGASpillerbase() {
  const D = window.AKG_DATA;
  const [tour, setTour] = useState("Alle");
  const [sortBy, setSortBy] = useState("sgTotal");

  const sorted = [...D.pgaSpillere].sort((a, b) => b[sortBy] - a[sortBy]);
  const filtered = tour === "Alle" ? sorted : sorted.filter(s => s.tour === tour);

  return (
    <div>
      <section className="hero compact">
        <Reveal>
          <a href="#" className="breadcrumb">← PGA Tour Stats</a>
          <div style={{ marginTop: 24 }}>
            <Eyebrow>PGA Tour · Alle spillere</Eyebrow>
          </div>
          <h1>
            <em className="italic-accent">1 299</em> spillere. <em className="italic-accent">3</em> tourer.
          </h1>
          <p className="hero-sub">
            Stats-database over alle aktive spillere på PGA Tour, European Tour og Korn Ferry. Søk, sammenlign, åpne profil.
          </p>
        </Reveal>
      </section>

      <Reveal>
        <div className="kpi-strip cols-4" style={{ borderRadius: 0 }}>
          <div className="kpi">
            <div className="kpi-eyebrow">PGA Tour</div>
            <div className="kpi-value">433</div>
          </div>
          <div className="kpi">
            <div className="kpi-eyebrow">European Tour</div>
            <div className="kpi-value">433</div>
          </div>
          <div className="kpi">
            <div className="kpi-eyebrow">Korn Ferry</div>
            <div className="kpi-value">433</div>
          </div>
          <div className="kpi">
            <div className="kpi-eyebrow">Samlet</div>
            <div className="kpi-value">1 299</div>
          </div>
        </div>
      </Reveal>

      <section className="section section-divider">
        <Reveal>
          <div style={{ maxWidth: 520, marginBottom: 24 }}>
            <SearchBox value="" onChange={() => {}} placeholder="Søk spiller — «McIlroy», «Hovland»…"/>
          </div>
          <div className="row" style={{ gap: 24, flexWrap: "wrap" }}>
            <ChipGroup label="Tour" options={["Alle", "PGA", "Euro", "KFT"]} value={tour} onChange={setTour}/>
            <div>
              <div className="mini-mono">SORTÉR ETTER</div>
              <div className="chips" style={{ marginTop: 8 }}>
                {[
                  { id: "sgTotal",  label: "SG Total" },
                  { id: "drive",    label: "Drive Distance" },
                  { id: "fairway",  label: "Fairway %" },
                  { id: "scoring",  label: "Scoring Avg" },
                ].map(o => (
                  <button key={o.id} className={`chip ${sortBy === o.id ? "active" : ""}`} onClick={() => setSortBy(o.id)}>{o.label}</button>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={60}>
          <table className="dtable" style={{ marginTop: 32 }}>
            <thead>
              <tr>
                <th>#</th><th>Spiller</th><th>Land</th><th>Tour</th>
                <th className="num">Runder</th>
                <th className="num">SG Total</th>
                <th className="num">Drive</th>
                <th className="num">Fairway</th>
                <th className="num">GIR</th>
                <th className="num">Scoring</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.dgId} className={s.land === "no" ? "norsk-row" : ""}>
                  <td className="mono muted-foreground">{i + 1}</td>
                  <td><a href="#">{s.navn}</a></td>
                  <td><FlagGlyph code={s.land}/></td>
                  <td className="mono">{s.tour}</td>
                  <td className="num">{s.runder}</td>
                  <td className="num" style={{ color: i < 3 ? "var(--primary)" : "inherit", fontWeight: i < 3 ? 600 : 500 }}>
                    +{s.sgTotal.toFixed(2)}
                  </td>
                  <td className="num">{s.drive.toFixed(1)}</td>
                  <td className="num">{s.fairway.toFixed(1)}%</td>
                  <td className="num">{s.gir.toFixed(1)}%</td>
                  <td className="num">{s.scoring.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </section>

      <MersalgBand/>
    </div>
  );
}

Object.assign(window, { MinProgresjon, Quiz, Blog, PortalStats, Moderering, PGASpillerbase });
