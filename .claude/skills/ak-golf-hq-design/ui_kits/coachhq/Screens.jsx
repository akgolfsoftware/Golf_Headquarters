/* CoachHQ Screens — Today (dashboard) + Players */

function DayTimeline() {
  const events = [
    { id: 1, start: 9,   dur: 1,   title: "Magnus Strand · Approach",  meta: "Range 3 · stinger-drill",  tone: "primary" },
    { id: 2, start: 10.5,dur: 1,   title: "Kari Johansen · Putt-test", meta: "Green B",                    tone: "accent" },
    { id: 3, start: 13,  dur: 1.5, title: "Per Eriksen · Full bag",    meta: "Range 1",                    tone: "primary" },
    { id: 4, start: 15.5,dur: 0.5, title: "Lina Berg · Eval (ny)",     meta: "Møterom",                    tone: "destructive" },
    { id: 5, start: 17,  dur: 1,   title: "Junior-gruppe · 4 stk",     meta: "Green A · short game",       tone: "accent" },
  ];
  const startH = 8, endH = 19;
  const hourH = 42;
  const hours = Array.from({ length: endH - startH + 1 }, (_, i) => startH + i);
  const nowH = 11 + 24/60;

  const toneBorder = { primary: "var(--primary)", accent: "var(--accent)", destructive: "var(--destructive)" };

  return (
    <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Eyebrow>ONSDAG · 28 MAI · 5 ØKTER</Eyebrow>
          <h3 className="h-section" style={{ marginTop: 4 }}>Dagens timeline</h3>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" style={{ height: 32, padding: "0 10px" }}><Icon name="chevron-left" size={14} /></button>
          <button className="btn btn-secondary" style={{ height: 32 }}>I dag</button>
          <button className="btn btn-secondary" style={{ height: 32, padding: "0 10px" }}><Icon name="chevron-right" size={14} /></button>
        </div>
      </div>

      <div style={{ position: "relative", padding: "12px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "48px 1fr", position: "relative" }}>
          {hours.map(h => (
            <React.Fragment key={h}>
              <div style={{ borderTop: "1px solid var(--border)", borderRight: "1px solid var(--border)", height: hourH, paddingTop: 4, paddingRight: 8, textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted-foreground)" }}>
                {String(h).padStart(2, "0")}:00
              </div>
              <div style={{ borderTop: "1px solid var(--border)", height: hourH, position: "relative",
                backgroundImage: "repeating-linear-gradient(to right, rgba(229,231,235,0.6) 0 3px, transparent 3px 7px)",
                backgroundSize: "100% 1px", backgroundPosition: "0 50%", backgroundRepeat: "no-repeat",
              }} />
            </React.Fragment>
          ))}

          {events.map(ev => {
            const top = (ev.start - startH) * hourH + 4;
            const height = Math.max(28, ev.dur * hourH - 4);
            return (
              <div key={ev.id} style={{
                position: "absolute", left: 56, right: 8, top, height,
                background: "var(--card)", border: "1px solid var(--border)",
                borderLeft: `3px solid ${toneBorder[ev.tone]}`,
                borderRadius: 8, padding: "6px 12px",
                display: "flex", flexDirection: "column", justifyContent: "center",
                boxShadow: "0 1px 2px rgba(10,31,23,0.04)",
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "-0.005em" }}>{ev.title}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted-foreground)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>{ev.meta}</div>
              </div>
            );
          })}

          {/* now line */}
          <div aria-hidden style={{
            position: "absolute", left: 48, right: 0, top: (nowH - startH) * hourH,
            height: 2, background: "var(--accent)", boxShadow: "0 0 8px rgba(209,248,67,0.6)", zIndex: 5,
          }}/>
        </div>
      </div>
    </div>
  );
}

function Inbox() {
  const items = [
    { id: 1, name: "Magnus Strand",  detail: "Bekreftet 14:30",                    tone: "lime",    label: "Konf." },
    { id: 2, name: "Kari Johansen",  detail: "Ber om time fre.",                   tone: "warn",    label: "Svar" },
    { id: 3, name: "Per Eriksen",    detail: "Faktura F-2025-0428 forfaller 14.06",tone: "urgent",  label: "Forfalt" },
    { id: 4, name: "Lina Berg",      detail: "Ny eval-forespørsel",                tone: "warn",    label: "Behandle" },
    { id: 5, name: "Jonas Holm",     detail: "Fullført Stinger-drill",             tone: "neutral", label: "Logget" },
  ];
  return (
    <div className="panel">
      <div className="panel-head">
        <Eyebrow><PulseDot />&nbsp;&nbsp;INNBOKS · 4 KREVER HANDLING</Eyebrow>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--primary)", fontWeight: 600, cursor: "pointer" }}>Se alle →</span>
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {items.map((it, i) => (
          <li key={it.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "0" }}>
            <Avatar initials={it.name.split(" ").map(s => s[0]).join("")} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.005em" }}>{it.name}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted-foreground)", marginTop: 2 }}>{it.detail}</div>
            </div>
            <StatusBadge tone={it.tone}>{it.label}</StatusBadge>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FocusPlayer() {
  return (
    <div className="panel">
      <div className="panel-head">
        <Eyebrow>FOKUS-SPILLER</Eyebrow>
        <Icon name="more-horizontal" size={16} color="var(--muted-foreground)" />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Avatar initials="MS" size={56} status="online" />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, letterSpacing: "-0.015em" }}>Magnus Strand</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>Hcp 4,2 · 14 runder '25 · klar 14:30</div>
        </div>
      </div>

      <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {[
          { label: "SG Approach", val: "+0,42", trend: "↑ +0,18" },
          { label: "Drive",       val: "268",   trend: "↑ 4m",   unit: "m" },
          { label: "Fairway",     val: "71",    trend: "↓ −3 %", unit: "%", neg: true },
          { label: "Putt 3m",     val: "52",    trend: "↑ Tour", unit: "%" },
        ].map(k => (
          <div key={k.label} style={{ background: "var(--background)", border: "1px solid var(--border)", borderRadius: 10, padding: 10 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted-foreground)" }}>{k.label}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 20, letterSpacing: "-0.02em", lineHeight: 1, marginTop: 6, fontFeatureSettings: "'tnum','zero'" }}>{k.val}{k.unit && <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 400, marginLeft: 3 }}>{k.unit}</span>}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, marginTop: 6, color: k.neg ? "var(--destructive)" : "var(--success)" }}>{k.trend}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>PYRAMIDE · UKE 22</div>
        {[
          { label: "Turnering", pct: 38, color: "var(--pyr-turn)" },
          { label: "Spill",     pct: 52, color: "var(--pyr-spill)" },
          { label: "Golfslag",  pct: 64, color: "var(--pyr-slag)" },
          { label: "Teknisk",   pct: 72, color: "var(--pyr-tek)" },
          { label: "Fysisk",    pct: 88, color: "var(--pyr-fys)" },
        ].map(r => (
          <div key={r.label} style={{ display: "grid", gridTemplateColumns: "60px 1fr 40px", alignItems: "center", gap: 10, padding: "3px 0" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)" }}>{r.label}</span>
            <span style={{ height: 6, borderRadius: 999, background: "var(--muted)", overflow: "hidden" }}>
              <span style={{ display: "block", height: "100%", background: r.color, width: r.pct + "%", borderRadius: 999 }} />
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, textAlign: "right" }}>{r.pct} %</span>
          </div>
        ))}
      </div>

      <button className="btn btn-primary" style={{ width: "100%", marginTop: 18 }}>
        Åpne spillerprofil <Icon name="arrow-right" size={14} />
      </button>
    </div>
  );
}

function TodayView() {
  return (
    <>
      <header style={{ marginBottom: 24 }}>
        <Eyebrow>ONSDAG · 28 MAI · 11:24</Eyebrow>
        <h1 className="h-display" style={{ marginTop: 8 }}>
          Du har <em>5 økter</em> i dag — neste 14:30.
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted-foreground)", marginTop: 8, maxWidth: 600 }}>
          Magnus' approach er +0,42 SG siste fem runder. Tour-snittet er +0,28. Han er klar for stinger-drillen — la oss ikke gjøre den lett.
        </p>
      </header>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { l: "Aktive spillere", v: "42",   t: "↑ 3 nye denne mnd" },
          { l: "Økter denne uka",  v: "28",   t: "↑ 14 % vs forrige" },
          { l: "MRR · coaching",   v: "184k", t: "↑ 6 % vs april", unit: "kr" },
          { l: "Utestående",       v: "12,8k",t: "3 forfalt", unit: "kr", neg: true },
        ].map(k => (
          <div key={k.l} className="panel" style={{ padding: 16 }}>
            <div className="eyebrow">{k.l}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 28, letterSpacing: "-0.02em", lineHeight: 1, marginTop: 10, fontFeatureSettings: "'tnum','zero'" }}>{k.v}{k.unit && <span style={{ fontSize: 13, color: "var(--muted-foreground)", fontWeight: 400, marginLeft: 4 }}>{k.unit}</span>}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, marginTop: 8, color: k.neg ? "var(--destructive)" : "var(--success)" }}>{k.t}</div>
          </div>
        ))}
      </div>

      {/* 3 col layout */}
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr 360px", gap: 16, alignItems: "start" }}>
        <FocusPlayer />
        <DayTimeline />
        <Inbox />
      </div>
    </>
  );
}

function PlayersView() {
  const players = [
    { name: "Magnus Strand",  hcp: 4.2,  trend: [6.8, 6.4, 6.0, 5.4, 4.8, 4.2], status: "ok",     statusLabel: "Aktiv", lastSession: "I dag 14:30", sg: "+0,42" },
    { name: "Kari Johansen",  hcp: 12.4, trend: [16, 15.2, 14.5, 13.8, 13.0, 12.4], status: "ok", statusLabel: "Aktiv", lastSession: "i går 17:00", sg: "+0,18" },
    { name: "Per Eriksen",    hcp: 8.6,  trend: [9.2, 9.0, 8.8, 8.7, 8.5, 8.6], status: "urgent", statusLabel: "Faktura forfalt", lastSession: "1 uke siden", sg: "−0,08" },
    { name: "Lina Berg",      hcp: 22.0, trend: [25, 24, 23.5, 23, 22.5, 22], status: "warn",    statusLabel: "Ny — eval", lastSession: "Aldri", sg: "—" },
    { name: "Jonas Holm",     hcp: 2.1,  trend: [3.0, 2.8, 2.5, 2.3, 2.2, 2.1], status: "lime",  statusLabel: "Tour", lastSession: "I går 09:00", sg: "+0,68" },
    { name: "Andrea Vik",     hcp: 6.8,  trend: [8.0, 7.6, 7.2, 7.0, 6.9, 6.8], status: "ok",    statusLabel: "Aktiv", lastSession: "Man 11:00", sg: "+0,22" },
    { name: "Erik Solli",     hcp: 14.2, trend: [16, 15.5, 15, 14.8, 14.5, 14.2], status: "ok",  statusLabel: "Aktiv", lastSession: "Lør 10:00", sg: "−0,14" },
    { name: "Mari Lund",      hcp: 18.5, trend: [22, 21, 20, 19.5, 19, 18.5], status: "warn",   statusLabel: "Mangler logg", lastSession: "2 uker", sg: "+0,04" },
  ];

  return (
    <>
      <header style={{ marginBottom: 24 }}>
        <Eyebrow>SPILLERE · 42 AKTIVE</Eyebrow>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, marginTop: 8 }}>
          <h1 className="h-display">
            Hvem trenger <em>oppmerksomhet</em>?
          </h1>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary"><Icon name="filter" size={14} />Filter</button>
            <button className="btn btn-secondary"><Icon name="arrow-up-down" size={14} />Hcp ↓</button>
            <button className="btn btn-primary"><Icon name="user-plus" size={14} />Ny spiller</button>
          </div>
        </div>
      </header>

      <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--background)" }}>
              {["Spiller", "Hcp", "Trend · 6 mnd", "SG total", "Siste økt", "Status", ""].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted-foreground)", borderBottom: "1px solid var(--border)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map((p, i) => (
              <tr key={p.name} style={{ borderBottom: i < players.length - 1 ? "1px solid var(--border)" : "0" }}>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar initials={p.name.split(" ").map(s => s[0]).join("")} size={32} />
                    <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.005em" }}>{p.name}</span>
                  </div>
                </td>
                <td style={{ padding: "14px 16px", fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, fontFeatureSettings: "'tnum','zero'" }}>{p.hcp.toFixed(1)}</td>
                <td style={{ padding: "14px 16px" }}><Sparkline values={p.trend} /></td>
                <td style={{ padding: "14px 16px", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: p.sg.startsWith("+") ? "var(--success)" : p.sg.startsWith("−") ? "var(--destructive)" : "var(--muted-foreground)" }}>{p.sg}</td>
                <td style={{ padding: "14px 16px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted-foreground)" }}>{p.lastSession}</td>
                <td style={{ padding: "14px 16px" }}><StatusBadge tone={p.status}>{p.statusLabel}</StatusBadge></td>
                <td style={{ padding: "14px 16px", textAlign: "right" }}><Icon name="chevron-right" size={16} color="var(--muted-foreground)" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

Object.assign(window, { TodayView, PlayersView });
