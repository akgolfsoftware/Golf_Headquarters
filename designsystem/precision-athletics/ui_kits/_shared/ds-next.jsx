/* GENERERT fra components/interaction og components/analysis 27.09.2026.
   Brukes bare til katalogene står i _ds_bundle.js. Ingen effekt når bundelen har komponentene. */
(() => {
const NS = window.AKGolfPrecisionAthletics_7d7c29;
if (NS.SortableList && NS.InsightCard) return;
const { Button, Icon, Sheet, Dialog, Toast, Segmented, ChoicePill, StatusPill, DataTable } = NS;

/** Tilbake til forrige kontekst. Viser hvor man kommer fra, ikke bare «Hjem». */
function BackBar({ to, label = "Tilbake", onBack, trail, actions, className }) {
  const btn = { all: "unset", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44, padding: "0 12px 0 4px", borderRadius: 8, font: "500 14px/1.2 var(--font-sans)", color: "var(--text-primary)" };
  return <nav aria-label="Tilbake og plassering" className={className} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", minWidth: 0 }}>
    <button type="button" onClick={onBack} style={btn} aria-label={to ? label + " til " + to : label}><Icon name="arrow-left" size={18} /><span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60vw" }}>{to || label}</span></button>
    {trail && trail.length > 0 && <ol style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: 0, padding: 0, listStyle: "none", font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)", flex: "1 1 200px", minWidth: 0 }}>{trail.map((t, i) => <li key={i} style={{ display: "inline-flex", gap: 6, alignItems: "center", minWidth: 0 }}>{i > 0 && <span aria-hidden="true">/</span>}{t.onClick ? <button type="button" onClick={t.onClick} style={{ all: "unset", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>{t.label}</button> : <span aria-current="page">{t.label}</span>}</li>)}</ol>}
    {actions && <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginLeft: "auto" }}>{actions}</div>}
  </nav>;
}

const ActionBar_STATUS = { saving: "LAGRER …", saved: "LAGRET", error: "KUNNE IKKE LAGRE · TALLENE ER BEHOLDT", dirty: "ULAGREDE ENDRINGER", conflict: "KONFLIKT · NOEN ANDRE HAR ENDRET" };
/** Primærhandling og sekundære handlinger. sticky=true legger den nederst på mobil. */
function ActionBar({ primary, secondary, destructive, status, statusMeta, sticky = false, className }) {
  const s = status && status !== "idle" ? ActionBar_STATUS[status] + (statusMeta ? " · " + statusMeta : "") : null;
  const tone = status === "error" || status === "conflict" ? "var(--signal-ink)" : "var(--text-muted)";
  return <div role="group" aria-label="Handlinger" className={[sticky && "pa-actionbar--sticky", className].filter(Boolean).join(" ") || undefined} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", minWidth: 0, ...(sticky ? { position: "sticky", bottom: 0, zIndex: 6, background: "var(--surface-page)", borderTop: "1px solid var(--border-hairline)", padding: "12px 16px calc(12px + env(safe-area-inset-bottom))", margin: "0 -16px" } : null) }}>
    {s && <span key={status} className="pa-swap" role="status" aria-live="polite" style={{ flex: "1 1 100%", font: "var(--type-meta)", letterSpacing: ".04em", color: tone }}>{s}</span>}
    {destructive && <div style={{ marginRight: "auto", display: "flex", gap: 8 }}>{destructive}</div>}
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginLeft: destructive ? 0 : "auto", flex: sticky ? "1 1 100%" : "0 1 auto", justifyContent: "flex-end" }}>{secondary}{primary}</div>
  </div>;
}

/** Bekreftelse før destruktive handlinger, publisering og bortnavigering med ulagrede endringer. */
function ConfirmDialog({ open, kind = "destructive", title, children, consequences, confirmLabel, cancelLabel, onConfirm, onCancel, onSecondary, secondaryLabel, busy }) {
  if (!open) return null;
  const unsaved = kind === "unsaved";
  const conf = confirmLabel || (unsaved ? "Lagre og gå videre" : kind === "publish" ? "Publiser" : "Slett");
  return <Dialog open title={title || (unsaved ? "Du har ulagrede endringer" : "Er du sikker?")} onClose={onCancel} footer={<>
    <Button variant="ghost" onClick={onCancel}>{cancelLabel || (unsaved ? "Fortsett å redigere" : "Avbryt")}</Button>
    {(unsaved || onSecondary) && <Button variant="secondary" onClick={onSecondary}>{secondaryLabel || "Forkast endringer"}</Button>}
    <Button variant={kind === "destructive" ? "signal" : "primary"} loading={busy} loadingText={kind === "publish" ? "Publiserer …" : "Lagrer …"} onClick={onConfirm}>{conf}</Button>
  </>}>
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {children && <div style={{ font: "var(--type-body)", color: "var(--text-primary)", textWrap: "pretty" }}>{children}</div>}
      {consequences && consequences.length > 0 && <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{consequences.map((c) => <li key={c}>{c}</li>)}</ul>}
    </div>
  </Dialog>;
}

/** Etter flytt, slett, publiser, dupliser, legg til og avvis. Angre i 8 sekunder. */
function UndoToast({ open, message, meta, onUndo, onClose, duration = 8000, inline }) {
  React.useEffect(() => { if (!open || !onClose) return; const t = setTimeout(onClose, duration); return () => clearTimeout(t); }, [open, duration, onClose]);
  if (!open) return null;
  const pos = inline ? {} : { position: "fixed", left: "50%", transform: "translateX(-50%)", zIndex: 60, width: "min(420px, calc(100% - 32px))" };
  return <div className={inline ? undefined : "pa-undo"} style={pos}><Toast meta={meta} action={onUndo ? "Angre" : undefined} onAction={onUndo}>{message}</Toast></div>;
}

/** Sortering med tre likeverdige veier: dra håndtaket (mus), tastatur (Mellomrom, piler, Mellomrom) og «Flytt»-knapp (mobil → MoveSheet). */
function SortableList({ items, renderItem, onReorder, onMove, label = "Liste", locked = [], disabled, dragType = "application/x-ak-sort" }) {
  const [drag, setDrag] = React.useState(null), [over, setOver] = React.useState(null), [lift, setLift] = React.useState(null), [say, setSay] = React.useState("");
  const idx = (id) => items.findIndex((x) => x.id === id);
  const move = (from, to) => { if (from < 0 || from === to || to < 0 || to >= items.length) return; const ids = items.map((x) => x.id); const [m] = ids.splice(from, 1); ids.splice(to, 0, m); onReorder && onReorder(ids, { from, to }); };
  const key = (e, it) => { if (disabled || locked.includes(it.id)) return; const i = idx(it.id);
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (lift === it.id) { setLift(null); setSay(label + ": sluppet på plass " + (i + 1) + " av " + items.length); } else { setLift(it.id); setSay("Løftet. Bruk piltastene, Mellomrom for å slippe, Escape for å avbryte."); } }
    else if (lift === it.id && (e.key === "ArrowUp" || e.key === "ArrowDown")) { e.preventDefault(); const to = i + (e.key === "ArrowUp" ? -1 : 1); if (to >= 0 && to < items.length && !locked.includes(items[to].id)) { move(i, to); setSay("Plass " + (to + 1) + " av " + items.length); } }
    else if (e.key === "Escape" && lift) { setLift(null); setSay("Avbrutt"); } };
  return <div role="list" aria-label={label} style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
    {items.map((it, i) => { const isLocked = locked.includes(it.id), dragging = drag === it.id, lifted = lift === it.id;
      const handle = disabled || isLocked ? { disabled: true, "aria-disabled": true, style: { visibility: isLocked ? "visible" : "hidden" } } : {
        draggable: true, onDragStart: (e) => { e.dataTransfer.setData(dragType, it.id); e.dataTransfer.effectAllowed = "move"; setDrag(it.id); }, onDragEnd: () => { setDrag(null); setOver(null); },
        onKeyDown: (e) => key(e, it), "aria-pressed": lifted, "aria-roledescription": "sorterbar", "aria-label": "Flytt " + (it.label || "element") + ", plass " + (i + 1) + " av " + items.length };
      return <div role="listitem" key={it.id}
        onDragOver={(e) => { if (drag && !isLocked) { e.preventDefault(); setOver(i); } }}
        onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData(dragType); if (id) move(idx(id), i); setDrag(null); setOver(null); setSay("Flyttet til plass " + (i + 1)); }}
        style={{ position: "relative", opacity: dragging ? 0.45 : 1, outline: lifted ? "2px solid var(--border-ink)" : "none", outlineOffset: 2, borderRadius: "var(--radius-inner)" }}>
        {over === i && drag && drag !== it.id && <span aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, top: idx(drag) < i ? "auto" : -2, bottom: idx(drag) < i ? -2 : "auto", height: 2, background: "var(--primary)" }} />}
        {renderItem(it, { index: i, dragging, lifted, locked: isLocked,
          handle: <button type="button" {...handle} title={isLocked ? "Låst av coach" : "Dra, eller trykk Mellomrom og bruk piltastene"} style={{ all: "unset", cursor: isLocked ? "not-allowed" : "grab", width: 44, height: 44, display: "grid", placeItems: "center", borderRadius: 8, color: "var(--text-muted)", flexShrink: 0, ...(handle.style || {}) }}><Icon name={isLocked ? "lock" : "grip-vertical"} size={18} /></button>,
          moveButton: onMove && !isLocked && !disabled ? <button type="button" onClick={() => onMove(it)} aria-label={"Flytt " + (it.label || "")} style={{ all: "unset", cursor: "pointer", minHeight: 44, padding: "0 10px", display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 8, font: "500 13px/1 var(--font-sans)", color: "var(--text-primary)" }}><Icon name="move" size={16} />Flytt</button> : null })}
      </div>; })}
    <span aria-live="assertive" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{say}</span>
  </div>;
}

/** Mål for slipp. Viser aktiv, over og ugyldig. Alltid med knapp-alternativ ved siden av. */
function DropZone({ label, hint, onDrop, accept = ["application/x-ak-drag"], valid = true, reason, children, empty, minHeight = 56 }) {
  const [over, setOver] = React.useState(false);
  const ok = (e) => accept.some((t) => e.dataTransfer.types.includes(t));
  const st = over ? (valid ? "over" : "invalid") : "idle";
  const bd = st === "over" ? "2px solid var(--border-ink)" : st === "invalid" ? "2px dashed var(--signal)" : "1px dashed var(--border-strong)";
  return <div role="group" aria-label={label} data-drop={st}
    onDragOver={(e) => { if (ok(e)) { e.preventDefault(); e.dataTransfer.dropEffect = valid ? "move" : "none"; setOver(true); } }}
    onDragLeave={() => setOver(false)}
    onDrop={(e) => { e.preventDefault(); setOver(false); if (!valid) return; const t = accept.find((x) => e.dataTransfer.types.includes(x)); onDrop && onDrop(e.dataTransfer.getData(t), e); }}
    style={{ border: children && st === "idle" ? "1px solid transparent" : bd, borderRadius: 8, minHeight, padding: 8, display: "flex", flexDirection: "column", gap: 8, background: st === "over" ? "var(--surface-hover)" : "transparent", minWidth: 0, boxSizing: "border-box", transition: "background-color var(--dur-fast) var(--ease-color), border-color var(--dur-fast) var(--ease-color)" }}>
    {children}
    {(!children || st !== "idle") && <span style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: st === "invalid" ? "var(--signal-ink)" : "var(--text-muted)", textAlign: "center", padding: "8px 4px" }}>{st === "invalid" ? (reason || "KAN IKKE SLIPPES HER") : st === "over" ? "SLIPP FOR Å LEGGE TIL" : (empty || hint || "DRA HIT")}</span>}
  </div>;
}

/** Ikke-dra-alternativet: velg mål i en liste. Mobil og tastatur. */
function MoveSheet({ open, onClose, title, item, targets = [], value, onChange, scope, scopeValue, onScope, note, onConfirm, confirmLabel = "Flytt" }) {
  return <Sheet open={open} onClose={onClose} kicker={"Flytt · " + (item || "")} title={title || "Velg ny plass"} footer={<><Button fullWidth icon="move" disabled={!value} onClick={onConfirm}>{confirmLabel}</Button><Button variant="ghost" fullWidth onClick={onClose}>Avbryt</Button></>}>
    {scope && <Segmented options={scope} value={scopeValue} onChange={onScope} fullWidth />}
    <div role="radiogroup" aria-label="Mål" style={{ display: "flex", flexDirection: "column", gap: 4 }}>{targets.map((t) => { const on = value === t.id;
      return <button key={t.id} type="button" role="radio" aria-checked={on} disabled={t.disabled} onClick={() => onChange && onChange(t.id)} style={{ all: "unset", cursor: t.disabled ? "not-allowed" : "pointer", display: "flex", gap: 12, alignItems: "center", minHeight: 52, padding: "8px 12px", borderRadius: 8, border: on ? "2px solid var(--border-ink)" : "1px solid var(--border-hairline)", opacity: t.disabled ? 0.55 : 1, boxSizing: "border-box" }}>
        <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}><span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{t.label}</span>{(t.meta || t.reason) && <span style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: t.warn ? "var(--signal-ink)" : "var(--text-muted)" }}>{t.reason || t.meta}</span>}</span>
      </button>; })}</div>
    {note && <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>{note}</p>}
  </Sheet>;
}

const ConflictSheet_ICON = { kalender: "calendar-x", volum: "bar-chart-3", belastning: "activity", tilgang: "lock", versjon: "git-compare" };
/** Når et slipp eller en flytting kolliderer. Viser hva som kolliderer og lar brukeren velge. */
function ConflictSheet({ open, onClose, title = "Flyttingen gir konflikt", conflicts = [], options = [], onResolve }) {
  return <Sheet open={open} onClose={onClose} kicker="Konflikt" title={title} footer={<>{options.map((o, i) => <Button key={o.id} variant={i === 0 ? "primary" : "secondary"} fullWidth onClick={() => onResolve && onResolve(o.id)}>{o.label}</Button>)}<Button variant="ghost" fullWidth onClick={onClose}>Avbryt</Button></>}>
    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>{conflicts.map((c, i) => <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: 12, borderRadius: 8, background: "var(--warn-tint)" }}>
      <Icon name={ConflictSheet_ICON[c.kind] || "triangle-alert"} size={18} />
      <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}><span style={{ font: "500 14px/1.35 var(--font-sans)", color: "var(--text-primary)", textWrap: "pretty" }}>{c.text}</span>{c.meta && <span style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-secondary)" }}>{c.meta}</span>}</span>
    </li>)}</ul>
    {options.some((o) => o.description) && <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>{options.filter((o) => o.description).map((o) => <div key={o.id}><dt style={{ font: "600 13px/1.3 var(--font-sans)" }}>{o.label}</dt><dd style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{o.description}</dd></div>)}</dl>}
  </Sheet>;
}

const SourceBadge_ICON = { trackman: "radar", golfbox: "flag", manuell: "pencil", annen_app: "smartphone", okt: "dumbbell", test: "clipboard-check", caddie: "sparkles", coach: "user-round", datagolf: "globe" };
/** Kilde · dato · antall observasjoner i mono. ESTIMAT merkes alltid. */
function SourceBadge({ source, kind, date, n, unit, est, period }) {
  const parts = [source, period, date, n != null ? n + (unit ? " " + unit : "") : null].filter(Boolean);
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap", font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)", textTransform: "uppercase", minWidth: 0 }}>
    {kind && <Icon name={SourceBadge_ICON[kind] || "database"} size={12} />}
    <span>{parts.length ? parts.join(" · ") : "KILDE MANGLER"}</span>
    {est && <span style={{ padding: "1px 6px", border: "1px dashed var(--border-strong)", borderRadius: 4, color: "var(--text-secondary)" }}>ESTIMAT</span>}
  </span>;
}

const DataQualityBadge_L = { god: ["ok", "God dekning"], tynn: ["warn", "Tynt grunnlag"], mangler: ["neutral", "Mangler data"], utdatert: ["warn", "Utdatert"], manuell: ["info", "Manuelt lagt inn"] };
/** Sier om tallet tåler en konklusjon. Tynt grunnlag = ingen «forbedring». */
function DataQualityBadge({ level = "god", have, need, unit, age }) {
  const [tone, label] = DataQualityBadge_L[level] || DataQualityBadge_L.god;
  const detail = level === "utdatert" && age ? age : have != null && need != null ? have + " av " + need + (unit ? " " + unit : "") : have != null ? have + (unit ? " " + unit : "") : null;
  return <StatusPill tone={tone}>{label}{detail ? " · " + detail : ""}</StatusPill>;
}

/** Periode og sammenligning. Sammenligning er alltid valgfri. */
function PeriodSelector({ value, onChange, options = ["4 uker", "8 uker", "Periode", "Sesong"], compare, onCompare, compareOptions = ["Ingen", "Forrige periode", "Samme tid i fjor", "Mål"], label = "Periode" }) {
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", minWidth: 0 }}>
    <div role="group" aria-label={label} style={{ maxWidth: "100%" }}><Segmented options={options} value={value} onChange={onChange} /></div>
    {onCompare && <label style={{ display: "inline-flex", alignItems: "center", gap: 8, font: "var(--type-body-s)", color: "var(--text-secondary)", flexWrap: "wrap" }}>Sammenlign med
      <span className="pa-control pa-select" style={{ minWidth: 0 }}><select value={compare} onChange={(e) => onCompare(e.target.value)} aria-label="Sammenlign med">{compareOptions.map((o) => <option key={o}>{o}</option>)}</select></span>
    </label>}
  </div>;
}

/** Filtre som bryter linje. «Alle» nullstiller. */
function FilterChips({ options, value = [], onChange, allLabel = "Alle", label = "Filter", single }) {
  const all = !value.length;
  const tog = (v) => { if (single) return onChange([v]); onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]); };
  return <div role="group" aria-label={label} style={{ display: "flex", flexWrap: "wrap", gap: 8, minWidth: 0 }}>
    {allLabel && <ChoicePill selected={all} onClick={() => onChange([])}>{allLabel}</ChoicePill>}
    {options.map((o) => { const v = typeof o === "string" ? o : o.value, l = typeof o === "string" ? o : o.label; return <ChoicePill key={v} axis={o.axis} selected={value.includes(v)} onClick={() => tog(v)}>{l}</ChoicePill>; })}
  </div>;
}

const InsightCard_K = { haster: ["signal", "Haster"], trend: ["neutral", "Trend"], mal: ["info", "Mål"], datamangel: ["neutral", "Datamangel"], stabil: ["ok", "Stabilt"] };
/** Innsikt → tiltak. Årsak, evidens, anbefaling og minst én handling. */
function InsightCard({ kind = "trend", title, cause, evidence = [], recommendation, source, quality, actions = [], onEvidence, draft }) {
  const [tone, lbl] = InsightCard_K[kind] || InsightCard_K.trend;
  return <article className="pa-card" style={{ padding: 16, gap: 12, minWidth: 0 }}>
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><StatusPill tone={tone}>{lbl}</StatusPill>{quality && <DataQualityBadge {...quality} />}{draft && <StatusPill tone="neutral">Utkast fra Caddie</StatusPill>}</div>
    <h3 style={{ margin: 0, font: "var(--type-title-s)", color: "var(--text-primary)", textWrap: "pretty" }}>{title}</h3>
    {cause && <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>{cause}</p>}
    {evidence.length > 0 && <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,140px),1fr))", gap: 8 }}>{evidence.map(([l, v]) => <div key={l} style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}><dt style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)", textTransform: "uppercase" }}>{l}</dt><dd style={{ margin: 0, font: "var(--type-num)", fontVariantNumeric: "tabular-nums", color: "var(--text-primary)" }}>{v == null || v === "" ? "—" : v}</dd></div>)}</dl>}
    {recommendation && <p style={{ margin: 0, font: "500 14px/1.45 var(--font-sans)", color: "var(--text-primary)", textWrap: "pretty" }}>{recommendation}</p>}
    <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 12, marginTop: "auto", borderTop: "1px solid var(--border-hairline)" }}>{source && <SourceBadge {...source} />}
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{actions.map((a, i) => <Button key={a.label} size="sm" variant={a.primary ? "primary" : "secondary"} icon={a.icon} onClick={a.onClick}>{a.label}</Button>)}{onEvidence && <Button size="sm" variant="ghost" icon="list-tree" onClick={onEvidence}>Se grunnlaget</Button>}</div></div>
  </article>;
}

/** Tallene bak en innsikt: verdi, kilde, dato, n, usikkerhet og hva som mangler. */
function EvidenceDrawer({ open, onClose, title, rows = [], uncertainty, missing = [], method }) {
  const m = { font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)", textTransform: "uppercase" };
  return <Sheet open={open} onClose={onClose} kicker="Grunnlag" title={title}>
    <table style={{ width: "100%", borderCollapse: "collapse", font: "var(--type-body-s)" }}><caption style={{ ...m, textAlign: "left", paddingBottom: 6 }}>Tall og kilder</caption><tbody>{rows.map((r) => <tr key={r.label} style={{ borderTop: "1px solid var(--border-hairline)" }}>
      <th scope="row" style={{ textAlign: "left", fontWeight: 500, padding: "8px 8px 8px 0", verticalAlign: "top" }}>{r.label}<div style={m}>{[r.source, r.date, r.n != null ? "n=" + r.n : null].filter(Boolean).join(" · ") || "KILDE MANGLER"}</div></th>
      <td style={{ textAlign: "right", font: "var(--type-num)", fontVariantNumeric: "tabular-nums", padding: "8px 0", verticalAlign: "top" }}>{r.value == null || r.value === "" ? "—" : r.value}</td></tr>)}</tbody></table>
    {uncertainty && <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}><b>Usikkerhet:</b> {uncertainty}</p>}
    {method && <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}><b>Slik er det regnet:</b> {method}</p>}
    {missing.length > 0 && <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><span style={m}>Mangler</span><ul style={{ margin: 0, paddingLeft: 18, font: "var(--type-body-s)" }}>{missing.map((x) => <li key={x}>{x}</li>)}</ul></div>}
  </Sheet>;
}

/** Ikke nok data: sier hvor mye som finnes, hvor mye som trengs og hva man gjør nå. */
function EmptyAnalysisState({ title, have, need, unit, text, action, actionIcon = "plus", onAction, secondary, onSecondary }) {
  const pct = have != null && need ? Math.min(100, Math.round((have / need) * 100)) : null;
  return <div className="pa-card" style={{ padding: 20, gap: 12, alignItems: "flex-start", minWidth: 0 }}>
    <span style={{ width: 40, height: 40, borderRadius: "var(--radius)", display: "grid", placeItems: "center", background: "var(--surface-sunken)" }}><Icon name="chart-no-axes-column" size={20} /></span>
    <h3 style={{ margin: 0, font: "var(--type-title-s)", color: "var(--text-primary)" }}>{title}</h3>
    {text && <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>{text}</p>}
    {pct != null && <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}><div style={{ height: 6, borderRadius: "var(--radius-mark)", background: "var(--surface-sunken)", overflow: "hidden" }}><div style={{ width: pct + "%", height: "100%", background: "var(--primary)" }} /></div><span style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)" }}>{have} AV {need} {(unit || "").toUpperCase()} · {Math.max(0, need - have)} TIL FØR ANALYSEN VISES</span></div>}
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{action && <Button icon={actionIcon} onClick={onAction}>{action}</Button>}{secondary && <Button variant="ghost" onClick={onSecondary}>{secondary}</Button>}</div>
  </div>;
}

const TrendChart_fmt = (v, d = 1) => v == null ? "—" : (v > 0 ? "+" : v < 0 ? "−" : "±") + Math.abs(v).toFixed(d).replace(".", ",");
/** Linje over tid. symmetric=true: lik skala over og under null (SG). null gir brudd, ikke 0. */
function TrendChart({ series = [], labels = [], symmetric = true, zero = true, min, max, height = 160, format = TrendChart_fmt, goal, caption, unit = "" }) {
  const all = series.flatMap((s) => s.values).filter((v) => v != null);
  if (all.length < 2) return <div style={{ height, display: "grid", placeItems: "center", font: "var(--type-meta)", color: "var(--text-muted)", border: "1px dashed var(--border-strong)", borderRadius: 8 }}>— FOR FÅ MÅLINGER</div>;
  let lo = min ?? Math.min(...all, goal ?? Infinity), hi = max ?? Math.max(...all, goal ?? -Infinity);
  if (symmetric) { const m = Math.max(Math.abs(lo), Math.abs(hi)) || 1; lo = -m; hi = m; }
  const n = Math.max(...series.map((s) => s.values.length)), X = (i) => n < 2 ? 50 : (i / (n - 1)) * 100, Y = (v) => 100 - ((v - lo) / (hi - lo || 1)) * 100;
  const seg = (vals) => { const out = []; let cur = []; vals.forEach((v, i) => { if (v == null) { if (cur.length) out.push(cur); cur = []; } else cur.push([X(i), Y(v)]); }); if (cur.length) out.push(cur); return out; };
  const summary = series.map((s) => s.label + ": " + s.values.map((v, i) => (labels[i] || i + 1) + " " + format(v) + unit).join(", ")).join(". ");
  const stroke = ["var(--text-primary)", "var(--text-muted)"];
  return <figure style={{ margin: 0, display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
    <div style={{ display: "grid", gridTemplateColumns: "44px minmax(0,1fr)", gap: 6 }}>
      <div style={{ position: "relative", height, font: "var(--type-meta)", color: "var(--text-muted)", textAlign: "right" }}><span style={{ position: "absolute", right: 0, top: -6 }}>{format(hi)}</span>{zero && lo < 0 && hi > 0 && <span style={{ position: "absolute", right: 0, top: Y(0) / 100 * height - 6 }}>0</span>}<span style={{ position: "absolute", right: 0, bottom: -6 }}>{format(lo)}</span></div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={summary} style={{ width: "100%", height, display: "block", overflow: "visible" }}>
        <rect x="0" y="0" width="100" height="100" fill="none" stroke="var(--border-hairline)" vectorEffect="non-scaling-stroke" />
        {zero && lo < 0 && hi > 0 && <line x1="0" x2="100" y1={Y(0)} y2={Y(0)} stroke="var(--border-ink)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />}
        {goal != null && <line x1="0" x2="100" y1={Y(goal)} y2={Y(goal)} stroke="var(--text-secondary)" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />}
        {series.map((s, si) => seg(s.values).map((pts, k) => pts.length === 1 ? <circle key={si + "-" + k} cx={pts[0][0]} cy={pts[0][1]} r="1.2" fill={stroke[si % 2]} /> : <polyline key={si + "-" + k} points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke={stroke[si % 2]} strokeWidth="2" strokeDasharray={si ? "5 4" : undefined} vectorEffect="non-scaling-stroke" />))}
      </svg>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 4, paddingLeft: 50, font: "var(--type-meta)", color: "var(--text-muted)" }}>{labels.length > 0 && [labels[0], labels[Math.floor((labels.length - 1) / 2)], labels[labels.length - 1]].map((l, i) => <span key={i}>{l}</span>)}</div>
    {(caption || series.length > 1) && <figcaption style={{ display: "flex", gap: 12, flexWrap: "wrap", font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)" }}>{series.length > 1 && series.map((s, i) => <span key={s.label} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 16, borderTop: "2px " + (i ? "dashed" : "solid") + " " + stroke[i % 2] }} />{s.label}</span>)}{caption && <span>{caption}</span>}</figcaption>}
  </figure>;
}

const AxisVolumeBars_AX = ["fys", "tek", "slag", "spill", "turn"], LB = { fys: "FYS", tek: "TEK", slag: "SLAG", spill: "SPILL", turn: "TURN" };
/** Volum per uke fordelt på aksene, med planlagt nivå som strek. Farge = akse, ingenting annet. */
function AxisVolumeBars({ rows = [], max, unit = "min", legend = true }) {
  const hi = max || Math.max(1, ...rows.map((r) => Math.max(r.plan || 0, AxisVolumeBars_AX.reduce((s, a) => s + (r.parts?.[a] || 0), 0))));
  return <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
    {rows.map((r) => { const tot = r.parts ? AxisVolumeBars_AX.reduce((s, a) => s + (r.parts[a] || 0), 0) : null;
      return <div key={r.label} style={{ display: "grid", gridTemplateColumns: "minmax(56px,80px) minmax(0,1fr) minmax(64px,auto)", gap: 8, alignItems: "center" }}>
        <span style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-secondary)" }}>{r.label}</span>
        <div role="img" aria-label={r.label + ": " + (tot == null ? "ikke registrert" : AxisVolumeBars_AX.filter((a) => r.parts[a]).map((a) => LB[a] + " " + r.parts[a] + " " + unit).join(", ")) + (r.plan ? ". Plan " + r.plan + " " + unit : "")} style={{ position: "relative", height: 20, background: "var(--surface-sunken)", borderRadius: "var(--radius-mark)", display: "flex", overflow: "hidden" }}>
          {tot != null && AxisVolumeBars_AX.map((a) => r.parts[a] ? <span key={a} style={{ width: (r.parts[a] / hi * 100) + "%", background: "var(--axis-" + a + ")" }} /> : null)}
          {r.plan != null && <span aria-hidden="true" style={{ position: "absolute", top: -2, bottom: -2, left: "calc(" + (r.plan / hi * 100) + "% - 1px)", width: 2, background: "var(--border-ink)" }} />}
        </div>
        <span style={{ font: "var(--type-num-s)", fontVariantNumeric: "tabular-nums", textAlign: "right", color: "var(--text-primary)" }}>{tot == null ? "—" : tot + " " + unit}</span>
      </div>; })}
    {legend && <div style={{ display: "flex", gap: 12, flexWrap: "wrap", font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)" }}>{AxisVolumeBars_AX.map((a) => <span key={a} style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--axis-" + a + ")" }} />{LB[a]}</span>)}<span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><span style={{ width: 2, height: 12, background: "var(--border-ink)" }} />PLAN</span></div>}
  </div>;
}

const DistributionPlot_dec = (v) => v == null ? "—" : (v < 0 ? "−" : "") + Math.abs(v).toFixed(1).replace(".", ",");
/** Spredning rundt mål (TrackMan eller putting). Punkt = ett slag. Tekstsammendrag alltid med. */
function DistributionPlot({ points = [], range = 20, unitX = "m", unitY = "m", target = true, label = "Spredning", height = 240, xLabel = "Offline", yLabel = "Carry-avvik" }) {
  const n = points.length, mx = n ? points.reduce((s, p) => s + p.x, 0) / n : null, my = n ? points.reduce((s, p) => s + p.y, 0) / n : null;
  const sd = n > 1 ? Math.sqrt(points.reduce((s, p) => s + (p.x - mx) ** 2, 0) / (n - 1)) : null;
  const S = (v) => 50 + (v / range) * 50;
  const text = n ? n + " slag. Snitt " + xLabel.toLowerCase() + " " + DistributionPlot_dec(mx) + " " + unitX + ", " + yLabel.toLowerCase() + " " + DistributionPlot_dec(my) + " " + unitY + ". Standardavvik sideveis " + DistributionPlot_dec(sd) + " " + unitX + "." : "Ingen slag.";
  return <figure style={{ margin: 0, display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
    <svg viewBox="0 0 100 100" role="img" aria-label={label + ": " + text} style={{ width: "100%", maxWidth: height, aspectRatio: "1", alignSelf: "center", display: "block" }}>
      <rect x="0" y="0" width="100" height="100" fill="var(--surface-sunken)" />
      {[0.33, 0.66].map((r) => <circle key={r} cx="50" cy="50" r={r * 50} fill="none" stroke="var(--border-hairline)" />)}
      <line x1="50" x2="50" y1="0" y2="100" stroke="var(--border-strong)" /><line y1="50" y2="50" x1="0" x2="100" stroke="var(--border-strong)" />
      {target && <circle cx="50" cy="50" r="2.2" fill="none" stroke="var(--border-ink)" strokeWidth="1.2" />}
      {points.map((p, i) => <circle key={i} cx={S(p.x)} cy={100 - S(p.y)} r="1.6" fill="var(--text-primary)" opacity=".7" />)}
      {mx != null && <circle cx={S(mx)} cy={100 - S(my)} r="3" fill="none" stroke="var(--text-primary)" strokeWidth="1.2" strokeDasharray="2 1.5" />}
    </svg>
    <figcaption style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)", textAlign: "center" }}>{text.toUpperCase()}</figcaption>
  </figure>;
}

/** Graf og tabell er likeverdige. Tabellen er alltid ett trykk unna. */
function ChartTable({ chart, columns, rows, caption, defaultView = "Graf", rowKey = "id", aside }) {
  const [v, setV] = React.useState(defaultView);
  return <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>{caption && <span className="kicker">{caption}</span>}<div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>{aside}<Segmented options={["Graf", "Tabell"]} value={v} onChange={setV} /></div></div>
    {v === "Graf" ? chart : <DataTable caption={caption} columns={columns} rows={rows} rowKey={rowKey} />}
  </div>;
}

Object.assign(NS, { BackBar, ActionBar, ConfirmDialog, UndoToast, SortableList, DropZone, MoveSheet, ConflictSheet, SourceBadge, DataQualityBadge, PeriodSelector, FilterChips, InsightCard, EvidenceDrawer, EmptyAnalysisState, TrendChart, AxisVolumeBars, DistributionPlot, ChartTable });
})();
