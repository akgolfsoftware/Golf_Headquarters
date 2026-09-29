(() => {
const { Button, AxisBadge, StatusPill, Icon, IconButton, Segmented, ChoicePill, Stepper, Input } = window.AKGolfPrecisionAthletics_7d7c29;
const { PageHead, Panel, pageWrap } = window.KIT;
const { useCW, toast, clock, Meta, Pills } = window.AOA;
const D = window.AOA_DATA, V = window.AK_VOCAB;
const AXES = [["fys", "FYS"], ["tek", "TEK"], ["slag", "SLAG"], ["spill", "SPILL"], ["turn", "TURN"]];
const GOLF = {
  Putting: { subs: V.PUTT_BANDS.map((b) => "Putting " + b + " fot"), unit: "antall putter", mål: [["Ballstart", "°", 1], ["Lengde", " ft", 2]] },
  Nærspill: { subs: V.AREAS.naerspill, unit: "antall slag", mål: [["Landingspunkt", " m", 1], ["Utrulling", " m", 2]] },
  Jernslag: { subs: ["Innspill ca. 200 m", "Innspill ca. 150 m", "Innspill ca. 100 m", "Innspill ca. 50 m"], unit: "antall slag", full: true, mål: [["Club Path", "°", 2], ["Face Angle", "°", 1], ["Carry", " m", 4]] },
  Driver: { subs: ["Utslag"], unit: "antall slag", full: true, mål: [["Club Path", "°", 2], ["Face to Path", "°", 2], ["Dispersion", " m", 15]] },
};
const up = (s) => s.toUpperCase().replace(/\s/g, "");
const subCode = (s) => s.startsWith("Innspill") ? "INNSPILL" + s.match(/\d+/)[0] : s.startsWith("Putting") ? "PUTTING" + s.replace("Putting ", "").replace(" fot", "").replace("–", "-").replace("+", "PLUSS") : up(s);
const fmt = (v) => String(v).replace(".", ",");
function Step({ n, title, children, aside }) {
  return <section style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 16, borderTop: "1px solid var(--border-hairline)" }}>
    <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}><Meta s={{ color: "var(--text-primary)" }}>{n}</Meta><span style={{ font: "600 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{title}</span>{aside && <Meta s={{ marginLeft: "auto" }}>{aside}</Meta>}</div>
    {children}
  </section>;
}
function Builder({ onAdd }) {
  const [axis, setAxis] = React.useState("slag");
  const [area, setArea] = React.useState("Jernslag");
  const [sub, setSub] = React.useState("Innspill ca. 100 m");
  const [ps, setPs] = React.useState(["P6.0", "P7.0"]);
  const [mot, setMot] = React.useState("Automatikk");
  const [dim, setDim] = React.useState("Lengdekontroll");
  const [mi, setMi] = React.useState(0);
  const [tol, setTol] = React.useState(2);
  const [qty, setQty] = React.useState(30);
  const [bel, setBel] = React.useState("Treningsområde");
  const [press, setPress] = React.useState("Observert");
  const [min, setMin] = React.useState(25);
  const [fa, setFa] = React.useState("Styrke");
  const [sets, setSets] = React.useState(3); const [reps, setReps] = React.useState(8); const [rir, setRir] = React.useState(2);
  const [holes, setHoles] = React.useState(9);
  const [turn, setTurn] = React.useState(V.TURN_TYPES[0][0]);
  const golf = axis === "tek" || axis === "slag";
  const G = GOLF[area];
  const pickArea = (a) => { setArea(a); const g = GOLF[a]; setSub(g.subs[0]); setMi(0); setTol(g.mål[0][2]); setQty(a === "Putting" ? 40 : 30); setDim(V.dimsFor(g.subs[0])[0]); };
  const pickSub = (s) => { setSub(s); const d = V.dimsFor(s); if (!d.includes(dim)) setDim(d[0]); };
  const togP = (p) => setPs((l) => l.includes(p) ? l.filter((x) => x !== p) : [...l, p].sort((a, b) => +a.slice(1) - +b.slice(1)));
  const m = G.mål[Math.min(mi, G.mål.length - 1)];
  const bp = axis === "turn" ? [] : [up(bel), up(press)];
  const code = axis === "turn" ? "TURN_" + up(turn) : axis === "fys" ? ["FYS", up(fa), up(bel), up(press)].join("_") : axis === "spill" ? ["SPILL", "BANESPILL", ...bp].join("_") : [axis.toUpperCase(), subCode(sub), G.full ? V.MOTOR_CODE[mot] : null, ...bp].filter(Boolean).join("_");
  const pRange = ps.length ? (ps.length > 2 ? ps.join(" ") : ps.join("–")) : null;
  const name = axis === "turn" ? turn : axis === "fys" ? fa : axis === "spill" ? holes + " hull · " + dim : sub + " · " + dim;
  const desc = axis === "turn" ? V.TURN_TYPES.find((t) => t[0] === turn)[1] : axis === "fys" ? `${sets} × ${reps} · RIR ${rir}` : axis === "spill" ? `${holes} hull · ${bel}` : [pRange && G.full ? pRange : null, `${qty} ${G.unit.replace("antall ", "")}`, `±${fmt(tol)}${m[1]} ${m[0]}`].filter(Boolean).join(" · ");
  const setAx = (a) => { setAxis(a); if (a === "spill") { setDim("Strategioppgave"); setBel("Bane"); setMin(120); } else if (a === "fys") { setBel("Innendørs"); setMin(20); } else if (a === "turn") setMin(240); else { setBel("Treningsområde"); setDim(V.dimsFor(sub)[0]); setMin(25); } };
  return <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <Step n="01" title="Pyramide">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(88px,1fr))", gap: 8 }}>{AXES.map(([k, l]) => <ChoicePill key={k} axis={k} selected={axis === k} onClick={() => setAx(k)} style={{ minWidth: 0 }}>{l}</ChoicePill>)}</div>
    </Step>
    {golf && <>
      <Step n="02" title="Golfområde">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,110px),1fr))", gap: 8 }}>{Object.keys(GOLF).map((a) => <ChoicePill key={a} selected={area === a} onClick={() => pickArea(a)}>{a}</ChoicePill>)}</div>
        {G.subs.length > 1 && <Pills>{G.subs.map((s) => <ChoicePill key={s} selected={sub === s} onClick={() => pickSub(s)}>{s.replace("Putting ", "")}</ChoicePill>)}</Pills>}
      </Step>
      {G.full && <Step n="03" title="MORAD-læringstrinn" aside={pRange ? pRange + " · " + V.P.find((p) => p[0] === ps[0])[1] : "VELG P-POSISJON"}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(64px,1fr))", gap: 8 }}>{V.P.map(([p, l]) => <ChoicePill key={p} mono selected={ps.includes(p)} onClick={() => togP(p)} title={l}>{p}</ChoicePill>)}</div>
        <Pills>{V.MOTORIKK.map((x) => <ChoicePill key={x} selected={mot === x} onClick={() => setMot(x)}>{x}</ChoicePill>)}</Pills>
      </Step>}
      <Step n={G.full ? "04" : "03"} title="Teknisk dimensjon og restmål" aside="ÉN DIMENSJON PER ØVELSE">
        <Pills>{V.dimsFor(sub).map((d) => <ChoicePill key={d} selected={dim === d} onClick={() => setDim(d)}>{d}</ChoicePill>)}</Pills>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <Pills>{G.mål.map(([k], i) => <ChoicePill key={k} selected={mi === i} onClick={() => { setMi(i); setTol(G.mål[i][2]); }}>{k}</ChoicePill>)}</Pills>
          <Stepper size="sm" label="Toleranse" value={tol} step={m[1] === "°" ? 0.5 : 1} min={0.5} max={30} format={(v) => "±" + fmt(v) + m[1]} onChange={setTol} />
        </div>
      </Step>
      <Step n={G.full ? "05" : "04"} title="Mengde">
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}><Stepper label={G.unit[0].toUpperCase() + G.unit.slice(1)} value={qty} step={5} min={5} max={200} onChange={setQty} /><Stepper label="Minutter" value={min} step={5} min={5} max={180} unit="min" onChange={setMin} /></div>
      </Step>
    </>}
    {axis === "fys" && <Step n="02" title="Område og mengde">
      <Pills>{V.AREAS.fysisk.map((a) => <ChoicePill key={a} selected={fa === a} onClick={() => setFa(a)}>{a}</ChoicePill>)}</Pills>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}><Stepper size="sm" label="Serier" value={sets} min={1} max={8} onChange={setSets} /><Stepper size="sm" label="Repetisjoner" value={reps} min={1} max={30} onChange={setReps} /><Stepper size="sm" label="Minutter" value={min} step={5} min={5} max={120} unit="min" onChange={setMin} /></div>
      <span className="kicker">RIR</span>
      <Pills>{[0, 1, 2, 3, 4].map((r) => <ChoicePill key={r} mono selected={rir === r} onClick={() => setRir(r)}>{r}</ChoicePill>)}</Pills>
    </Step>}
    {axis === "spill" && <Step n="02" title="Banespill">
      <Pills>{V.DIMENSIONS.banespill.map((d) => <ChoicePill key={d} selected={dim === d} onClick={() => setDim(d)}>{d}</ChoicePill>)}</Pills>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}><Stepper label="Antall hull" value={holes} step={1} min={1} max={18} onChange={setHoles} /><Stepper label="Minutter" value={min} step={15} min={15} max={300} unit="min" onChange={setMin} /></div>
    </Step>}
    {axis === "turn" && <Step n="02" title="Turneringstype">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{V.TURN_TYPES.map(([t, d]) => <ChoicePill key={t} selected={turn === t} onClick={() => setTurn(t)} style={{ justifyContent: "flex-start", textAlign: "left", height: "auto", minHeight: 56, padding: "10px 14px" }}><span style={{ display: "flex", flexDirection: "column", gap: 2 }}><span>{t}</span><span style={{ font: "var(--type-body-s)", opacity: .8 }}>{d}</span></span></ChoicePill>)}</div>
    </Step>}
    {axis !== "turn" && <Step n="→" title="Belastning og press">
      <Pills>{V.BELASTNING.map((b) => <ChoicePill key={b} selected={bel === b} onClick={() => setBel(b)}>{b}</ChoicePill>)}</Pills>
      <Pills>{V.PRESS.map((b) => <ChoicePill key={b} selected={press === b} onClick={() => setPress(b)}>{b}</ChoicePill>)}</Pills>
    </Step>}
    <div style={{ background: "var(--surface-sunken)", borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
      <Meta>AK-FORMELEN · PYRAMIDE_OMRÅDE_MOTORIKK_BELASTNING_PRESS</Meta>
      <div style={{ font: "600 15px/1.35 var(--font-mono)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{code}</div>
      <div style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>{name} · {desc}</div>
      <div style={{ display: "flex" }}><Button variant="primary" icon="plus" onClick={() => onAdd({ axis, name, code, desc, min })}>Legg til øvelse</Button></div>
    </div>
  </div>;
}
function Catalog({ onAdd }) {
  const [f, setF] = React.useState("alle");
  const list = D.catalog.filter((c) => f === "alle" || c.axis === f);
  return <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <Pills><ChoicePill selected={f === "alle"} onClick={() => setF("alle")}>Alle · {D.catalog.length}</ChoicePill>{AXES.map(([k, l]) => <ChoicePill key={k} axis={k} selected={f === k} onClick={() => setF(k)}>{l}</ChoicePill>)}</Pills>
    <Meta>DRA EN ØVELSE INN I ØKTA, ELLER TRYKK +</Meta>
    <div>{list.map((c, i) => <div key={c.code} draggable onDragStart={(e) => { e.dataTransfer.setData("application/x-ak-drag", c.code); e.dataTransfer.effectAllowed = "copy"; }} style={{ cursor: "grab", display: "flex", gap: 12, alignItems: "center", padding: "12px 0", borderBottom: i === list.length - 1 ? "none" : "1px solid var(--border-hairline)", minWidth: 0 }}>
      <AxisBadge axis={c.axis} />
      <div style={{ flex: 1, minWidth: 0 }}><div style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{c.name}</div><div style={{ font: "var(--type-meta)", color: "var(--text-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.code}</div><div style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", marginTop: 2 }}>{c.desc} · {c.min} min</div></div>
      <IconButton icon="plus" label={"Legg til " + c.name} variant="secondary" onClick={() => onAdd(c)} />
    </div>)}</div>
  </div>;
}
function OktBygger() {
  const { mob, cw } = useCW();
  const { SortableList, DropZone, MoveSheet, UndoToast, ConfirmDialog, ActionBar } = window.AKGolfPrecisionAthletics_7d7c29;
  const PARTS = [["opp", "Oppvarming"], ["hoved", "Hoveddel"], ["avs", "Avslutning"]];
  const GOALS = ["Restmål ±3 m", "8 av 10 innenfor vindu", "Samme rutine hvert slag", "Puls under 140 før slag"];
  const [mode, setMode] = React.useState("bygg");
  const [ex, setEx] = React.useState([{ ...D.catalog[0], k: "s0", part: "opp" }, { ...D.catalog[5], k: "s1", part: "hoved" }]);
  const [goals, setGoals] = React.useState(["Restmål ±3 m"]);
  const [title, setTitle] = React.useState("Wedge og lengdekontroll");
  const [to, setTo] = React.useState("spiller");
  const [pl, setPl] = React.useState("Ingrid Berg");
  const [gr, setGr] = React.useState("WANG Toppidrett");
  const [sent, setSent] = React.useState(null), [undo, setUndo] = React.useState(null), [mvI, setMvI] = React.useState(null), [mvTo, setMvTo] = React.useState(null), [pub, setPub] = React.useState(false), [addPart, setAddPart] = React.useState("hoved");
  const snap = (msg, meta) => { const before = ex, g0 = goals; setUndo({ msg, meta, fn: () => { setEx(before); setGoals(g0); } }); };
  const add = (e, part = addPart) => { snap(e.name + " lagt til", PARTS.find((p) => p[0] === part)[1].toUpperCase()); setEx((l) => [...l, { ...e, k: "s" + Date.now(), part }]); setSent(null); };
  const addCode = (code, part) => { const c = D.catalog.find((x) => x.code === code); if (c) add(c, part); else { const k = code; setEx((l) => { const it = l.find((x) => x.k === k); if (!it || it.part === part) return l; snap(it.name + " flyttet", PARTS.find((p) => p[0] === part)[1].toUpperCase()); return [...l.filter((x) => x.k !== k), { ...it, part }]; }); } };
  const rm = (k) => { const it = ex.find((x) => x.k === k); snap(it.name + " fjernet", "KAN ANGRES"); setEx((l) => l.filter((x) => x.k !== k)); };
  const reorder = (part, ids) => { snap("Rekkefølgen er endret", PARTS.find((p) => p[0] === part)[1].toUpperCase()); setEx((l) => [...l.filter((x) => x.part !== part), ...ids.map((id) => l.find((x) => x.k === id))]); };
  const total = ex.reduce((s, e) => s + e.min, 0);
  const n = D.groups.find((g) => g[0] === gr)[1];
  const cta = to === "spiller" ? "Send til " + pl : to === "gruppe" ? "Send til " + gr + " · " + n : "Lagre som mal";
  const send = () => { const t = clock(); setSent(t); setPub(false); toast(to === "mal" ? "«" + title + "» lagret som mal" : "«" + title + "» sendt til " + (to === "spiller" ? pl : gr), (to === "mal" ? "MALBIBLIOTEK" : "PLANLAGT I PLAYERHQ") + " · " + t); };
  const wide = cw > 1100;
  const axes = [...new Set(ex.map((e) => e.axis))];
  const mvItem = mvI && ex.find((x) => x.k === mvI);
  return <div style={pageWrap}>
    <PageHead kicker="AG-14 · Øktbygger og øvelsesbank" title="Øktbygger" sub="Dra øvelser fra banken inn i oppvarming, hoveddel eller avslutning. Alt kan også gjøres med knapper og tastatur." />
    <div style={{ display: "grid", gridTemplateColumns: wide ? "minmax(0,1fr) 420px" : "minmax(0,1fr)", gap: 16, alignItems: "start" }}>
      <Panel kicker={mode === "bygg" ? "Ny øvelse" : "Øvelsesbank"} title={mode === "bygg" ? "Bygg øvelse" : D.catalog.length + " lagrede øvelser"} action={<Segmented options={[{ value: "bygg", label: "Bygg ny" }, { value: "katalog", label: "Bank" }]} value={mode} onChange={setMode} />}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><Meta>+ LEGGER TIL I</Meta><Pills>{PARTS.map(([v, l]) => <ChoicePill key={v} selected={addPart === v} onClick={() => setAddPart(v)}>{l}</ChoicePill>)}</Pills></div>
        {mode === "bygg" ? <Builder onAdd={(e) => add(e)} /> : <Catalog onAdd={(e) => add(e)} />}
      </Panel>
      <div style={{ position: wide ? "sticky" : "static", top: 16, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
        <Panel kicker="Økt" title={<span style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>{ex.length} øvelser <Meta>{total} MIN</Meta></span>} action={<div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{axes.map((a) => <AxisBadge key={a} axis={a} />)}</div>}>
          <Input label="Tittel" value={title} onChange={(e) => setTitle(e.target.value)} />
          <DropZone label="Mål og arbeidskrav" accept={["application/x-ak-goal"]} onDrop={(g) => { if (!goals.includes(g)) { snap("Arbeidskrav lagt til", g.toUpperCase()); setGoals((l) => [...l, g]); } }} empty="DRA ET ARBEIDSKRAV HIT, ELLER VELG UNDER">
            {goals.length > 0 && <Pills>{goals.map((g) => <ChoicePill key={g} selected onClick={() => { snap("Arbeidskrav fjernet", g.toUpperCase()); setGoals((l) => l.filter((x) => x !== g)); }}>{g} ×</ChoicePill>)}</Pills>}
          </DropZone>
          <Pills>{GOALS.filter((g) => !goals.includes(g)).map((g) => <span key={g} draggable onDragStart={(e) => e.dataTransfer.setData("application/x-ak-goal", g)}><ChoicePill onClick={() => { snap("Arbeidskrav lagt til", g.toUpperCase()); setGoals((l) => [...l, g]); }}>+ {g}</ChoicePill></span>)}</Pills>
          {PARTS.map(([pid, pl2]) => { const items = ex.filter((e) => e.part === pid).map((e) => ({ ...e, id: e.k, label: e.name }));
            return <div key={pid} style={{ display: "flex", flexDirection: "column", gap: 6 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span className="kicker">{pl2}</span><Meta>{items.reduce((s, e) => s + e.min, 0)} MIN</Meta></div>
              <DropZone label={pl2} accept={["application/x-ak-drag", "application/x-ak-part"]} onDrop={(code) => addCode(code, pid)} empty={"DRA ØVELSER HIT · ELLER + I BANKEN"}>
                {items.length > 0 && <SortableList label={pl2} dragType="application/x-ak-part" items={items} onReorder={(ids) => reorder(pid, ids)} onMove={(it) => { setMvI(it.id); setMvTo(null); }} renderItem={(e, c) => <div style={{ display: "flex", gap: 4, alignItems: "center", minHeight: 52, boxShadow: "inset 3px 0 0 var(--axis-" + e.axis + ")", background: c.dragging ? "var(--surface-sunken)" : "var(--surface-card)", borderRadius: "var(--radius-inner)", minWidth: 0 }}>
                  {c.handle}
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{e.name}</div><Meta s={{ overflowWrap: "anywhere", whiteSpace: "normal", display: "block" }}>{e.min} MIN · {e.code}</Meta></div>
                  {c.moveButton}
                  <IconButton icon="x" label={"Fjern " + e.name} size="sm" onClick={() => rm(e.k)} />
                </div>} />}
              </DropZone></div>; })}
        </Panel>
        <Panel kicker="Tildeling" title="Hvem får økta">
          <Segmented options={[{ value: "spiller", label: "Én spiller" }, { value: "gruppe", label: "Gruppe" }, { value: "mal", label: "Mal" }]} value={to} onChange={(v) => { setTo(v); setSent(null); }} fullWidth />
          {to === "spiller" && <Pills>{D.players.map((p) => <ChoicePill key={p} selected={pl === p} onClick={() => { setPl(p); setSent(null); }}>{p}</ChoicePill>)}</Pills>}
          {to === "gruppe" && <Pills>{D.groups.map(([g, c]) => <ChoicePill key={g} selected={gr === g} onClick={() => { setGr(g); setSent(null); }}>{g} · {c}</ChoicePill>)}</Pills>}
          {to === "mal" && <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Lagres i malbiblioteket. Kan gjenbrukes i Workbench og av Caddie.</p>}
          {sent ? <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}><StatusPill tone="ok">{to === "mal" ? "Lagret" : "Publisert"}</StatusPill><Meta>{sent} · {to === "mal" ? "MALBIBLIOTEK" : "PLANLAGT I PLAYERHQ"}</Meta></div>
            : <ActionBar secondary={<Button variant="secondary" icon="bookmark" disabled={!ex.length} onClick={() => toast("Utkastet er lagret", "IKKE SENDT")}>Lagre utkast</Button>} primary={<Button variant="primary" icon={to === "mal" ? "bookmark" : "send"} disabled={!ex.length} onClick={() => to === "mal" ? send() : setPub(true)}>{cta}</Button>} />}
          <Meta>{to === "mal" ? "SYNLIG FOR ALLE COACHER I AK GOLF HQ" : "ØKTA FÅR STATUS PLANLAGT"}</Meta>
        </Panel>
      </div>
    </div>
    <MoveSheet open={!!mvItem} onClose={() => setMvI(null)} item={mvItem && mvItem.name} title="Flytt øvelse" targets={PARTS.map(([v, l]) => ({ id: v, label: l, meta: ex.filter((e) => e.part === v).length + " ØVELSER", disabled: mvItem && mvItem.part === v }))} value={mvTo} onChange={setMvTo} onConfirm={() => { addCode(mvI, mvTo); setMvI(null); }} />
    <ConfirmDialog open={pub} kind="publish" title={cta + "?"} confirmLabel="Publiser" consequences={[ex.length + " øvelser, " + total + " min.", to === "gruppe" ? n + " spillere får økta i Plan." : pl + " får økta i Plan og varsel."]} onCancel={() => setPub(false)} onConfirm={send} />
    <UndoToast open={!!undo} message={undo ? undo.msg : ""} meta={undo ? undo.meta : ""} onUndo={undo ? () => { undo.fn(); setUndo(null); } : undefined} onClose={() => setUndo(null)} />
  </div>;
}
window.OktBygger = OktBygger;
})();
