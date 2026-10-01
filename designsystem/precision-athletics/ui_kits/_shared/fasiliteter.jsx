/* Fasiliteter — skjema og dekning. Delt av PlayerHQ (PH-24) og Oppstart (AU-04). Bruker DS-navnerommet direkte. */
(() => {
const ns = () => window.AKGolfPrecisionAthletics_7d7c29;
const Meta = ({ children, s }) => <span style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums", ...s }}>{children}</span>;

/* Dekning: hvilke av de 19 områdene som er dekket, og hva som mangler. */
function Dekning({ list, compact }) {
  const F = window.FAS, all = F.ALL(), got = new Set(F.union(list)), miss = all.filter((x) => !got.has(x));
  const chip = (x, on) => <span key={x} style={{ display: "inline-flex", alignItems: "center", gap: 4, minHeight: 28, padding: "0 10px", borderRadius: 999, font: "500 12px/1 var(--font-sans)", border: "1px " + (on ? "solid var(--border-ink)" : "dashed var(--border-strong)"), background: on ? "var(--surface-card)" : "transparent", color: on ? "var(--text-primary)" : "var(--text-muted)" }}>{on ? "✓ " : ""}{x.replace("Innspill ca. ", "Innspill ").replace("Putting ", "Putt ")}</span>;
  return <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
    <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}><span style={{ font: "600 15px/1.3 var(--font-sans)", color: "var(--text-primary)", flex: "1 1 auto" }}>{got.size} av {all.length} treningsområder dekket</span><Meta>{miss.length ? miss.length + " MANGLER" : "ALLE DEKKET"}</Meta></div>
    <div role="img" aria-label={got.size + " av " + all.length + " dekket"} style={{ display: "grid", gridTemplateColumns: "repeat(" + all.length + ",minmax(0,1fr))", gap: 2 }}>{all.map((x) => <span key={x} style={{ height: 8, background: got.has(x) ? "var(--primary)" : "var(--surface-sunken)" }}></span>)}</div>
    {!compact && <><Meta>DEKKET</Meta><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{all.filter((x) => got.has(x)).map((x) => chip(x, true))}</div></>}
    {miss.length > 0 && <><Meta>MANGLER</Meta><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{miss.map((x) => chip(x, false))}</div></>}
  </div>;
}

/* Skjema: ett spørsmål om gangen, ja/nei, oppfølging ved ja. */
function FasSkjema({ init, onSave, onCancel, saveLabel = "Lagre fasilitet" }) {
  const { Button, FormField, TextInput } = ns(), F = window.FAS, Q = F.Q;
  const [f, setF] = React.useState(() => ({ id: "n" + Date.now(), name: "", ...(init || {}) })), [i, setI] = React.useState(init && init.name ? 0 : -1), [err, setErr] = React.useState(null);
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const YN = ({ v, on, label }) => <div role="group" aria-label={label} style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8 }}>{[["Ja", true], ["Nei", false]].map(([l, b]) => <button key={l} type="button" aria-pressed={v === b} onClick={() => on(b)} style={{ minHeight: 52, borderRadius: 8, border: "1px solid " + (v === b ? "var(--border-ink)" : "var(--border-hairline)"), background: v === b ? "var(--primary)" : "var(--surface-card)", color: v === b ? "var(--text-on-primary)" : "var(--text-primary)", font: "600 15px/1 var(--font-sans)", cursor: "pointer" }}>{l}</button>)}</div>;
  const n = Q.length, q = i >= 0 ? Q[i] : null;
  const next = () => { if (i === -1) { if (!f.name.trim()) { setErr("Gi fasiliteten et navn."); return; } setErr(null); } if (i < n - 1) setI(i + 1); else onSave({ ...f, updated: "26.09.2026" }); };
  const answered = q ? f[q[0]] != null : true;
  return <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}><Meta>{i === -1 ? "NAVN" : "SPØRSMÅL " + (i + 1) + " AV " + n}</Meta><div aria-hidden="true" style={{ display: "grid", gridTemplateColumns: "repeat(" + (n + 1) + ",minmax(0,1fr))", gap: 3 }}>{Array.from({ length: n + 1 }, (_, k) => <span key={k} style={{ height: 4, background: k <= i + 1 ? "var(--primary)" : "var(--surface-sunken)" }}></span>)}</div></div>
    {i === -1 ? <FormField label="Hva heter fasiliteten?" required error={err || undefined}><TextInput value={f.name} placeholder="Fredrikstad GK" onChange={(e) => { set("name", e.target.value); setErr(null); }} /></FormField>
      : <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <span style={{ font: "600 17px/1.35 var(--font-sans)", color: "var(--text-primary)", textWrap: "pretty" }}>{q[1]}</span>
        <YN v={f[q[0]]} on={(b) => set(q[0], b)} label={q[1]} />
        {f[q[0]] && q[2].map(([k, l, u, t]) => t === "yn" ? <div key={k} style={{ display: "flex", flexDirection: "column", gap: 8 }}><span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{l}</span><YN v={f[k]} on={(b) => set(k, b)} label={l} /></div> : <FormField key={k} label={l + (u ? " (" + u + ")" : "")}><TextInput mono inputMode="numeric" value={f[k] == null ? "" : String(f[k])} placeholder="—" onChange={(e) => set(k, e.target.value.replace(/\D/g, "").slice(0, 3))} /></FormField>)}
      </div>}
    <div style={{ borderTop: "1px solid var(--border-hairline)", paddingTop: 12 }}><Dekning list={[f]} compact /></div>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Button icon={i === n - 1 ? "check" : "arrow-right"} disabled={!answered} onClick={next}>{i === n - 1 ? saveLabel : "Neste"}</Button>
      {i >= 0 && <Button variant="ghost" onClick={() => setI(i - 1)}>Tilbake</Button>}
      {onCancel && <Button variant="ghost" onClick={onCancel}>Avbryt</Button>}
    </div>
  </div>;
}
window.FAS_UI = { Dekning, FasSkjema, Meta };
})();
