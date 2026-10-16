(() => {
const { AxisBadge, StatusPill, Segmented, Stepper, IconButton, Button, Icon } = window.AKGolfPrecisionAthletics_7d7c29;
const PM = window.PM;

function volumeStatus(planned, target) {
  const r = planned / target, diff = Math.abs(target - planned);
  if (r > 1.05) return { tone: "warn", text: PM.fmtH(diff) + " t over" };
  if (r < 0.9) return { tone: "neutral", text: PM.fmtH(diff) + " t gjenstår" };
  return { tone: "ok", text: "I rute" };
}

function YearCurve({ weeks, range, currentMin, currentAxes, selected, onPickPeriod, activePeriod }) {
  const [a, b] = range;
  const list = weeks.filter((w) => w.w >= a && w.w <= b);
  const n = list.length, H = 104, MAX = 32, sel = selected || PM.CURRENT_WEEK;
  const cols = "repeat(" + n + ",minmax(0,1fr))";
  const periods = PM.periods.filter((p) => p.to >= a && p.from <= b);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "grid", gridTemplateColumns: cols, borderBottom: "1px solid var(--border-hairline)" }} role="group" aria-label="Perioder">
        {periods.map((p, i) => {
          const s = Math.max(p.from, a) - a + 1, e = Math.min(p.to, b) - a + 2, on = p.id === activePeriod;
          return (
            <button key={p.id} type="button" onClick={() => onPickPeriod(p.id)} aria-pressed={on} title={p.name + " · uke " + p.from + "–" + p.to + " · " + p.budget + " t"} style={{ gridColumn: s + " / " + e, minWidth: 0, height: 32, border: 0, borderLeft: i ? "1px solid var(--border-strong)" : 0, background: "transparent", padding: "0 6px", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", boxShadow: on ? "inset 0 -2px 0 var(--border-ink)" : "none", color: on ? "var(--text-primary)" : "var(--text-secondary)" }}>
              <span style={{ font: (on ? "600" : "500") + " 12px/1 var(--font-sans)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0, flex: "0 1 auto" }}>{p.name}</span>
              <span style={{ font: "500 11px/1 var(--font-mono)", color: "var(--text-muted)", whiteSpace: "nowrap", marginLeft: "auto", flex: "0 1 auto", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{p.budget} t</span>
            </button>
          );
        })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: cols, gap: 2, height: H, alignItems: "end", borderBottom: "1px solid var(--border-strong)" }}>
        {list.map((w) => {
          const isSel = w.w === sel, cur = w.w === PM.CURRENT_WEEK, past = w.w < PM.CURRENT_WEEK && !isSel;
          const hours = cur && currentMin != null ? currentMin / 60 : past ? w.done : w.planned;
          const mix = cur && currentAxes ? PM.AXES.map((x) => [x, currentAxes[x] || 0]) : PM.AXES.map((x) => [x, PM.MIX[w.type][x]]);
          const tot = mix.reduce((s2, x) => s2 + x[1], 0) || 1, hpx = Math.min(1, hours / MAX) * (H - 14);
          return (
            <div key={w.w} title={"Uke " + w.w + " · " + PM.fmtH(hours * 60) + " t " + (past ? "gjennomført" : "planlagt")} style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column-reverse", opacity: isSel ? 1 : past ? .55 : .28, transition: "opacity 150ms ease" }}>
              {isSel && <span style={{ position: "absolute", top: -2, left: "50%", transform: "translateX(-50%)", font: "600 10px/1 var(--font-mono)", color: "var(--text-primary)", whiteSpace: "nowrap", background: "var(--surface-card)", padding: "2px 4px", zIndex: 1 }}>{w.w}</span>}
              {mix.filter((x) => x[1] > 0).map(([ax, m]) => <span key={ax} style={{ height: hpx * m / tot, background: "var(--axis-" + ax + ")", transition: "height 200ms var(--ease-out)" }} />)}
            </div>
          );
        })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: cols, gap: 2 }}>
        {list.map((w) => {
          const m = PM.months.find((x) => x[1] === w.w);
          return <span key={w.w} style={{ font: "var(--type-meta)", fontSize: n > 26 ? 10 : 11, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "visible", minWidth: 0, width: 0 }}>{m ? m[0].toUpperCase() : n <= 13 ? <span style={{ color: "var(--text-faint)" }}>{w.w}</span> : ""}</span>;
        })}
      </div>
      <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>SØYLE = TIMER PER UKE FORDELT PÅ AKSE · VALGT UKE FULL STYRKE · FRAMTIDIGE UKER LYSERE</span>
    </div>
  );
}

function CascadeCell({ level, name, planned, target, sub, active, onClick, children }) {
  const st = target ? volumeStatus(planned, target) : null;
  const pct = target ? Math.min(100, planned / target * 100) : 100;
  return (
    <button onClick={onClick} className="pa-card pa-card--interactive" style={{ minWidth: 0, padding: 14, gap: 8, textAlign: "left", font: "inherit", borderColor: active ? "var(--border-ink)" : undefined, boxShadow: active ? "inset 0 0 0 1px var(--border-ink)" : undefined }}>
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="kicker" style={{ color: active ? "var(--text-primary)" : undefined, whiteSpace: "nowrap" }}>{level}</span><span style={{ flex: 1 }} />{st && <span style={{ font: "var(--type-meta)", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{st.text.toUpperCase()}</span>}</span>
      <span style={{ font: "500 13px/1.2 var(--font-sans)", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>
      <span style={{ display: "flex", alignItems: "baseline", gap: 4, whiteSpace: "nowrap" }}>
        <span style={{ font: "600 21px/1 var(--font-mono)", color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>{planned}</span>
        {target != null && <span style={{ font: "var(--type-num-s)", color: "var(--text-muted)" }}>/ {target} t</span>}
      </span>
      <span style={{ height: 4, background: "var(--surface-sunken)", display: "block" }}><span style={{ display: "block", height: "100%", width: pct + "%", background: "var(--primary)", transition: "width 200ms var(--ease-out)" }} /></span>
      <span style={{ font: "var(--type-meta)", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</span>
    </button>
  );
}

function Cascade({ cells }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,168px),1fr))", gap: 8 }}>
      {cells.map((c) => <CascadeCell key={c.level} {...c} />)}
    </div>
  );
}

function WeekMeter({ sessions, target, setTarget }) {
  const total = sessions.reduce((a, s) => a + PM.sessionMin(s), 0);
  const byAxis = PM.AXES.map((a) => [a, sessions.reduce((x, s) => x + s.drills.filter((d) => d.axis === a).reduce((y, d) => y + d.min, 0), 0)]);
  const st = volumeStatus(total / 60, target);
  const scale = Math.max(target * 60, total) * 1.08;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, whiteSpace: "nowrap" }}>
          <span style={{ font: "var(--type-metric-l)", color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>{PM.fmtH(total)}</span>
          <span style={{ font: "var(--type-num)", color: "var(--text-muted)" }}>/ {target} t planlagt</span>
        </div>
        <StatusPill tone={st.tone}>{st.text}</StatusPill>
        <span style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span className="pa-field__label" style={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}>Ukemål</span>
          <div style={{ width: 160, maxWidth: "100%" }}><Stepper size="sm" value={target} min={5} max={40} unit="t" onChange={setTarget} /></div>
        </div>
      </div>
      <div style={{ position: "relative", height: 20, display: "flex", background: "var(--surface-sunken)" }}>
        {byAxis.filter(([, m]) => m > 0).map(([a, m]) => <span key={a} title={a.toUpperCase() + " " + PM.fmtH(m) + " t"} style={{ width: (m / scale * 100) + "%", background: "var(--axis-" + a + ")", transition: "width 200ms var(--ease-out)", borderRight: "2px solid var(--surface-card)" }} />)}
        {total < target * 60 && <span style={{ position: "absolute", top: 0, bottom: 0, left: (total / scale * 100) + "%", width: ((target * 60 - total) / scale * 100) + "%", boxShadow: "inset 0 0 0 1px var(--border-strong)", transition: "left 200ms var(--ease-out), width 200ms var(--ease-out), top 200ms var(--ease-out), opacity 200ms var(--ease-out)" }} />}
        <span style={{ position: "absolute", top: -4, bottom: -4, left: (target * 60 / scale * 100) + "%", width: 2, background: "var(--border-ink)", transition: "left 200ms var(--ease-out)" }} />
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {byAxis.map(([a, m]) => <span key={a} style={{ display: "flex", alignItems: "center", gap: 6 }}><AxisBadge axis={a} /><span style={{ font: "var(--type-num-s)", color: "var(--text-primary)" }}>{PM.fmtH(m)} t</span></span>)}
      </div>
    </div>
  );
}

function WeekBoard({ sessions, selected, onSelect, onAddSession }) {
  const ref = React.useRef(null), [bw, setBw] = React.useState(800);
  React.useLayoutEffect(() => { setBw(ref.current.getBoundingClientRect().width); const ro = new ResizeObserver(([e]) => setBw(e.contentRect.width)); ro.observe(ref.current); return () => ro.disconnect(); }, []);
  const stack = bw < 640;
  return (
    <div ref={ref} style={{ minWidth: 0 }}>
      <div style={{ display: "grid", gridTemplateColumns: stack ? "minmax(0,1fr)" : "repeat(7,minmax(0,1fr))", gap: stack ? 16 : 8, alignItems: "start" }}>
        {PM.days.map((day, di) => {
          const items = sessions.filter((s) => s.day === di).sort((x, y) => x.t.localeCompare(y.t));
          const dm = items.reduce((a, s) => a + PM.sessionMin(s), 0);
          return (
            <div key={day} style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, padding: "0 2px 6px", borderBottom: "1px solid var(--border-hairline)" }}>
                <span style={{ font: "600 13px/1 var(--font-sans)", color: "var(--text-primary)" }}>{day.split(" ")[0]}</span>
                <span className="num" style={{ fontSize: 12, color: "var(--text-muted)" }}>{day.split(" ")[1]}</span>
                <span style={{ flex: 1 }} />
                <span className="num" style={{ fontSize: 12, color: dm ? "var(--text-secondary)" : "var(--text-faint)" }}>{dm ? PM.fmtH(dm) : "—"}</span>
              </div>
              {items.map((s) => {
                const ax = PM.sessionAxis(s) || "fys", on = s.id === selected, m = PM.sessionMin(s);
                return (
                  <button key={s.id} onClick={() => onSelect(s.id)} style={{ position: "relative", textAlign: "left", display: "flex", flexDirection: "column", gap: 5, padding: "8px 8px 8px 13px", borderRadius: 8, border: "1px solid " + (on ? "var(--border-ink)" : "var(--border-hairline)"), background: "var(--surface-card)", boxShadow: on ? "0 0 0 1px var(--border-ink)" : "none", cursor: "pointer", overflow: "hidden", minWidth: 0, minHeight: 64 + Math.min(m, 180) / 4, transition: "border-color 150ms ease" }}>
                    <span aria-hidden="true" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: PM.stripe(PM.axisMix(s)) }} />
                    <span style={{ display: "flex", gap: 4, font: "500 11px/1 var(--font-mono)", color: "var(--text-secondary)" }}><span>{s.t}</span><span style={{ flex: 1 }} /><span>{PM.fmtHM(m)}</span></span>
                    <span style={{ font: "500 13px/1.25 var(--font-sans)", color: "var(--text-primary)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{PM.sessionTitle(s)}</span>
                    <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>{PM.axisMix(s).map((x) => x[0].toUpperCase()).join(" · ")}</span>
                  </button>
                );
              })}
              <button onClick={() => onAddSession(di)} aria-label={"Ny økt " + day} style={{ height: stack ? 44 : 32, borderRadius: 8, border: "1px dashed var(--border-strong)", background: "transparent", color: "var(--text-muted)", font: "500 13px/1 var(--font-sans)", cursor: "pointer" }}>+ Økt</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SessionPanel({ s, onOpenComposer, onEdit, onRemove }) {
  if (!s) return <div className="pa-card" style={{ padding: 20, font: "var(--type-body-s)", color: "var(--text-muted)" }}>Velg en økt i uka.</div>;
  const m = PM.sessionMin(s);
  return (
    <div className="pa-card" style={{ minHeight: 0 }}>
      <div style={{ padding: "16px 16px 12px", display: "flex", flexDirection: "column", gap: 6, borderBottom: "1px solid var(--border-hairline)" }}>
        <span className="kicker">Økt · {PM.days[s.day]} · {s.t}</span>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ font: "var(--type-title-s)", color: "var(--text-primary)", flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{PM.sessionTitle(s)}</span>
          <span style={{ font: "600 26px/1 var(--font-mono)", color: "var(--text-primary)", whiteSpace: "nowrap" }}>{PM.fmtHM(m)}</span>
          <span style={{ font: "var(--type-num-s)", color: "var(--text-muted)" }}>t</span>
        </div>
      </div>
      <div style={{ overflow: "auto" }}>
        {s.drills.length === 0 && <div style={{ padding: 16, font: "var(--type-body-s)", color: "var(--text-muted)" }}>Ingen øvelser ennå.</div>}
        {s.drills.map((d) => (
          <div key={d.id} className="pa-row" style={{ gap: 8, padding: "8px 8px 8px 12px", alignItems: "center" }}>
            <span style={{ width: 4, alignSelf: "stretch", background: "var(--axis-" + d.axis + ")", flex: "none" }} />
            <span className="pa-row__main"><span style={{ font: "500 13px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{d.title}</span><span style={{ font: "var(--type-meta)", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.meta.toUpperCase()}</span></span>
            <IconButton icon="minus" label="5 min mindre" size="sm" onClick={() => onEdit(d.id, -5)} />
            <span className="num" style={{ width: 30, textAlign: "center", fontSize: 13, color: "var(--text-primary)" }}>{d.min}</span>
            <IconButton icon="plus" label="5 min mer" size="sm" onClick={() => onEdit(d.id, 5)} />
            <IconButton icon="x" label="Fjern øvelse" size="sm" onClick={() => onRemove(d.id)} />
          </div>
        ))}
      </div>
      <div style={{ padding: 12, borderTop: "1px solid var(--border-hairline)" }}>
        <Button size="lg" fullWidth icon="plus" onClick={onOpenComposer}>Legg til øvelse</Button>
      </div>
    </div>
  );
}

Object.assign(window, { YearCurve, Cascade, WeekMeter, WeekBoard, SessionPanel, volumeStatus });
})();
