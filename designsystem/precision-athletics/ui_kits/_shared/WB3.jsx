/* Workbench — runde 29 · runde 33: År · Periode · Måned i WB3-ar.jsx. (Anders 28.09.2026). Én komponent for spiller (PH-11) og coach (AG-11). kit = window.PHQ eller window.AGQ.
   Nivåer: År · Periode · Måned · Uke · Økt, pluss Målsetninger (bytter ut kalenderen i midtfeltet). Coach: velgere for Gruppe og Spiller med søk, Forrige/Neste og sist brukte.
   Dra pyramideakse ut og slipp på klokkeslett (eller trykk akse, så klokkeslett) → Gjenta. Endring av gjentatt økt: bare denne eller alle framover.
   Sidefelt: øvelsesbank · fysisk program · øktmaler · turneringer · ny teknisk plan · målsetninger. A3-knapper, B4 skjult ved lansering, B7 samling. */
(() => {
const W = () => window.WB3;
const AXL = { fys: "FYS", tek: "TEK", slag: "SLAG", spill: "SPILL", turn: "TURN" };
const LEVELS = [["ar", "År"], ["periode", "Periode"], ["mnd", "Måned"], ["uke", "Uke"], ["okt", "Økt"], ["mal", "Målsetninger"]];
const SIDE = [["bank", "Øvelsesbank"], ["fys", "Fysisk program"], ["maler", "Øktmaler"], ["turn", "Turneringer"], ["tp", "Ny teknisk plan"], ["mal", "Målsetninger"]];
const hm = (m) => Math.floor(m / 60) + " t" + (m % 60 ? " " + (m % 60) + " min" : "");
function Workbench({ kit, state, go, nav, coach, level0, mode0, side0, wiz0, pf0, mf0 }) {
  const K = kit, { Button, IconButton, ChoicePill, Segmented, Sheet, StatusPill, EmptyState, TextInput, SearchField, Select, Icon } = K.ns(), M = K.Meta, { cw } = K.useW(), empty = state === "tom";
  const [mode, setMode] = React.useState(mode0 || "spiller"), [subj, setSubj] = React.useState(mode0 === "gruppe" ? "g1" : "p1"), [pick, setPick] = React.useState(false), [q, setQ] = React.useState("");
  const [level, setLevel] = React.useState(level0 || "uke"), [side, setSide] = React.useState(side0 || "bank"), [week, setWeek] = React.useState(40), [day, setDay] = React.useState(0);
  const base = mode === "gruppe" ? W().groupSes : [...W().groupSes.filter((g) => !W().playerSes.some((p) => p.of === g.id)).map((g) => ({ ...g, src: "arvet" })), ...W().playerSes];
  const [ses, setSes] = React.useState(empty ? [] : base), [arm, setArm] = React.useState(null), [drop, setDrop] = React.useState(null), [rep, setRep] = React.useState("Ikke gjenta"), [edit, setEdit] = React.useState(null), [scope, setScope] = React.useState(null);
  const [drag, setDrag] = React.useState(null), dref = React.useRef(null), [merOpen, setMerOpen] = React.useState(false);
  const [okt, setOkt] = React.useState(empty ? [] : [W().bank[4], W().bank[5], W().bank[6]]), [oAx, setOAx] = React.useState("slag"), [newEx, setNewEx] = React.useState(null), [goals, setGoals] = React.useState(empty ? [] : W().goals), [newG, setNewG] = React.useState(null), [note, setNote] = React.useState(false);
  React.useEffect(() => { setSes(empty ? [] : base); }, [mode]);
  const AR = window.WB3_AR, yp = AR.useYP({ empty, mode, wiz0, pf0, mf0 }), upper = level === "ar" || level === "periode" || level === "mnd", noPlan = upper && !yp.plan;
  const wide = cw >= 1180, grid = cw >= 900;
  const who = mode === "gruppe" ? W().groups.find((g) => g.id === subj) : W().players.find((p) => p.id === subj);
  const list = [...W().players.map((p) => ({ ...p, k: "spiller" })), ...W().groups.map((g) => ({ ...g, k: "gruppe" }))].filter((x) => x.k === mode);
  const idx = list.findIndex((x) => x.id === subj), step = (d) => { const n = list[(idx + d + list.length) % list.length]; setSubj(n.id); };
  const undo = (msg, meta, fn) => nav && nav.undo ? nav.undo(msg, meta, fn) : K.toast(msg, meta);
  const place = (axis, d, h) => { setDrop({ axis, day: d, h }); setRep("Ikke gjenta"); setArm(null); };
  const confirm = () => { const id = "n" + Date.now(), s = { id, day: drop.day, h: drop.h, t: String(drop.h).padStart(2, "0") + ":00", min: 60, axis: drop.axis, title: "Ny " + AXL[drop.axis] + "-økt", rep: rep === "Ikke gjenta" ? null : rep, src: mode === "gruppe" ? "gruppe" : "egen" }; const before = ses; setSes([...ses, s]); setDrop(null); undo("Økta er lagt inn", (W().dayNames[s.day] + " " + s.t + " · " + AXL[s.axis] + (s.rep ? " · " + s.rep : "")).toUpperCase() + (mode === "gruppe" ? " · ALLE UTEN EGEN VERSJON FÅR DEN" : ""), () => setSes(before)); };
  const applyEdit = (sc) => { const before = ses; setSes(ses.map((x) => x.id === edit.id ? { ...x, title: x.title.replace(/ · endret$/, "") + " · endret", src: mode === "spiller" && x.src === "arvet" ? "egen-av-gruppe" : x.src } : x)); setEdit(null); setScope(null); undo(sc === "alle" ? "Endret alle framover" : "Endret bare denne", (edit.title + (mode === "spiller" && edit.src === "arvet" ? " · MERKET EGEN" : mode === "gruppe" ? " · SLÅR GJENNOM TIL ALLE UTEN EGEN VERSJON" : "")).toUpperCase(), () => setSes(before)); };
  React.useEffect(() => {
    if (!drag) return;
    const mv = (e) => { const el = document.elementFromPoint(e.clientX, e.clientY), t = el && el.closest("[data-slot]"); dref.current = { ...dref.current, x: e.clientX, y: e.clientY, over: t ? t.dataset.slot : null }; setDrag({ ...dref.current }); };
    const up = () => { const d = dref.current; if (d && d.over) { const [dd, hh] = d.over.split("-").map(Number); place(d.axis, dd, hh); } dref.current = null; setDrag(null); };
    window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up);
    return () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up); };
  }, [!!drag]);
  const srcTag = (s) => s.src === "arvet" ? "GRUPPE · WANG VG2" : s.src === "egen-av-gruppe" ? "EGEN" : s.src === "gruppe" ? "GRUPPEPLAN" : s.src === "coach" ? "FRA ANDERS" : s.src === "program" ? "FYSISK PROGRAM" : s.src === "turn" ? "TURNERING" : "";
  const Ses = ({ s }) => <button type="button" onClick={() => setEdit(s)} aria-label={s.t + " " + s.title + (s.rep ? ", gjentas " + s.rep : "")} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "flex", flexDirection: "column", gap: 2, padding: "6px 8px 6px 10px", borderRadius: 6, background: "var(--surface-card)", border: "1px solid var(--border-hairline)", boxShadow: "inset 3px 0 0 var(--axis-" + s.axis + ")", minWidth: 0, minHeight: 48, width: "100%" }}>
    <span style={{ font: "600 12px/1.2 var(--font-mono)", color: "var(--text-primary)" }}>{s.t} · {s.min} min</span>
    <span style={{ font: "500 12px/1.25 var(--font-sans)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{s.title}</span>
    {(srcTag(s) || s.rep) && <span style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{srcTag(s) === "EGEN" ? <StatusPill tone="info">Egen</StatusPill> : srcTag(s) ? <M s={{ fontSize: 10 }}>{srcTag(s)}</M> : null}{s.rep && <M s={{ fontSize: 10 }}>↻ {s.rep.toUpperCase()}</M>}</span>}
  </button>;
  const slot = (d, h) => { const items = ses.filter((s) => s.day === d && s.h === h), key = d + "-" + h, over = drag && drag.over === key;
    return <div key={key} data-slot={key} role="listitem" aria-label={W().dayNames[d] + " kl. " + h} style={{ minHeight: 48, borderTop: "1px solid var(--border-hairline)", padding: 2, background: over ? "var(--surface-flat)" : "transparent", boxShadow: over ? "inset 0 0 0 2px var(--border-ink)" : "none", display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
      {items.map((s) => <Ses key={s.id} s={s} />)}
      {arm && !items.length && <button type="button" onClick={() => place(arm, d, h)} aria-label={"Slipp " + AXL[arm] + " på " + W().dayNames[d] + " kl. " + h} style={{ all: "unset", cursor: "pointer", flex: 1, minHeight: 44, borderRadius: 4, border: "1px dashed var(--border-strong)", display: "grid", placeItems: "center", font: "500 11px/1 var(--font-mono)", color: "var(--text-muted)" }}>+ {AXL[arm]}</button>}
    </div>; };
  const axisBar = <div role="group" aria-label="Pyramideakser · dra ut og slipp på klokkeslett" style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 6 }}>{W().axes.map(([a, l]) => <button key={a} type="button" aria-pressed={arm === a} onClick={() => setArm(arm === a ? null : a)} onPointerDown={grid ? (e) => { e.preventDefault(); const d = { axis: a, x: e.clientX, y: e.clientY, over: null }; dref.current = d; setDrag(d); } : undefined} style={{ minHeight: 48, borderRadius: 8, border: "1px solid " + (arm === a ? "var(--border-ink)" : "var(--border-hairline)"), background: "var(--surface-card)", boxShadow: "inset 0 -3px 0 var(--axis-" + a + ")", color: "var(--text-primary)", font: "600 13px/1 var(--font-mono)", cursor: grid ? "grab" : "pointer", touchAction: "none", minWidth: 0 }}>{l}</button>)}</div>;
  const dates = W().weeks[week];
  const weekBoard = week === 41 ? <div style={{ display: "flex", flexDirection: "column", gap: 8 }}><div role="group" aria-label="Treningssamling" style={{ padding: 12, borderRadius: 8, background: "var(--surface-sunken)", border: "1px solid var(--border-strong)", display: "flex", flexDirection: "column", gap: 4 }}><M>TRENINGSSAMLING · TIR–LØR</M><span style={{ font: "600 15px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{W().samling.name}</span><M>{W().samling.meta}</M></div><M>ØKTER I SAMLINGEN LEGGES INN SOM BLOKK · ANDRE ØKTER UKE 41 ER FLYTTET UT</M></div>
    : grid ? <div role="list" aria-label={"Uke " + week} style={{ display: "grid", gridTemplateColumns: "40px repeat(7,minmax(0,1fr))", gap: "0 4px", userSelect: drag ? "none" : "auto" }}>
      <span></span>{W().dayNames.map((n, i) => <span key={n} style={{ font: "600 13px/1.2 var(--font-sans)", color: "var(--text-primary)", paddingBottom: 6 }}>{n} <span style={{ font: "var(--type-num-s)", color: "var(--text-muted)" }}>{dates[i]}</span></span>)}
      {W().hours.map((h) => <React.Fragment key={h}><span style={{ font: "500 11px/1 var(--font-mono)", color: "var(--text-muted)", paddingTop: 4, borderTop: "1px solid var(--border-hairline)" }}>{String(h).padStart(2, "0")}</span>{W().dayNames.map((_, d) => slot(d, h))}</React.Fragment>)}
    </div>
    : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div role="group" aria-label="Dag" style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 4, width: "100%", minWidth: 0, position: "sticky", top: 0, zIndex: 2, background: "var(--surface-card)", padding: "4px 0" }}>{W().dayNames.map((n, i) => <button key={n} type="button" aria-pressed={day === i} onClick={() => setDay(i)} style={{ height: 56, borderRadius: 8, border: "1px solid " + (day === i ? "var(--border-ink)" : "var(--border-hairline)"), background: day === i ? "var(--primary)" : "var(--surface-card)", color: day === i ? "var(--text-on-primary)" : "var(--text-primary)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, padding: 0, minWidth: 0, cursor: "pointer" }}><span style={{ font: "500 11px/1 var(--font-sans)" }}>{n}</span><span style={{ font: "600 14px/1 var(--font-mono)" }}>{dates[i].slice(0, 2)}</span></button>)}</div>
      <div role="list" aria-label={W().dayNames[day] + " " + dates[day]} style={{ display: "grid", gridTemplateColumns: "40px minmax(0,1fr)", gap: "0 8px" }}>{W().hours.map((h) => <React.Fragment key={h}><span style={{ font: "500 11px/1 var(--font-mono)", color: "var(--text-muted)", paddingTop: 6, borderTop: "1px solid var(--border-hairline)" }}>{String(h).padStart(2, "0")}</span>{slot(day, h)}</React.Fragment>)}</div>
    </div>;
  const Row = ({ a, sub, b, i }) => <div role="listitem" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 12, alignItems: "center", minHeight: 48, borderTop: i ? "1px solid var(--border-hairline)" : "none", padding: "4px 0" }}><span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}><span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{a}</span>{sub && <M>{sub}</M>}</span><span style={{ font: "600 13px/1.2 var(--font-mono)", color: "var(--text-primary)", textAlign: "right" }}>{b}</span></div>;
  const oktV = <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}><span style={{ font: "600 16px/1.3 var(--font-sans)", color: "var(--text-primary)", flex: "1 1 auto" }}>Tir 29.09 · 16:00 · Innspill og nærspill</span><M>{okt.reduce((a, b) => a + b.min, 0)} MIN</M></div>
    {!okt.length ? <M>INGEN ØVELSER · VELG PYRAMIDE OG LEGG TIL FRA BANKEN</M> : <div role="list">{okt.map((o, i) => <div role="listitem" key={o.id + i} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 8, alignItems: "center", minHeight: 52, borderTop: i ? "1px solid var(--border-hairline)" : "none", boxShadow: "inset 3px 0 0 var(--axis-" + o.axis + ")", paddingLeft: 10 }}><span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}><span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{o.name}</span><M>{AXL[o.axis]} · {o.area.toUpperCase()} · {o.min} MIN</M></span><IconButton icon="x" label={"Fjern " + o.name} variant="ghost" onClick={() => setOkt(okt.filter((_, j) => j !== i))} /></div>)}</div>}
  </div>;
  const gp = (g) => <div role="listitem" key={g.id} style={{ display: "flex", flexDirection: "column", gap: 6, padding: "10px 0", borderTop: "1px solid var(--border-hairline)" }}>
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><StatusPill tone="neutral">{g.type}</StatusPill><span style={{ font: "600 14px/1.3 var(--font-sans)", color: "var(--text-primary)", flex: "1 1 160px" }}>{g.name}</span><span style={{ font: "600 14px/1 var(--font-mono)", color: "var(--text-primary)" }}>{g.pct} %</span></div>
    <span aria-hidden="true" style={{ height: 6, background: "var(--surface-sunken)", position: "relative" }}><span style={{ position: "absolute", inset: 0, width: g.pct + "%", background: "var(--primary)" }}></span></span>
    <M>{g.param.toUpperCase()} · START {g.start} · NÅ {g.now} · MÅL {g.target.toUpperCase()}</M>
    <M>{g.from}–{g.to} · KNYTTET TIL {g.link.toUpperCase()} · FREMDRIFT AUTOMATISK FRA {g.src}</M>
  </div>;
  const malV = <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><span style={{ font: "600 16px/1.3 var(--font-sans)", color: "var(--text-primary)", flex: "1 1 auto" }}>Målsetninger · {who.name}</span><Button size="sm" icon="plus" onClick={() => setNewG({ type: "Prosessmål", name: "", param: W().goalParams[0], link: "Uke", target: "" })}>Ny målsetning</Button></div>
    {!goals.length ? <EmptyState icon="target" title="Ingen målsetninger" text="Lag et resultat- eller prosessmål. Fremdriften hentes fra plan, Stats, tester og runder." /> : <div role="list" style={{ marginTop: -1 }}>{goals.map(gp)}</div>}
  </div>;
  const mid = upper ? <AR.Mid K={K} yp={yp} level={level} setLevel={setLevel} setWeek={setWeek} coach={coach} mode={mode} who={who} cw={cw} undo={undo} /> : level === "okt" ? oktV : level === "mal" ? malV : weekBoard;
  const bankL = W().bank.filter((b) => b.axis === oAx);
  const sideBody = side === "bank" ? <>
    <M>1 · VELG PYRAMIDE FØRST</M>
    <div role="radiogroup" aria-label="Pyramide" style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 4 }}>{W().axes.map(([a, l]) => <ChoicePill key={a} role="radio" aria-checked={oAx === a} selected={oAx === a} axis={a} onClick={() => setOAx(a)} style={{ justifyContent: "center", minWidth: 0, padding: "0 4px" }}>{l}</ChoicePill>)}</div>
    <M>2 · BANKEN ER FILTRERT PÅ {AXL[oAx]}</M>
    <div role="list">{bankL.map((b, i) => <div role="listitem" key={b.id} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 44px", gap: 8, alignItems: "center", minHeight: 52, borderTop: i ? "1px solid var(--border-hairline)" : "none" }}><span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}><span style={{ font: "500 13px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{b.name}</span><M>{b.area.toUpperCase()} · {b.min} MIN</M></span><IconButton icon="plus" variant="secondary" label={"Legg " + b.name + " i økta"} onClick={() => { setOkt([...okt, b]); K.toast("Lagt i økta", b.name.toUpperCase()); }} /></div>)}</div>
    <Button variant="secondary" size="sm" icon="plus" onClick={() => setNewEx({ axis: oAx, area: W().areas.find((a) => W().bank.some((b) => b.axis === oAx && b.area === a)) || W().areas[0], mot: W().motorikk[1], bel: W().belastning[0], press: W().press[0], name: "" })}>Egen øvelse i {AXL[oAx]}</Button>
  </> : side === "fys" ? <><div role="list">{W().fysProg.map(([n, s, d], i) => <Row key={n} i={i} a={n} sub={s.toUpperCase()} b={d} />)}</div><Button variant="secondary" size="sm" icon="dumbbell" onClick={() => { const before = ses; setSes([...ses, { id: "fp" + Date.now(), day: 1, h: 17, t: "17:30", min: 45, axis: "fys", title: "Styrke bein og kjerne", rep: "Tir og tor ut perioden", src: "program" }]); undo("Fysisk program lagt inn", "TIR OG TOR 17:30 · UT PERIODEN", () => setSes(before)); }}>Legg til fysisk program</Button>{coach && <Button variant="ghost" size="sm" iconRight="arrow-right" onClick={() => go("AG-WB-FYS")}>Åpne hele programmet</Button>}</>
  : side === "maler" ? <div role="list">{W().maler.map(([n, s, u], i) => <Row key={n} i={i} a={n} sub={s.toUpperCase() + " · " + u.toUpperCase()} b={<IconButton icon="plus" variant="ghost" label={"Bruk " + n} onClick={() => K.toast("Mal lagt inn", (n + " · " + who.name).toUpperCase())} />} />)}</div>
  : side === "turn" ? <><div role="list">{W().turn.map(([d, n, c], i) => <Row key={n} i={i} a={n} sub={d + " · " + c.toUpperCase()} b="TURN" />)}</div>{coach && <Button variant="ghost" size="sm" iconRight="arrow-right" onClick={() => go("AG-WB-TURN")}>Åpne turneringsmodulen</Button>}</>
  : side === "tp" ? <><div role="list">{W().techTasks.map(([p, t], i) => <Row key={p} i={i} a={p + " · " + t} b={<IconButton icon="plus" variant="ghost" label={"Legg " + p + " i økta"} onClick={() => K.toast("Teknisk oppgave lagt i økta", p)} />} />)}</div><Button variant="secondary" size="sm" icon="list-checks" onClick={() => coach ? go("AG-10") : K.toast("Ny teknisk plan", "SENDES TIL ANDERS SOM FORSLAG")}>Ny teknisk plan</Button></>
  : <><div role="list">{goals.map((g, i) => <Row key={g.id} i={i} a={g.name} sub={g.type.toUpperCase() + " · " + g.link.toUpperCase()} b={g.pct + " %"} />)}</div><Button variant="secondary" size="sm" icon="target" onClick={() => setLevel("mal")}>Vis målsetninger i midtfeltet</Button></>;
  const sidebar = <section aria-label="Sidefelt" className="pa-card" style={{ padding: 16, gap: 10, minWidth: 0, alignSelf: "start" }}>
    <div role="tablist" aria-label="Sidefelt" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{SIDE.map(([k, l]) => <ChoicePill key={k} role="tab" aria-selected={side === k} selected={side === k} onClick={() => setSide(k)}>{l}</ChoicePill>)}</div>
    {sideBody}
  </section>;
  const a3m = coach && (cw < 700 ? <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Button size="sm" variant="secondary" icon="more-horizontal" aria-expanded={merOpen} onClick={() => setMerOpen(!merOpen)}>Mer</Button>{mode === "gruppe" && <Button size="sm" variant="ghost" icon="sparkles" onClick={() => K.toast(W().b4.title, W().b4.flag.toUpperCase())}>{W().b4.title} · {W().b4.flag}</Button>}</div> : null);
  const a3row = coach && <div role="group" aria-label="Snarveier" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
    <Button size="sm" variant="secondary" icon="copy" onClick={() => undo("Uke 40 er duplisert til uke 42", (who.name + " · " + ses.length + " økter").toUpperCase(), () => {})}>Dupliser uke</Button>
    <Button size="sm" variant="secondary" icon="copy-plus" onClick={() => K.toast("Velg økt å duplisere", "TRYKK PÅ ØKTA I KALENDEREN")}>Dupliser økt</Button>
    <Button size="sm" variant="secondary" icon="layout-template" onClick={() => setSide("maler")}>Bruk mal på spiller</Button>
    <Button size="sm" variant="secondary" icon="sticky-note" onClick={() => setNote(true)}>Coachnotat</Button>
    <Button size="sm" variant="secondary" icon="search" onClick={() => setSide("tp")}>Søk i tekniske oppgaver</Button>
    {mode === "gruppe" && <Button size="sm" variant="ghost" icon="sparkles" onClick={() => K.toast(W().b4.title, W().b4.flag.toUpperCase())}>{W().b4.title} · {W().b4.flag}</Button>}
  </div>;
  const a3 = a3m || a3row;
  const velger = coach && <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
    <Segmented options={["Spiller", "Gruppe"]} value={mode === "gruppe" ? "Gruppe" : "Spiller"} onChange={(v) => { const m = v === "Gruppe" ? "gruppe" : "spiller"; setMode(m); setSubj(m === "gruppe" ? "g1" : "p1"); }} />
    <div role="group" aria-label="Velg spiller eller gruppe" style={{ display: "grid", gridTemplateColumns: "44px minmax(0,1fr) 44px", gap: 6, alignItems: "center", flex: "1 1 280px", minWidth: 0, maxWidth: 420 }}>
      <IconButton icon="chevron-left" label="Forrige" variant="secondary" onClick={() => step(-1)} />
      <Button variant="secondary" icon="search" onClick={() => setPick(true)} style={{ minWidth: 0, width: "100%", overflow: "hidden" }}>{who.name}</Button>
      <IconButton icon="chevron-right" label="Neste" variant="secondary" onClick={() => step(1)} />
    </div>
    <M>{mode === "gruppe" ? who.n + " MEDLEMMER · " + who.own + " MED EGEN VERSJON" : "KATEGORI " + who.cat + " · " + W().groups.find((g) => g.id === who.grp).name.toUpperCase()}</M>
  </div>;
  const grpNote = mode === "gruppe" ? <div role="note" style={{ display: "grid", gridTemplateColumns: "20px minmax(0,1fr)", gap: 8, padding: 12, borderRadius: 8, border: "1px solid var(--border-hairline)" }}><Icon name="layers" size={16} /><span style={{ font: "var(--type-body-s)", color: "var(--text-primary)", textWrap: "pretty" }}>Gruppeplanen er grunnmuren. {who.n} medlemmer får gruppeøktene automatisk i sin plan. Endringer slår gjennom til alle som ikke har egen versjon ({who.own} har «Egen»).</span></div>
    : coach || true ? <M>GRUPPEØKTER FRA WANG VG2 LIGGER I PLANEN AUTOMATISK · TILPASSET = «EGEN»</M> : null;
  return <K.Page max={1440}>
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><M>{coach ? "WORKBENCH · " + (mode === "gruppe" ? "GRUPPE" : "SPILLER") : "PLAN · WORKBENCH"}</M><h1 style={{ margin: 0, font: "var(--type-title-l)", color: "var(--text-primary)" }}>Workbench</h1></div>
    <K.Gate state={state} loading="Henter planen …" error={{ title: "Workbench kunne ikke lastes", text: "Endringer som ikke er lagret ligger på enheten og sendes når nettet er tilbake.", code: "FEIL 503 · WORKBENCH · 08:20" }}>
      {velger}
      <div role="tablist" aria-label="Nivå" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{LEVELS.map(([k, l]) => <ChoicePill key={k} role="tab" aria-selected={level === k} selected={level === k} onClick={() => setLevel(k)}>{l}</ChoicePill>)}</div>
      {!noPlan && a3}
      {merOpen && cw < 700 && coach && <Sheet open onClose={() => setMerOpen(false)} kicker={"Workbench · " + who.name} title="Mer" footer={<Button variant="ghost" fullWidth onClick={() => setMerOpen(false)}>Lukk</Button>}><div role="list">{[["copy", "Dupliser uke", () => undo("Uke 40 er duplisert til uke 42", (who.name + " · " + ses.length + " økter").toUpperCase(), () => {})], ["copy-plus", "Dupliser økt", () => K.toast("Velg økt å duplisere", "TRYKK PÅ ØKTA I KALENDEREN")], ["layout-template", "Bruk mal på spiller", () => setSide("maler")], ["sticky-note", "Coachnotat", () => setNote(true)], ["search", "Søk i tekniske oppgaver", () => setSide("tp")]].map(([ic, l, fn], i) => <button key={l} type="button" role="listitem" onClick={() => { setMerOpen(false); fn(); }} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", width: "100%", display: "flex", gap: 12, alignItems: "center", minHeight: 52, borderTop: i ? "1px solid var(--border-hairline)" : "none", font: "500 15px/1.3 var(--font-sans)", color: "var(--text-primary)" }}><Icon name={ic} size={18} />{l}</button>)}</div></Sheet>}
      {grpNote}
      <div style={{ display: "grid", gridTemplateColumns: wide && !noPlan ? "minmax(0,1fr) 340px" : "minmax(0,1fr)", gap: 16, alignItems: "start", minWidth: 0 }}>
        <section aria-label={LEVELS.find((x) => x[0] === level)[1]} className="pa-card" style={{ padding: 16, gap: 12, minWidth: 0 }}>
          {level === "uke" && <><div style={{ display: "flex", gap: 8, alignItems: "center" }}><IconButton icon="chevron-left" label="Forrige uke" variant="ghost" disabled={week === 40} onClick={() => setWeek(40)} /><span style={{ font: "600 15px/1.2 var(--font-sans)", color: "var(--text-primary)", flex: 1, textAlign: "center" }}>Uke {week} · {dates[0]}–{dates[6]} · {week === 40 ? "Turneringsperiode" : "Evaluering"}</span><IconButton icon="chevron-right" label="Neste uke" variant="ghost" disabled={week === 41} onClick={() => setWeek(41)} /></div>
            <AR.WeekAlloc K={K} yp={yp} week={week} ses={ses} />
            {week === 40 && axisBar}
            {week === 40 && <M>{arm ? "TRYKK ET KLOKKESLETT FOR Å SLIPPE " + AXL[arm] : grid ? "DRA EN AKSE UT OG SLIPP PÅ ET KLOKKESLETT · ELLER TRYKK AKSEN OG SÅ KLOKKESLETTET" : "TRYKK EN AKSE, SÅ ET KLOKKESLETT"}</M>}
            {empty && !ses.length && week === 40 && <EmptyState icon="layers" title="Uke 40 er tom" text="Dra en pyramideakse ut i kalenderen, eller bruk en øktmal fra sidefeltet." />}</>}
          {mid}
          {level === "uke" && week === 40 && <M>{hm(ses.reduce((a, s) => a + s.min, 0)).toUpperCase()} PLANLAGT · FARGE = AKSE</M>}
        </section>
        {!noPlan && sidebar}
      </div>
    </K.Gate>
    {state !== "laster" && state !== "feil" && <AR.Dialogs K={K} yp={yp} cw={cw} coach={coach} mode={mode} who={who} undo={undo} />}
    {drag && <div aria-hidden="true" style={{ position: "fixed", left: drag.x - 40, top: drag.y - 20, width: 80, height: 40, borderRadius: 8, background: "var(--surface-card)", border: "1px solid var(--border-ink)", boxShadow: "inset 0 -3px 0 var(--axis-" + drag.axis + ")", display: "grid", placeItems: "center", font: "600 13px/1 var(--font-mono)", color: "var(--text-primary)", pointerEvents: "none", zIndex: 300 }}>{AXL[drag.axis]}</div>}
    {drop && <Sheet open onClose={() => setDrop(null)} kicker={AXL[drop.axis] + " · " + W().dayNames[drop.day] + " " + dates[drop.day] + " kl. " + String(drop.h).padStart(2, "0") + ":00"} title="Gjenta?" footer={<><Button fullWidth icon="check" onClick={confirm}>Legg inn</Button><Button variant="ghost" fullWidth onClick={() => setDrop(null)}>Avbryt</Button></>}>
      <div role="radiogroup" aria-label="Gjenta" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{W().repeat.map((r) => <ChoicePill key={r} role="radio" aria-checked={rep === r} selected={rep === r} onClick={() => setRep(r)}>{r}</ChoicePill>)}</div>
      {rep === "Valgte dager" && <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{W().dayNames.map((d) => <ChoicePill key={d} selected={d === W().dayNames[drop.day]}>{d}</ChoicePill>)}</div>}
      {rep === "Til dato" && <TextInput mono aria-label="Til dato" placeholder="dd.mm.åååå" defaultValue="31.10.2026" />}
      {rep === "Ut perioden" && <M>TURNERINGSPERIODE · TIL OG MED UKE 40</M>}
      {mode === "gruppe" && <M>ALLE {who.n} MEDLEMMER FÅR ØKTA · DE {who.own} MED EGEN VERSJON BEHOLDER SIN</M>}
    </Sheet>}
    {edit && <Sheet open onClose={() => { setEdit(null); setScope(null); }} kicker={W().dayNames[edit.day] + " " + dates[edit.day] + " · " + edit.t + " · " + AXL[edit.axis]} title={edit.title} footer={edit.rep ? <><Button fullWidth onClick={() => applyEdit("denne")}>Endre bare denne</Button><Button variant="secondary" fullWidth onClick={() => applyEdit("alle")}>Endre alle framover</Button></> : <><Button fullWidth icon="check" onClick={() => applyEdit("denne")}>Lagre endring</Button><Button variant="ghost" fullWidth onClick={() => setEdit(null)}>Lukk</Button></>}>
      <M>{[srcTag(edit), edit.rep ? "GJENTAS " + edit.rep.toUpperCase() : "ENKELTØKT", edit.min + " MIN"].filter(Boolean).join(" · ")}</M>
      {edit.src === "arvet" && <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>Økta kommer fra gruppeplanen. Endrer du den her, får {who.name.split(" ")[0]} en egen versjon, merket «Egen». Endringer i gruppeplanen slår da ikke lenger gjennom.</p>}
      {mode === "gruppe" && <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>Endringen slår gjennom til alle i {who.name} som ikke har egen versjon.</p>}
      <Button variant="ghost" size="sm" icon="list" onClick={() => { setEdit(null); setLevel("okt"); }}>Åpne økta</Button>
    </Sheet>}
    {newEx && <Sheet open onClose={() => setNewEx(null)} kicker={"Egen øvelse · AK-formel v2 · " + AXL[newEx.axis]} title="Ny øvelse" footer={<><Button fullWidth icon="check" disabled={!newEx.name.trim()} onClick={() => { const o = { id: "x" + Date.now(), axis: newEx.axis, area: newEx.area, name: newEx.name, min: 20 }; setOkt([...okt, o]); setNewEx(null); K.toast("Øvelsen er laget", ([AXL[o.axis], o.area, /^Putt/.test(o.area) ? null : newEx.mot, newEx.bel, newEx.press].filter(Boolean).join("_")).toUpperCase().replace(/ /g, "")); }}>Lag øvelse</Button><Button variant="ghost" fullWidth onClick={() => setNewEx(null)}>Avbryt</Button></>}>
      <M>PYRAMIDE {AXL[newEx.axis]} · STYRER KATEGORISERINGEN VIDERE</M>
      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={{ font: "500 13px/1.3 var(--font-sans)", color: "var(--text-secondary)" }}>Navn</span><TextInput value={newEx.name} onChange={(e) => setNewEx({ ...newEx, name: e.target.value })} placeholder="Innspill ca. 50 m · tre mål" /></label>
      <Select label="Område (19)" value={newEx.area} onChange={(e) => setNewEx({ ...newEx, area: e.target.value })} options={W().areas} />
      {/^Putt/.test(newEx.area) ? <M>MOTORIKK · — · PUTT FÅR ALDRI MOTORIKK</M> : <Select label="Motorikk" value={newEx.mot} onChange={(e) => setNewEx({ ...newEx, mot: e.target.value })} options={W().motorikk} />}
      <Select label="Belastning" value={newEx.bel} onChange={(e) => setNewEx({ ...newEx, bel: e.target.value })} options={W().belastning} />
      <Select label="Press" value={newEx.press} onChange={(e) => setNewEx({ ...newEx, press: e.target.value })} options={W().press} />
    </Sheet>}
    {newG && <Sheet open onClose={() => setNewG(null)} kicker={"Ny målsetning · " + who.name} title="Målsetning" footer={<><Button fullWidth icon="check" disabled={!newG.name.trim() || !newG.target.trim()} onClick={() => { setGoals([...goals, { id: "g" + Date.now(), type: newG.type, name: newG.name, param: newG.param, start: "—", now: "—", target: newG.target, from: "28.09.2026", to: "—", link: newG.link, pct: 0, src: newG.param.toUpperCase() }]); setNewG(null); K.toast("Målsetningen er lagt til", "FREMDRIFT HENTES AUTOMATISK"); }}>Lagre</Button><Button variant="ghost" fullWidth onClick={() => setNewG(null)}>Avbryt</Button></>}>
      <Segmented options={["Resultatmål", "Prosessmål"]} value={newG.type} onChange={(v) => setNewG({ ...newG, type: v })} fullWidth />
      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={{ font: "500 13px/1.3 var(--font-sans)", color: "var(--text-secondary)" }}>Hva</span><TextInput value={newG.name} onChange={(e) => setNewG({ ...newG, name: e.target.value })} placeholder="Putting 3–5 fot" /></label>
      <Select label="Måles på" value={newG.param} onChange={(e) => setNewG({ ...newG, param: e.target.value })} options={W().goalParams} />
      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}><span style={{ font: "500 13px/1.3 var(--font-sans)", color: "var(--text-secondary)" }}>Mål</span><TextInput value={newG.target} onChange={(e) => setNewG({ ...newG, target: e.target.value })} placeholder="45 av 50" /></label>
      <div role="radiogroup" aria-label="Knyttet til" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{W().goalLinks.map((l) => <ChoicePill key={l} role="radio" aria-checked={newG.link === l} selected={newG.link === l} onClick={() => setNewG({ ...newG, link: l })}>{l}</ChoicePill>)}</div>
      <M>START 28.09.2026 · SLUTT SETTES AV NIVÅET · FREMDRIFT FRA PLAN, STATS, TESTER OG RUNDER</M>
    </Sheet>}
    {pick && <Sheet open onClose={() => setPick(false)} kicker={mode === "gruppe" ? "Velg gruppe" : "Velg spiller"} title={mode === "gruppe" ? "Gruppe" : "Spiller"} footer={<Button variant="ghost" fullWidth onClick={() => setPick(false)}>Lukk</Button>}>
      <SearchField value={q} onChange={setQ} placeholder="Søk" />
      {!q && <><M>SIST BRUKT</M><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{W().recent.map((id) => { const x = [...W().players, ...W().groups].find((y) => y.id === id); return <ChoicePill key={id} onClick={() => { setMode(id[0] === "g" ? "gruppe" : "spiller"); setSubj(id); setPick(false); }}>{x.name}</ChoicePill>; })}</div></>}
      <div role="list">{list.filter((x) => x.name.toLowerCase().includes(q.toLowerCase())).map((x, i) => <button key={x.id} type="button" role="listitem" onClick={() => { setSubj(x.id); setPick(false); }} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", width: "100%", display: "flex", alignItems: "center", minHeight: 48, borderTop: i ? "1px solid var(--border-hairline)" : "none", font: (x.id === subj ? "600" : "400") + " 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{x.name}</button>)}</div>
    </Sheet>}
    {note && <Sheet open onClose={() => setNote(false)} kicker={"Coachnotat · " + who.name} title="Coachnotat" footer={<><Button fullWidth icon="check" onClick={() => { setNote(false); K.toast("Notatet er lagret", "BARE COACH SER DET"); }}>Lagre</Button><Button variant="ghost" fullWidth onClick={() => setNote(false)}>Avbryt</Button></>}>
      <textarea className="pa-input" rows={4} aria-label="Coachnotat" placeholder="Eksamen tirsdag 29.09. Hold mengden nede." style={{ width: "100%", boxSizing: "border-box", resize: "vertical", font: "var(--type-body)", minHeight: 96, padding: 12 }}></textarea>
      <M>BARE COACH SER NOTATET · KNYTTES TIL UKE {week}</M>
    </Sheet>}
  </K.Page>;
}
window.WB3_Workbench = Workbench;
})();
