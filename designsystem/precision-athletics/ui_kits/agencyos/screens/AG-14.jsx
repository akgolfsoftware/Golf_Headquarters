(() => {
const AREAS = { slag: ["Utslag", "Innspill ca. 200 m", "Innspill ca. 150 m", "Innspill ca. 100 m", "Innspill ca. 50 m", "Chip", "Pitch", "Lob", "Bunker", "Putting 0–3", "Putting 3–5", "Putting 5–10", "Putting 10–25", "Putting 25–40", "Putting 40+"], tek: ["Utslag", "Innspill ca. 200 m", "Innspill ca. 150 m", "Innspill ca. 100 m", "Innspill ca. 50 m", "Chip", "Pitch", "Lob", "Bunker"], fys: ["Styrke", "Kondisjon", "Bevegelighet"], spill: ["Banespill"], turn: ["Banespill"] };
const FULL = ["Utslag", "Innspill ca. 200 m", "Innspill ca. 150 m", "Innspill ca. 100 m", "Innspill ca. 50 m"];
const DIM = (a) => a === "Utslag" ? ["Sikte og oppstilling", "Startretning", "Kurve", "Treffpunkt"] : a.startsWith("Innspill") ? ["Startretning", "Kurve", "Høyde", "Lengdekontroll", "Spinn"] : a === "Bunker" ? ["Sandinngang", "Lengdekontroll", "Høyde", "Lie-variasjon"] : ["Chip", "Pitch", "Lob"].includes(a) ? ["Landingspunkt", "Utrulling", "Treffpunkt", "Køllevalg", "Bruk av bounce"] : a.startsWith("Putting") ? ["Greenlesing", "Ballstart", "Sikte", "Lengdekontroll"] : a === "Banespill" ? ["Spilleformat", "Strategioppgave"] : [];
const MOT = ["Uten ball", "Lav hastighet", "Automatikk"], BEL = ["Innendørs", "Treningsområde", "Bane", "Konkurranse"], PRESS = ["Alene", "Observert", "Konkurranse", "Turnering"];
const up = (s) => s == null ? null : s.toUpperCase().replace(/ CA\. /g, "").replace(/[ –.]/g, "").replace("PUTTING", "PUTTING").replace("INNSPILL", "INNSPILL");
const code = (d) => [d.axis.toUpperCase(), up(d.area), d.mot ? { "Uten ball": "UTENBALL", "Lav hastighet": "LH", "Automatikk": "AUTO" }[d.mot] : null, up(d.bel), up(d.press)].filter(Boolean).join("_");
const TABS = [{ value: "uker", label: "Ukemaler" }, { value: "prog", label: "Program" }, { value: "std", label: "Standardøkter" }, { value: "ov", label: "Øvelser" }];
function AG14({ state, go }) {
  const { PageHeader, Button, EmptyState, Tabs, Sheet, FormField, TextInput, Select, AxisBadge, ChoicePill, InlineAlert, KeyValue } = window.AGQ.ns();
  const A = window.AGQ, D = window.AG_DATA3, { mob, desk } = A.useW(), empty = state === "tom";
  const [tab, setTab] = React.useState("uker"), [drills, setDrills] = React.useState(D.drills), [ed, setEd] = React.useState(null), [err, setErr] = React.useState({});
  const blank = { id: null, name: "", axis: "slag", area: "Innspill ca. 100 m", mot: "Automatikk", bel: "Treningsområde", press: "Alene", dim: "Lengdekontroll", dose: "", goal: "" };
  const open = (d) => { setErr({}); setEd({ ...(d || blank) }); };
  const set = (k, v) => { const n = { ...ed, [k]: v }; if (k === "axis") { n.area = AREAS[v][0]; } if (k === "axis" || k === "area") { n.mot = FULL.includes(n.area) && n.axis !== "fys" ? n.mot || "Automatikk" : null; const dm = DIM(n.area); n.dim = n.axis === "fys" ? null : dm.includes(n.dim) ? n.dim : dm[0] || null; } setEd(n); };
  const save = () => { const e = {}; if (!ed.name.trim()) e.name = "Gi øvelsen et navn."; if (!ed.dose.trim()) e.dose = "Skriv mengde, for eksempel 30 slag eller 3 × 10."; setErr(e); if (Object.keys(e).length) return; const d = { ...ed, id: ed.id || "d" + Date.now(), by: "Anders Kristiansen · 26.09.2026" }; setDrills((l) => ed.id ? l.map((x) => x.id === ed.id ? d : x) : [d, ...l]); setEd(null); A.toast(ed.id ? "Øvelsen er lagret" : "Øvelsen er opprettet", code(d)); };
  const mixBar = (mix) => { const t = mix.reduce((a, x) => a + x[1], 0); return <span style={{ display: "flex", height: 8, gap: 2 }}>{mix.map(([a, m]) => <span key={a} title={a.toUpperCase() + " " + m + " min"} style={{ flex: m / t, background: "var(--axis-" + a + ")" }}></span>)}</span>; };
  const grid = (children) => <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,280px),1fr))", gap: 12 }}>{children}</div>;
  let body;
  if (tab === "uker") body = grid(D.weekTemplates.map((w) => <A.Card key={w.id} gap={10}><div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}><span style={{ font: "600 15px/1.3 var(--font-sans)", flex: "1 1 160px" }}>{w.name}</span><A.Meta>BRUKT {w.used}</A.Meta></div><A.Meta>{w.grp.toUpperCase()} · {w.sessions} ØKTER · {String(w.h).replace(".", ",")} T</A.Meta>{mixBar(w.mix)}<div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{w.mix.map(([a, m]) => <span key={a} style={{ display: "inline-flex", gap: 4, alignItems: "center" }}><AxisBadge axis={a} /><A.Meta>{m} MIN</A.Meta></span>)}</div><div><Button size="sm" variant="secondary" icon="layers" onClick={() => go("AG-11")}>Bruk i Workbench</Button></div></A.Card>));
  if (tab === "prog") body = grid(D.programs.map((p) => <A.EvCard key={p.id} axes={[p.axis]}><span style={{ font: "600 15px/1.3 var(--font-sans)" }}>{p.name}</span><span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{p.focus}</span><A.Meta>{p.weeks} UKER · {p.players} SPILLERE</A.Meta></A.EvCard>));
  if (tab === "std") body = grid(D.stdSessions.map((s) => <A.EvCard key={s.id} axes={[s.axis]}><span style={{ font: "600 15px/1.3 var(--font-sans)" }}>{s.name}</span><A.Meta>{s.min} MIN · {s.drills} ØVELSER</A.Meta></A.EvCard>));
  if (tab === "ov") body = <A.Stack gap={8}>{drills.map((d) => <A.EvCard key={d.id} axes={[d.axis]} onClick={() => open(d)}>
    <span style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}><span style={{ font: "600 15px/1.3 var(--font-sans)", flex: "1 1 180px", minWidth: 0 }}>{d.name}</span><A.Meta>{d.dose} · MÅL {d.goal || "—"}</A.Meta></span>
    <span style={{ font: "500 12px/1.3 var(--font-mono)", color: "var(--text-secondary)", overflowWrap: "anywhere" }}>{code(d)}</span>
    <A.Meta>{[d.area, d.mot, d.bel, d.press, d.dim].filter(Boolean).join(" · ").toUpperCase()}</A.Meta>
  </A.EvCard>)}</A.Stack>;
  const pills = (label, opts, k) => <FormField label={label}><div role="radiogroup" aria-label={label} style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{opts.map((o) => <ChoicePill key={o} selected={ed[k] === o} onClick={() => set(k, o)}>{k === "axis" ? o.toUpperCase() : o}</ChoicePill>)}</div></FormField>;
  return <A.Page>
    <PageHeader kicker="Plan · maler og øvelser" title="Plan-hub" sub="Ukemaler, program, standardøkter og øvelsesbanken. Øvelser bygges etter AK-formelen v2." actions={<Button icon="plus" onClick={() => { setTab("ov"); open(null); }}>Ny øvelse</Button>} />
    <A.Gate state={state} loading="Henter maler og øvelser …" error={{ title: "Plan-hub kunne ikke hentes", text: "Ingen maler eller øvelser er endret. Prøv igjen.", code: "FEIL 502 · PLAN-TEMPLATES" }}>
      <Tabs tabs={TABS.map((t) => ({ ...t, count: empty ? undefined : { uker: D.weekTemplates.length, prog: D.programs.length, std: D.stdSessions.length, ov: drills.length }[t.value] }))} value={tab} onChange={setTab} />
      {empty ? <EmptyState icon="library" title={tab === "ov" ? "Ingen øvelser ennå" : "Ingen maler ennå"} text="Start med én øvelse. Den kan brukes i standardøkter, ukemaler og rett i Workbench." action="Ny øvelse" actionIcon="plus" onAction={() => { setTab("ov"); open(null); }} /> : body}
    </A.Gate>
    <Sheet open={!!ed} onClose={() => setEd(null)} kicker={ed && ed.id ? "/admin/plan-templates/" + ed.id + "/rediger" : "/admin/plan-templates/ny"} title={ed && ed.id ? "Rediger øvelse" : "Ny øvelse"} footer={<><Button fullWidth icon="check" onClick={save}>{ed && ed.id ? "Lagre øvelse" : "Opprett øvelse"}</Button><Button variant="ghost" fullWidth onClick={() => setEd(null)}>Avbryt</Button></>}>
      {ed && <>
        {Object.keys(err).length > 0 && <InlineAlert tone="warn" title="Øvelsen er ikke lagret">{Object.keys(err).length === 1 ? "Ett felt må rettes." : Object.keys(err).length + " felt må rettes."}</InlineAlert>}
        <FormField label="Navn" required error={err.name}><TextInput value={ed.name} onChange={(e) => set("name", e.target.value)} placeholder="7-jern mot mål" /></FormField>
        {pills("Akse", ["fys", "tek", "slag", "spill", "turn"], "axis")}
        <Select label="Treningsområde" value={ed.area} onChange={(e) => set("area", e.target.value)} options={AREAS[ed.axis]} />
        {ed.mot ? pills("Motorikk", MOT, "mot") : <A.Meta>MOTORIKK GJELDER BARE FULLSVING</A.Meta>}
        {pills("Belastning", BEL, "bel")}
        {pills("Press", PRESS, "press")}
        {DIM(ed.area).length > 0 && ed.axis !== "fys" && <Select label="Teknisk dimensjon · maks ett fokus" value={ed.dim || ""} onChange={(e) => set("dim", e.target.value)} options={DIM(ed.area)} />}
        <FormField label="Mengde" required error={err.dose}><TextInput mono value={ed.dose} onChange={(e) => set("dose", e.target.value)} placeholder="30 slag" /></FormField>
        <FormField label="Restmål" optional><TextInput mono value={ed.goal} onChange={(e) => set("goal", e.target.value)} placeholder="±4 m" /></FormField>
        <div style={{ padding: 12, borderRadius: 8, background: "var(--surface-flat)", border: "1px solid var(--border-hairline)", display: "flex", flexDirection: "column", gap: 4 }}><A.Meta>AK-FORMEL V2</A.Meta><span style={{ font: "600 13px/1.4 var(--font-mono)", overflowWrap: "anywhere" }}>{code(ed)}</span></div>
      </>}
    </Sheet>
  </A.Page>;
}
window.AG_SCREENS["AG-14"] = { id: "AG-14", parent: "AG-11", name: "Plan-hub, maler og øvelser", route: "/admin/plan", Component: AG14 };
})();
