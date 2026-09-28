/* Teknisk plan · delte deler for AG-10, AG-TP-01, AG-TP-02 og PH-TP-01. Skall-uavhengig: tar mob/wide som props. Farger bare som tokens. */
(() => {
const ns = () => window.AKGolfPrecisionAthletics_7d7c29;
const D = () => window.TP_DATA;
const dec = (v, d = 1) => v == null ? "—" : (v < 0 ? "−" : "") + Math.abs(v).toFixed(d).replace(".", ",");
const num = (v) => v == null ? "—" : String(v).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const frac = (a, b) => b == null ? "—" : num(a) + " / " + num(b);
const Meta = ({ children, s }) => <span style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere", ...s }}>{children}</span>;
const Label = ({ children }) => <span className="kicker">{children}</span>;
const Bar = ({ v, of, h = 6 }) => { const p = !of ? 0 : Math.max(0, Math.min(100, (v || 0) / of * 100)); return <span aria-hidden="true" style={{ display: "block", height: h, background: "var(--surface-sunken)", position: "relative", minWidth: 0 }}><span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: p + "%", background: "var(--text-primary)" }}></span></span>; };
const Formula = ({ children, big }) => <code title="AK-formelen" style={{ display: "inline-block", maxWidth: "100%", boxSizing: "border-box", font: (big ? "500 14px/1.4 " : "500 12px/1.4 ") + "var(--font-mono)", color: "var(--text-primary)", background: "var(--surface-sunken)", border: "1px solid var(--border-hairline)", borderRadius: 4, padding: big ? "6px 10px" : "2px 8px", overflowWrap: "anywhere", wordBreak: "break-all" }}>{children}</code>;
const stepLabel = (c) => c ? D().stepName(c) : "Repetisjoner";

/* Posisjonslinje: 10 celler, 2 × 5 på mobil. Ruller aldri sidelengs. Valgt = grafitt ramme. Hovedfokus = FOKUS-merke. */
function PosLine({ tasks, sel, onSel, focus, mob, status }) {
  const T = D(), cnt = (p) => tasks.filter((t) => t.pos === p).length; ns.B = ns().Button;
  const cols = mob ? "repeat(5,minmax(0,1fr))" : "repeat(10,minmax(0,1fr))";
  return <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
    {!mob && <div aria-hidden="true" style={{ display: "grid", gridTemplateColumns: cols, gap: 6 }}>{T.PHASES.map(([n, r, span]) => <span key={n} style={{ gridColumn: "span " + span, borderBottom: "1px solid var(--border-strong)", paddingBottom: 4, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "baseline" }}><span style={{ font: "600 12px/1.2 var(--font-sans)", color: "var(--text-primary)" }}>{n}</span><Meta>{r}</Meta></span>)}</div>}
    <div role="group" aria-label="Posisjoner P1.0–P10.0" style={{ display: "grid", gridTemplateColumns: cols, gap: 6 }}>
      {T.POS.map(([p, n]) => { const on = sel === p, c = cnt(p), f = focus.includes(p);
        return <button key={p} type="button" aria-pressed={on} aria-label={p + " " + n + " · " + c + (c === 1 ? " oppgave" : " oppgaver") + (f ? " · hovedfokus" : "")} onClick={() => onSel(on ? null : p)} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", minWidth: 0, minHeight: 64, padding: "8px 6px", display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-start", justifyContent: "space-between", background: "var(--surface-card)", borderRadius: "var(--radius)", border: "1px solid " + (on ? "var(--border-ink)" : "var(--border-hairline)"), boxShadow: on ? "inset 0 0 0 1px var(--border-ink)" : "none", transition: "border-color 150ms var(--ease-out), box-shadow 200ms var(--ease-out)" }}>
          <span style={{ font: "600 13px/1 var(--font-mono)", color: "var(--text-primary)" }}>{p}</span>
          <span style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap", minWidth: 0 }}><span style={{ font: "500 12px/1 var(--font-mono)", color: c ? "var(--text-primary)" : "var(--text-muted)" }}>{c || "—"}</span>{f && <span style={{ font: "600 9px/1 var(--font-mono)", letterSpacing: ".04em", color: "var(--text-inverse)", background: "var(--surface-inverse)", borderRadius: 999, padding: "2px 5px" }}>FOKUS</span>}</span>
        </button>; })}
    </div>
    {mob && <Meta>BAKSVING P1–P4 · NEDSVING P5–P7 · GJENNOMSVING P8–P10</Meta>}
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", minHeight: 44 }}>
      {sel ? <><span style={{ font: "600 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{sel} {T.POS.find((x) => x[0] === sel)[1]}</span>{status}<ns.B size="sm" variant="ghost" onClick={() => onSel(null)}>Vis alle posisjoner</ns.B></> : <Meta>ALLE POSISJONER · TRYKK EN POSISJON FOR Å FILTRERE · TALL = OPPGAVER</Meta>}
    </div>
  </div>;
}

function RepBars({ steps }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{steps.map(([c, d, g]) => <div key={c || "all"} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <span style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}><span style={{ font: "var(--type-body-s)", color: "var(--text-primary)" }}>{stepLabel(c)}</span><span style={{ font: "500 13px/1.3 var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{frac(d, g)}</span></span><Bar v={d} of={g} />
  </div>)}</div>;
}

function EnvGrid({ envs, mob }) {
  return <div style={{ display: "grid", gridTemplateColumns: mob ? "repeat(2,minmax(0,1fr))" : "repeat(4,minmax(0,1fr))", gap: 8 }}>{envs.map(([e, d, g]) => <div key={e} style={{ display: "flex", flexDirection: "column", gap: 6, padding: 10, border: "1px solid var(--border-hairline)", borderRadius: "var(--radius)", minWidth: 0 }}>
    <Meta>{e.toUpperCase()}</Meta><span style={{ font: "500 14px/1.2 var(--font-mono)", fontVariantNumeric: "tabular-nums", color: g == null ? "var(--text-muted)" : "var(--text-primary)" }}>{frac(d, g)}</span>{g != null ? <Bar v={d} of={g} h={4} /> : <Meta>IKKE I PLANEN</Meta>}
  </div>)}</div>;
}

/* TrackMan-skala: Utgangspunkt (hul ring) · Mål (målboks fra–til) · Nå (fylt prikk). Bare grafitt. */
function TMScale({ r }) {
  const vals = [r.base, r.lo, r.hi, r.now].filter((v) => v != null), mn = Math.min(...vals), mx = Math.max(...vals), pad = (mx - mn) * 0.18 || 1, a = mn - pad, b = mx + pad, x = (v) => ((v - a) / (b - a) * 100) + "%";
  const inside = r.now != null && r.now >= r.lo && r.now <= r.hi, u = r.u ? (r.u === "°" ? "°" : " " + r.u) : "";
  const { StatusPill } = ns();
  return <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 10, borderTop: "1px solid var(--border-hairline)" }}>
    <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}><span style={{ font: "600 14px/1.3 var(--font-sans)" }}>{r.k}</span>{r.now == null ? <Meta>—</Meta> : <StatusPill tone={inside ? "ok" : "neutral"}>{inside ? "Innenfor målboksen" : "Utenfor målboksen"}</StatusPill>}</span>
    <div role="img" aria-label={r.k + ": utgangspunkt " + dec(r.base, r.d) + u + ", mål " + dec(r.lo, r.d) + " til " + dec(r.hi, r.d) + u + ", nå " + dec(r.now, r.d) + u} style={{ position: "relative", height: 28, margin: "0 8px" }}>
      <span style={{ position: "absolute", left: 0, right: 0, top: 13, height: 2, background: "var(--border-hairline)" }}></span>
      <span style={{ position: "absolute", left: x(r.lo), width: "calc(" + x(r.hi) + " - " + x(r.lo) + ")", top: 4, bottom: 4, background: "var(--surface-sunken)", border: "1px solid var(--border-ink)", boxSizing: "border-box" }}></span>
      {r.base != null && <span style={{ position: "absolute", left: x(r.base), top: 8, width: 12, height: 12, marginLeft: -6, borderRadius: 999, border: "2px solid var(--text-secondary)", background: "var(--surface-card)", boxSizing: "border-box" }}></span>}
      {r.now != null && <span style={{ position: "absolute", left: x(r.now), top: 6, width: 16, height: 16, marginLeft: -8, borderRadius: 999, background: "var(--text-primary)", boxShadow: "0 0 0 2px var(--surface-card)" }}></span>}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,120px),1fr))", gap: 8 }}>
      <span style={{ display: "flex", gap: 6, alignItems: "center" }}><span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 999, border: "2px solid var(--text-secondary)", flex: "none" }}></span><span style={{ display: "flex", flexDirection: "column" }}><Meta>UTGANGSPUNKT</Meta><span style={{ font: "500 13px/1.3 var(--font-mono)" }}>{dec(r.base, r.d)}{r.base != null ? u : ""}</span></span></span>
      <span style={{ display: "flex", gap: 6, alignItems: "center" }}><span aria-hidden="true" style={{ width: 14, height: 10, border: "1px solid var(--border-ink)", background: "var(--surface-sunken)", flex: "none" }}></span><span style={{ display: "flex", flexDirection: "column" }}><Meta>MÅLBOKS</Meta><span style={{ font: "500 13px/1.3 var(--font-mono)" }}>{dec(r.lo, r.d)} til {dec(r.hi, r.d)}{u}</span></span></span>
      <span style={{ display: "flex", gap: 6, alignItems: "center" }}><span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 999, background: "var(--text-primary)", flex: "none" }}></span><span style={{ display: "flex", flexDirection: "column" }}><Meta>MÅLING NÅ</Meta><span style={{ font: "500 13px/1.3 var(--font-mono)" }}>{dec(r.now, r.d)}{r.now != null ? u : ""}</span></span></span>
    </div>
  </div>;
}
function TMBlock({ task }) {
  const T = D(), radar = T.RADAR.includes(task.gear), tm = task.tm;
  if (!radar) return <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><Label>Måleutstyr</Label><Meta>{task.gear === "Uten" ? "UTEN MÅLEUTSTYR · INGEN TRACKMAN-MÅL" : "ANNET MÅLEUTSTYR · INGEN TRACKMAN-MÅL"}</Meta></div>;
  return <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <Label>TrackMan-mål · {tm ? tm.rows.length : 0}</Label>
    {!tm || !tm.rows.length ? <><span style={{ font: "500 14px/1.3 var(--font-mono)" }}>—</span><span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen TrackMan-økt registrert.</span></> : <>
      {tm.rows.map((r) => <TMScale key={r.k} r={r} />)}
      <Meta>{tm.club.toUpperCase()} · n = {tm.n} SLAG · {tm.src.toUpperCase()} · {tm.date} · UTGANGSPUNKT {tm.base}</Meta>
    </>}
  </div>;
}
const protoNow = (p) => p.type === "rullende" ? p.now + " av " + p.shots : p.type === "beste" ? "beste serie " + p.now + " av " + p.shots : p.type === "streak" ? "lengste rekke " + p.now : p.now + " av " + p.shots + " økter";
function Protocol({ p }) {
  const T = D();
  return <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <Label>Treffprotokoll · {p ? T.PROTO[p.type] : "—"}</Label>
    {p ? <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}><span style={{ font: "500 14px/1.4 var(--font-sans)", color: "var(--text-primary)", flex: "1 1 220px", textWrap: "pretty" }}>{T.protoText(p)}</span><span style={{ font: "600 14px/1.3 var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>Nå {protoNow(p)}</span></div> : <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen treffprotokoll på denne oppgaven.</span>}
  </div>;
}
function QualityCheck({ qc, onStart }) {
  const { Button } = ns();
  return <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <Label>Kvalitetssjekk</Label>
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}><span style={{ font: "600 14px/1.3 var(--font-mono)", fontVariantNumeric: "tabular-nums", flex: "1 1 200px" }}>{qc ? qc.hits + " av " + qc.of + " · " + qc.date + " · " + qc.src : "—"}</span>{onStart && <Button size="sm" variant="secondary" icon="list-checks" onClick={onStart}>Ny kvalitetssjekk</Button>}</div>
    <Meta>{qc ? "VISER STATUS · LÅSER IKKE NESTE LÆRINGSSTEG" : "INGEN KVALITETSSJEKK REGISTRERT · LÅSER IKKE NESTE LÆRINGSSTEG"}</Meta>
  </div>;
}

/* Kvalitetssjekk: registrer en serie som innenfor/utenfor målboksen. Avbrutt serie gir ikke resultat. */
function QCSheet({ open, task, onClose, onSave, outdoor, toast }) {
  const { Sheet, Button, Stepper } = ns();
  const [n, setN] = React.useState(10), [s, setS] = React.useState([]);
  React.useEffect(() => { if (open) { setS([]); setN(10); } }, [open]);
  if (!task) return null;
  const hits = s.filter(Boolean).length, full = s.length >= n, sz = outdoor ? "xl" : "lg";
  const abort = () => { onClose(); if (s.length) toast("Serien er avbrutt", "INGEN RESULTAT LAGRET · " + s.length + " AV " + n + " SLAG VAR REGISTRERT"); };
  return <Sheet open={open} onClose={abort} kicker={"Kvalitetssjekk · " + task.pos} title={task.title} footer={<><Button fullWidth icon="check" disabled={!full} onClick={() => { onSave({ hits, of: n }); }}>{full ? "Lagre " + hits + " av " + n : "Registrer " + (n - s.length) + " slag til"}</Button><Button variant="ghost" fullWidth onClick={abort}>Avbryt serien</Button></>}>
    <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>Trykk for hvert slag om det landet innenfor eller utenfor målboksen. Resultatet vises bare. Det låser ikke neste læringssteg.</p>
    <Stepper label="Slag i serien" value={n} min={5} max={30} step={5} onChange={(v) => setN(Math.max(v, s.length))} size={outdoor ? "xl" : "md"} />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8 }}><Button size={sz} variant="secondary" icon="check" disabled={full} onClick={() => setS((l) => [...l, true])}>Innenfor</Button><Button size={sz} variant="secondary" icon="x" disabled={full} onClick={() => setS((l) => [...l, false])}>Utenfor</Button></div>
    <div aria-live="polite" style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}><span style={{ font: "600 15px/1.3 var(--font-mono)", flex: "1 1 auto" }}>{s.length} av {n} registrert · {hits} innenfor</span>{s.length > 0 && <Button size="sm" variant="ghost" icon="undo-2" onClick={() => setS((l) => l.slice(0, -1))}>Angre siste</Button>}</div>
    <div aria-hidden="true" style={{ display: "grid", gridTemplateColumns: "repeat(10,minmax(0,1fr))", gap: 4 }}>{Array.from({ length: n }, (_, i) => <span key={i} style={{ height: 8, background: i < s.length ? (s[i] ? "var(--text-primary)" : "var(--border-strong)") : "var(--surface-sunken)" }}></span>)}</div>
    <Meta>{(task.tm ? task.tm.src : "MANUELT").toUpperCase()} · 27.09.2026</Meta>
  </Sheet>;
}

/* Før og nå: to daterte bilder. Side om side, eller én ramme med delelinje (dra, piltaster, eller knapper). */
function Frame({ which, data, pos, onUpload }) {
  const { Button } = ns();
  if (!data) return <div style={{ aspectRatio: "4 / 5", minWidth: 0, border: "1px dashed var(--border-control)", borderRadius: "var(--radius)", display: "flex", flexDirection: "column", gap: 10, alignItems: "center", justifyContent: "center", padding: 12, textAlign: "center", boxSizing: "border-box" }}><Meta>{which.toUpperCase()} · {pos}</Meta><span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen bilde registrert</span>{onUpload && <Button size="sm" variant="secondary" icon="upload" onClick={onUpload}>Last opp bilde</Button>}</div>;
  return <div style={{ aspectRatio: "4 / 5", minWidth: 0, position: "relative", background: "var(--surface-sunken)", borderRadius: "var(--radius)", outline: "1px solid var(--border-hairline)", outlineOffset: -1, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <Meta>BILDE · {pos}</Meta>
    <span style={{ position: "absolute", left: 8, bottom: 8, font: "600 11px/1 var(--font-mono)", letterSpacing: ".04em", background: "var(--surface-card)", color: "var(--text-primary)", border: "1px solid var(--border-hairline)", borderRadius: 999, padding: "5px 8px" }}>{which.toUpperCase()} · {data.date}</span>
  </div>;
}
function BeforeAfter({ img, pos, mob, onUpload }) {
  const { Segmented, Button } = ns();
  const both = img && img.before && img.now, [mode, setMode] = React.useState("side"), [x, setX] = React.useState(50), ref = React.useRef(null), drag = React.useRef(false);
  const m = both ? mode : "side";
  const at = (cx) => { const r = ref.current.getBoundingClientRect(); setX(Math.round(Math.max(0, Math.min(100, (cx - r.left) / r.width * 100)))); };
  const key = (e) => { const k = e.key; if (k === "ArrowLeft" || k === "ArrowDown") { setX((v) => Math.max(0, v - 5)); e.preventDefault(); } else if (k === "ArrowRight" || k === "ArrowUp") { setX((v) => Math.min(100, v + 5)); e.preventDefault(); } else if (k === "Home") { setX(0); e.preventDefault(); } else if (k === "End") { setX(100); e.preventDefault(); } };
  return <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}><Segmented options={[{ value: "side", label: "Side om side" }, { value: "split", label: "Før og nå" }]} value={m} onChange={(v) => both && setMode(v)} />{!both && <Meta>FØR OG NÅ KREVER TO BILDER</Meta>}</div>
    {m === "side" ? <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: mob ? 8 : 12, maxWidth: 720 }}><Frame which="Før" data={img && img.before} pos={pos} onUpload={onUpload} /><Frame which="Nå" data={img && img.now} pos={pos} onUpload={onUpload} /></div> : <>
      <div ref={ref} onPointerDown={(e) => { drag.current = true; e.currentTarget.setPointerCapture(e.pointerId); at(e.clientX); }} onPointerMove={(e) => drag.current && at(e.clientX)} onPointerUp={() => { drag.current = false; }} style={{ position: "relative", maxWidth: 480, width: "100%", touchAction: "none", cursor: "ew-resize", userSelect: "none" }}>
        <Frame which="Før" data={img.before} pos={pos} />
        <div style={{ position: "absolute", inset: 0, clipPath: "inset(0 0 0 " + x + "%)" }}><Frame which="Nå" data={img.now} pos={pos} /></div>
        <span aria-hidden="true" style={{ position: "absolute", top: 0, bottom: 0, left: x + "%", width: 2, marginLeft: -1, background: "var(--text-primary)" }}></span>
        <span role="slider" tabIndex={0} aria-label="Delelinje mellom før og nå" aria-valuemin={0} aria-valuemax={100} aria-valuenow={x} aria-valuetext={x + " % før"} onKeyDown={key} style={{ position: "absolute", top: "50%", left: x + "%", width: 44, height: 44, marginLeft: -22, marginTop: -22, borderRadius: 999, background: "var(--surface-card)", border: "1px solid var(--border-ink)", boxShadow: "var(--shadow-pop)", display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}><window.AKGolfPrecisionAthletics_7d7c29.Icon name="chevrons-left-right" size={18} /></span>
      </div>
      <div role="group" aria-label="Vis uten å dra" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Button size="sm" variant="secondary" onClick={() => setX(100)}>Bare før</Button><Button size="sm" variant="secondary" onClick={() => setX(50)}>Midt</Button><Button size="sm" variant="secondary" onClick={() => setX(0)}>Bare nå</Button><Meta s={{ alignSelf: "center" }}>PILTASTER FLYTTER 5 %</Meta></div>
    </>}
    {img && img.note ? <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: 10, borderTop: "1px solid var(--border-hairline)" }}><Label>Notat fra coach</Label><p style={{ margin: 0, font: "var(--type-body)", color: "var(--text-body)", textWrap: "pretty" }}>{img.note}</p><Meta>{img.noteBy.toUpperCase()} · {img.noteDate}</Meta></div> : <Meta>INGEN NOTAT FRA COACH</Meta>}
  </div>;
}

/* Oppgavekort. actions = knapper nederst. open = detaljer vist. */
function TaskCard({ t, mob, wide, open, onToggle, actions, onQC, stripe }) {
  const T = D(), { StatusPill, Button, KeyValue } = ns(), [d, g] = T.sum(t);
  return <div className="pa-card" style={{ padding: 16, gap: 14, minWidth: 0, position: "relative", overflow: "hidden" }}>
    <span aria-hidden="true" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: "var(--axis-tek)" }}></span>
    <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}><span style={{ font: "600 13px/1 var(--font-mono)" }}>{t.pos}</span><span style={{ font: "600 15px/1.3 var(--font-sans)", flex: "1 1 200px", minWidth: 0 }}>{t.title}</span><StatusPill tone="info">{t.status}</StatusPill></div>
    <KeyValue columns={mob ? 1 : 3} items={[["Slag", t.shot, { mono: false }], ["Område", t.area, { mono: false }], ["Teknisk fokus", t.focus, { mono: false }]]} />
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}><Formula>{T.formula(t)}</Formula><Meta>AK-FORMELEN</Meta></div>
    {!open ? <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}><span style={{ flex: "1 1 180px", display: "flex", flexDirection: "column", gap: 4 }}><span style={{ font: "500 13px/1.3 var(--font-mono)" }}>{frac(d, g)} repetisjoner</span><Bar v={d} of={g} /></span><Meta>{t.proto ? "PROTOKOLL NÅ " + protoNow(t.proto).toUpperCase() : "INGEN PROTOKOLL"}{t.qc ? " · SJEKK " + t.qc.hits + " AV " + t.qc.of : ""}</Meta>{onToggle && <Button size="sm" variant="ghost" iconRight="chevron-down" onClick={onToggle}>Vis detaljer</Button>}</div> : <>
      <div style={{ display: "grid", gridTemplateColumns: wide ? "minmax(0,1fr) minmax(0,1fr)" : "minmax(0,1fr)", gap: wide ? 24 : 18, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          <Label>{t.steps.length > 1 ? "Repetisjoner per læringssteg" : "Repetisjoner"}</Label><RepBars steps={t.steps} />
          <Label>Fordeling per miljø</Label><EnvGrid envs={t.envs} mob={mob} />
          <Meta>KILDE {t.src}</Meta>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}><TMBlock task={t} /><Protocol p={t.proto} /><QualityCheck qc={t.qc} onStart={onQC} /></div>
      </div>
      {onToggle && <div><Button size="sm" variant="ghost" iconRight="chevron-up" onClick={onToggle}>Skjul detaljer</Button></div>}
    </>}
    {actions && <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 12, borderTop: "1px solid var(--border-hairline)" }}>{actions}</div>}
  </div>;
}

function Summary({ plan, done, goal, mob, extra }) {
  const { StatusPill } = ns();
  const cell = (k, v) => <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}><Meta>{k}</Meta>{v}</div>;
  return <div className="pa-card" style={{ padding: 16, gap: 12 }}>
    <div style={{ display: "grid", gridTemplateColumns: mob ? "minmax(0,1fr)" : "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
      {cell("PLANSTATUS", <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><StatusPill tone="ok">{plan.status}</StatusPill><span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Publisert {plan.pub}</span></span>)}
      {cell("HOVEDFOKUS", <span style={{ font: "600 15px/1.3 var(--font-mono)" }}>{plan.focus.join(" · ")}</span>)}
      {cell("SAMLET FREMDRIFT", <span style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={{ font: "600 15px/1.3 var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{frac(done, goal)} repetisjoner</span><Bar v={done} of={goal} /></span>)}
      {extra}
    </div>
    <Meta>KILDE {plan.src} · SIST REGISTRERT {plan.date}</Meta>
  </div>;
}

window.TP = { ns, dec, num, frac, Meta, Label, Bar, Formula, PosLine, RepBars, EnvGrid, TMScale, TMBlock, Protocol, protoNow, QualityCheck, QCSheet, Frame, BeforeAfter, TaskCard, Summary, stepLabel };
})();
