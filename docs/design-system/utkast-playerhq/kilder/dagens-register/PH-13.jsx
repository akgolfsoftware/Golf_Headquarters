/* PH-13 Øvelsesbank · Precision 2.28.1 (09.10.2026, liste B). Kandidat.
   ExerciseBank som egen side (pyramiden som inngang, filter i ark under 1024 px og i sidepanel fra 1024). «Passer kategori D». Trykk på en øvelse åpner arket «Legg til i plan».
   Data: data/workbench.js (DRILLS, demodata).
   10.10.2026: «Ny øvelse» åpner skjemaet (ExerciseEditor, role spiller) i flaten med «Avbryt». «Lagre» krever lag, treningsområde og navn, og legger øvelsen først i banken
   (demotilstand, data/handling.js «ovelser»). Banken er innebygd (embedded): skjermen eier tittelen. Bredden måles i beholderen (H.useBox). */
(() => {
const NS = window.AKGolfPrecisionAthletics_7d7c29, H = window.AK_HOST;
function PH13({ state, setState, go }) {
  const { Gate, ExerciseBank, ExerciseEditor, PageHeader, LargeTitle, EmptyState, AddToPlanSheet, Button, InlineAlert } = NS, X = window.AK_HANDLING;
  const { cw } = H.useW(), W = window.AK_DATA.wb, narrow = cw < 600, [box, bw] = H.useBox(cw - 32);
  const formulas = X.use("formula:saved", []), [formula,setFormula] = React.useState(null);
  const egne = X.use("ovelser", []), tom = state === "tom" && !egne.length;
  const base = React.useState(() => W.DRILLS.map((d) => ({ ...NS.DrillToExercise(d), bilder: d.bilder })))[0];
  const ex = [...egne.map((d) => ({ ...NS.DrillToExercise(d), source: "egen" })), ...(state === "tom" ? [] : base)];
  const [open, setOpen] = React.useState(null), [attempts, setAttempts] = React.useState(0), [ny, setNy] = React.useState(false), [mangler, setMangler] = React.useState(null);
  const lagre = (x) => { const m = [!x.axis && "pyramidelag", !x.area && "treningsområde", !(x.title && x.title.trim()) && "navn"].filter(Boolean); if (m.length) { setMangler(m); return; }
    const d = { id: X.id("ov"), title: x.title.trim(), axes: [x.axis], min: x.min || 30, equipment: x.equipment || [], level: "D–G", place: "ute", area: x.area, dist: x.dist, purpose: x.purpose, egen: true,
      /* Alle kanoniske formelfelt følger øvelsen; undefined er ubesvart, null er eksplisitt «Hopp over». */
      laering: x.laering, speed: x.speed, sand: x.sand, miljo: x.miljo, press: x.press, sted: x.sted, maal: x.maal, fokus: x.fokus };
    X.add("ovelser", d, []); setNy(false); setMangler(null); setState("data"); H.toast("Øvelsen er lagret", "FØRST I BANKEN · " + X.demoMeta); };
  /* Antallet står i banken («128 øvelser»), ikke i sidehodet også. embedded skjuler ikke bankens eget hode i 2.32.1 (venter på Precision). */
  const total = ex.length, kicker = "KATEGORI D · TOBIAS LINDVIK";
  if (ny) return <NS.Page bottomInset={80}>
    <div><Button variant="ghost" icon="chevron-left" onClick={() => { setNy(false); setMangler(null); }}>Avbryt</Button></div>
    {narrow ? <LargeTitle title="Ny øvelse" kicker="ØVELSESBANK · TOBIAS LINDVIK" /> : <PageHeader title="Ny øvelse" kicker="ØVELSESBANK · TOBIAS LINDVIK" />}
    {mangler && <InlineAlert tone="warn" title="Øvelsen er ikke lagret">{"Mangler " + mangler.join(", ") + "."}</InlineAlert>}
    <div ref={box} style={{ minWidth: 0 }}><ExerciseEditor key={formula ? formula.id : "ny"} draftKey={formula ? "exercise:tobias-lindvik:" + formula.id : "exercise:tobias-lindvik"} initial={formula ? {...formula,axis:formula.pyramide,area:formula.omrade} : undefined} role="spiller" author="Tobias Lindvik" width={bw} onSave={lagre} /></div>
  </NS.Page>;
  return <NS.Page bottomInset={80}>
    {narrow ? <LargeTitle title="Øvelsesbank" kicker={kicker} /> : <PageHeader title="Øvelsesbank" kicker={kicker} />}
    <div><Button variant="secondary" icon="layers" onClick={()=>go("PH-FORMEL")}>Utforsk AK-formelen i 3D</Button></div>
    {formulas.length>0&&<section aria-label="Lagrede formler" style={{display:"grid",gap:12}}><h2 style={{font:"var(--type-title-s)",margin:0}}>Lagrede formler</h2>{formulas.map(f=><NS.Card key={f.id} title={f.omrade} meta={f.pyramide.toUpperCase()} actions={<Button variant="secondary" onClick={()=>{setFormula(f);setNy(true)}}>Lag øvelse fra formelen</Button>}><span style={{font:"var(--type-body-s)"}}>{[f.laering,f.miljo,f.sted,f.press,f.fokus].filter(Boolean).join(" · ")}</span></NS.Card>)}</section>}
    <Gate state={state === "tom" ? "data" : state} loading="Henter øvelsene …" attempts={attempts} onRetry={() => { setAttempts((n) => n + 1); setState("data"); }} error={{ title: "Kunne ikke hente øvelsene", text: "Tilkoblingen ble brutt. Ingen øvelser er endret.", code: "FEIL 503 · ØVELSESBANK · 05.10.2026 08:14" }}>
      {tom ? <EmptyState icon="layers" title="Ingen øvelser ennå" text="Lag din første øvelse, eller be coachen dele sine." action="Ny øvelse" actionIcon="plus" onAction={() => setNy(true)} />
        : <div ref={box} style={{ minWidth: 0 }}><ExerciseBank embedded exercises={ex} total={total} role="spiller" category="D" width={bw} onOpen={(x) => setOpen(W.DRILLS.find((d) => d.id === x.id) || egne.find((d) => d.id === x.id) || null)} onCreate={() => {setFormula(null);setNy(true)}} onPropose={() => go("PH-21")} /></div>}
    </Gate>
    {open && <AddToPlanSheet open={!!open} item={{ title: open.title, min: open.min }} date={W.TODAY} onClose={() => setOpen(null)} onConfirm={v => { const id=X.id("exercise-session"),hm=m=>String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0"); X.append("workbench:tobias-lindvik",{id,createId:id,title:open.title,start:v.date+"T"+hm(v.start),end:v.date+"T"+hm(v.start+(open.min||30)),axes:open.axes||["slag"],status:"utkast",own:true,exercises:[open.title]},W.ITEMS);setOpen(null);H.toast("Lagt inn i planen", "UTKAST · PUBLISER I WORKBENCH"); }} />}
  </NS.Page>;
}
window.AK_SCREENS["PH-13"] = { id: "PH-13", name: "Øvelsesbank", route: "/portal/planlegge/ovelser", Component: PH13 };
})();
