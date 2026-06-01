/* PlayerHQ Screens — Home, Plan, Stats, Profile */

const HERO_PHOTO = "https://images.unsplash.com/photo-1592919505780-303950717480?w=900&q=80&auto=format&fit=crop";
const FEATURE_PHOTO = "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=900&q=80&auto=format&fit=crop";

function HomeScreen() {
  return (
    <>
      {/* Photo hero */}
      <div style={{
        position: "relative", margin: "-54px -0 0", paddingTop: 54, height: 320, overflow: "hidden",
        background: `url(${HERO_PHOTO}) center/cover`,
      }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 30%, transparent 50%, rgba(10,31,23,0.85) 100%)" }} />
        <div style={{ position: "absolute", left: 24, right: 24, top: 70, zIndex: 5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Eyebrow tone="light">ONSDAG · 28 MAI · OSLO GK</Eyebrow>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.92)", textShadow: "0 1px 4px rgba(0,0,0,0.4)", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <PulseDot /> 12°C · vind 3 m/s
          </span>
        </div>
        <div style={{ position: "absolute", left: 24, right: 24, bottom: 28, zIndex: 5 }}>
          <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 500, fontSize: 18, color: "var(--accent)", display: "block" }}>God morgen, Magnus.</span>
          <h1 className="h-display on-photo" style={{ marginTop: 4, fontSize: 30 }}>
            Approach er <em>der</em> det skjer i dag.
          </h1>
        </div>
      </div>

      {/* Today's session */}
      <div style={{ padding: "16px 24px 8px" }}>
        <FeaturedCard
          eyebrow={<><PulseDot /> &nbsp; DAGENS ØKT · KL 14:30</>}
          title="Stinger-drill"
          italic="alt om bane-flighten."
          description="6 baller fra 150m, høyde under 8m. Mål: 4 av 6 innenfor 4m fra flagg."
          photo={FEATURE_PHOTO}
          action={<button className="btn btn-lime">Start økt &nbsp;<Icon name="arrow-right" size={16} /></button>}
        />
      </div>

      {/* KPI strip */}
      <div style={{ padding: "16px 24px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <Eyebrow>SISTE 5 RUNDER</Eyebrow>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--primary)", fontWeight: 600 }}>Se alt →</span>
        </div>
        <KpiStrip cols={2}>
          <KpiCard label="SG Approach" value="+0,42" trend="↑ +0,18 vs forrige" />
          <KpiCard label="Drive" value="268" unit="m" trend="↑ Tour-snitt +4" />
          <KpiCard label="Fairway" value="71" unit="%" trend="↓ −3 % siste 5" tone="neg" />
          <KpiCard label="Putt 3m" value="52" unit="%" trend="↑ Tour: 48 %" />
        </KpiStrip>
      </div>

      {/* Pyramid */}
      <div style={{ padding: "16px 24px 8px" }}>
        <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <Eyebrow>UKE 22 · PYRAMIDEN</Eyebrow>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--success)", fontWeight: 600 }}>↑ 4 punkt</span>
          </div>
          <PyramidProgress rows={[
            { label: "Turnering", pct: 38, value: "38 %", color: "var(--pyr-turn)" },
            { label: "Spill",     pct: 52, value: "52 %", color: "var(--pyr-spill)" },
            { label: "Golfslag",  pct: 64, value: "64 %", color: "var(--pyr-slag)" },
            { label: "Teknisk",   pct: 72, value: "72 %", color: "var(--pyr-tek)" },
            { label: "Fysisk",    pct: 88, value: "88 %", color: "var(--pyr-fys)" },
          ]} />
        </div>
      </div>

      {/* Next round */}
      <div style={{ padding: "16px 24px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <Eyebrow>NESTE TEE</Eyebrow>
        </div>
        <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--secondary)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted-foreground)", fontWeight: 600 }}>FRE</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--foreground)" }}>30</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.005em" }}>Oslo GK · 18 hull</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-foreground)", marginTop: 4 }}>11:24 · Hvit tee · m/ Anders</div>
            </div>
            <Icon name="chevron-right" size={20} color="var(--muted-foreground)" />
          </div>
        </div>
      </div>
    </>
  );
}

function PlanScreen() {
  const days = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
  const dates = [26, 27, 28, 29, 30, 31, 1];
  return (
    <>
      <div style={{ padding: "24px 24px 8px" }}>
        <Eyebrow>UKE 22 · 26 MAI — 1 JUN</Eyebrow>
        <h1 className="h-display" style={{ marginTop: 8, fontSize: 28 }}>
          Plan
        </h1>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--muted-foreground)", marginTop: 8 }}>
          4 økter denne uka. <em style={{ fontStyle: "italic", fontWeight: 500, color: "var(--primary)" }}>Stinger</em> i dag, putt-test torsdag.
        </p>
      </div>

      {/* Week strip */}
      <div style={{ padding: "8px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
          {days.map((d, i) => {
            const isToday = i === 2;
            const hasSession = [0,2,3,5].includes(i);
            return (
              <div key={d} style={{
                background: isToday ? "var(--primary)" : "white",
                color: isToday ? "var(--accent)" : "var(--foreground)",
                border: isToday ? "0" : "1px solid var(--border)",
                borderRadius: 12, padding: "10px 0", textAlign: "center",
                position: "relative", cursor: "pointer",
              }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", opacity: isToday ? 0.7 : 0.6 }}>{d}</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, marginTop: 4 }}>{dates[i]}</div>
                {hasSession && <div style={{ width: 4, height: 4, borderRadius: 999, background: isToday ? "var(--accent)" : "var(--primary)", margin: "4px auto 0" }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sessions list */}
      <div style={{ padding: "24px" }}>
        <Eyebrow>I DAG · ONS 28 MAI</Eyebrow>
        <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, padding: "4px 16px", marginTop: 12 }}>
          <SessionRow time="07:00" title="Mobility + speed-stick" meta="Oppvarming · 20 min" status="done" />
          <SessionRow time="14:30" title="Stinger-drill · 150m" meta="Approach · 45 min · 6 baller" status="now" />
          <SessionRow time="17:00" title="Putt 3m · 30 forsøk" meta="Spill · 25 min" status="upcoming" />
        </div>

        <Eyebrow>RESTEN AV UKA</Eyebrow>
        <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, padding: "4px 16px", marginTop: 12 }}>
          <SessionRow time="Tor 10:00" title="Putt-test · 3m / 6m / 9m" meta="Spill · 30 min · benchmark" status="upcoming" />
          <SessionRow time="Lør 09:00" title="Runde 18 · m/ Anders" meta="Bana · Oslo GK · hvit tee" status="upcoming" />
        </div>
      </div>
    </>
  );
}

function StatsScreen() {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun"];
  const hcp = [6.8, 6.4, 6.0, 5.4, 4.8, 4.2];
  const max = 7.5, min = 3.5;
  return (
    <>
      <div style={{ padding: "24px 24px 8px" }}>
        <Eyebrow>2025-SESONGEN · 14 RUNDER</Eyebrow>
        <h1 className="h-display" style={{ marginTop: 8, fontSize: 28 }}>
          Hcp <em>−2,6</em> siden januar.
        </h1>
      </div>

      {/* Hcp chart */}
      <div style={{ padding: "16px 24px" }}>
        <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
            <Eyebrow>HCP-TREND</Eyebrow>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--foreground)" }}>4,2</span>
          </div>
          <svg viewBox="0 0 320 120" style={{ width: "100%", height: 120 }} preserveAspectRatio="none">
            {[0,1,2,3].map(i => <line key={i} x1="0" x2="320" y1={20 + i*30} y2={20 + i*30} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,4" />)}
            <polyline
              fill="none" stroke="var(--primary)" strokeWidth="2"
              points={hcp.map((v, i) => `${20 + i * 56},${110 - ((max - v) / (max - min)) * 90}`).join(" ")}
            />
            {hcp.map((v, i) => (
              <circle key={i} cx={20 + i * 56} cy={110 - ((max - v) / (max - min)) * 90} r={i === hcp.length - 1 ? 5 : 3} fill={i === hcp.length - 1 ? "var(--accent)" : "var(--primary)"} stroke={i === hcp.length - 1 ? "var(--primary)" : "none"} strokeWidth="2" />
            ))}
          </svg>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {months.map(m => <span key={m}>{m}</span>)}
          </div>
        </div>
      </div>

      {/* Strokes Gained breakdown */}
      <div style={{ padding: "8px 24px" }}>
        <Eyebrow>SG · SISTE 5 RUNDER</Eyebrow>
        <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, padding: 18, marginTop: 12 }}>
          {[
            { name: "Off the tee", value: +0.18, pct: 60 },
            { name: "Approach",    value: +0.42, pct: 84 },
            { name: "Around green",value: -0.12, pct: 32 },
            { name: "Putting",     value: +0.08, pct: 48 },
          ].map(sg => (
            <div key={sg.name} style={{ display: "grid", gridTemplateColumns: "120px 1fr 60px", alignItems: "center", gap: 12, padding: "8px 0" }}>
              <span style={{ fontSize: 12, fontWeight: 500 }}>{sg.name}</span>
              <span style={{ position: "relative", height: 8, background: "var(--muted)", borderRadius: 999 }}>
                <span style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "var(--border)" }} />
                <span style={{ position: "absolute", top: 0, bottom: 0, borderRadius: 999, ...(sg.value >= 0
                  ? { left: "50%", width: `${sg.pct/2}%`, background: "var(--primary)" }
                  : { right: "50%", width: `${sg.pct/2}%`, background: "var(--destructive)" }
                ) }} />
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, textAlign: "right", color: sg.value >= 0 ? "var(--success)" : "var(--destructive)" }}>{sg.value > 0 ? "+" : ""}{sg.value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 24px 24px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-foreground)", lineHeight: 1.6 }}>
        Tour-snittet for SG Approach er +0,28 på Korn Ferry. Du ligger +0,42. Det er <span style={{ color: "var(--primary)", fontWeight: 600 }}>14 % over.</span>
      </div>
    </>
  );
}

function ProfileScreen() {
  return (
    <>
      <div style={{ padding: "32px 24px 16px", display: "flex", alignItems: "center", gap: 16 }}>
        <Avatar initials="MS" size={68} />
        <div>
          <Eyebrow>HCP 4,2 · OSLO GK · MEDLEM SIDEN 2019</Eyebrow>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, letterSpacing: "-0.015em", margin: "4px 0 0" }}>Magnus Strand</h2>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-foreground)", margin: "4px 0 0" }}>magnus@akgolf.no</p>
        </div>
      </div>

      <div style={{ padding: "8px 24px" }}>
        <KpiStrip cols={3}>
          <KpiCard label="Runder '25" value="14" />
          <KpiCard label="Best" value="68" />
          <KpiCard label="Snitt" value="73,2" />
        </KpiStrip>
      </div>

      {/* Invoices */}
      <div style={{ padding: "24px 24px 8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Eyebrow>FAKTURAER</Eyebrow>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--primary)", fontWeight: 600 }}>3 utestående</span>
        </div>
        <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: 16, padding: "4px 16px" }}>
          {[
            { ref: "F-2025-0428", desc: "Coaching mai · 4 økter", amt: "3 200", status: "warn", statusLabel: "Forfaller 14.06" },
            { ref: "F-2025-0331", desc: "Coaching april · 4 økter", amt: "3 200", status: "ok", statusLabel: "Betalt" },
            { ref: "F-2025-0228", desc: "Coaching mars · 5 økter", amt: "4 000", status: "ok", statusLabel: "Betalt" },
          ].map(inv => {
            const bg = inv.status === "ok" ? "#C8EBDC" : "#FBEFD4";
            const fg = inv.status === "ok" ? "#0E5D3F" : "#6B4D11";
            return (
              <div key={inv.ref} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.005em" }}>{inv.desc}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted-foreground)", marginTop: 2 }}>{inv.ref}</div>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, marginRight: 8 }}>{inv.amt} kr</div>
                <span style={{ background: bg, color: fg, fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", padding: "3px 8px", borderRadius: 999 }}>{inv.statusLabel}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "24px 24px 32px" }}>
        <button className="btn btn-ghost" style={{ width: "100%", color: "var(--destructive)" }}>Logg ut</button>
      </div>
    </>
  );
}

Object.assign(window, { HomeScreen, PlanScreen, StatsScreen, ProfileScreen });
