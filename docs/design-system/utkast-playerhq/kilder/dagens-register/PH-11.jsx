/* PH-11 Workbench for spilleren · familie 2 · Kandidat 06.10.2026 · Precision v2.19.0 (ExerciseBank og ExerciseCard for øvelsesbanken, TournamentEditor for turnering).
   Én fil for alle PH-11-skjermene i familien. Alt er Calendar variant="workbench" (D-21) og komponentene i calendar/, library/ og session/.
   Adresse: felles/screen.html?s=PH-11-UKE&w=1440[&v=variant]. Data: data/workbench.js (uke 41, 5.–11. okt. 2026). */
(() => {
const NS = window.AKGolfPrecisionAthletics_7d7c29, H = window.AK_HOST, WB = window.AK_WB, wb = () => window.AK_DATA.wb;
const { Bench, Steg, NyArsplan } = WB;
const reg = (id, name, Component, extra) => { window.AK_SCREENS[id] = { id, name, route: "/portal/planlegge/workbench", Component, ...extra }; };
const useConst = (f) => React.useState(f)[0];
const EMPTY = [];

/* PH-11-UKE · startvisningen fra 1024 px. Varianter: forste · delvis · lagringsfeil */
function Uke({ state, setState, variant, view, openFirst, go }) {
  const { mob } = H.useW(), D = wb();
  const v = view || (mob && !variant && view !== "uke" ? "uke" : "uke");
  const [first, setFirst] = React.useState(!!openFirst);
  const base = useConst(() => D.ITEMS);
  if (variant === "forste") return <Bench state={state} setState={setState} title="Workbench · ingen årsplan ennå" items={EMPTY} periods={EMPTY} view="uke" newSession={false}
    firstTime onCreatePlan={() => setFirst(true)}>
    <NyArsplan open={first} onClose={() => setFirst(false)} group={D.G} onPick={k=>{window.AK_HANDLING.set("year-plan:tobias-lindvik",{from:k,status:"utkast",periods:k==="gruppe"?D.PERIODS:[]});setFirst(false);go(k==="mal"?"PH-12":"PH-11-AR");}} />
  </Bench>;
  if (variant === "delvis") return <Bench state={state} setState={setState} items={useConst(() => D.ITEMS.filter((x) => x.source !== "Google"))} view={v} partial={["google"]} />;
  if (variant === "lagringsfeil") return <Lagringsfeil state={state} setState={setState} />;
  return <Bench state={state} setState={setState} items={base} view={v} />;
}
function Lagringsfeil({ state, setState }) {
  const D = wb();
  const moved = useConst(() => D.ITEMS.map((x) => (x.id === "u-tir" ? { ...x, ...D.T(D.O(7), "17:45", "18:45") } : x)));
  const [items, setItems] = React.useState(moved), [open, setOpen] = React.useState(true);
  return <Bench state={state} setState={setState} items={items} view="uke">
    {state === "data" && <NS.UndoToast open={open} message="Flyttingen kunne ikke lagres" meta="PUTTING 3–5 FOT · TIR → ONS KL. 17:45 · FEIL 503 · 14:20" duration={600000}
      onUndo={() => { setItems(D.ITEMS); setOpen(false); H.toast("Økta står der den sto", "PUTTING 3–5 FOT · TIR 6. OKT. KL. 17:45"); }} onClose={() => setOpen(false)} />}
  </Bench>;
}

/* PH-11-DAG · startvisningen på 390 */
const Dag = ({ state, setState }) => <Bench state={state} setState={setState} items={useConst(() => wb().ITEMS)} view="dag" />;
/* PH-11-MND · månedsplan for oktober (D-27) */
function Maned({state,setState}) {const X=window.AK_HANDLING,key="month:spiller:tobias-lindvik",month=X.use(key,wb().MONTH);return <Bench state={state} setState={setState} items={useConst(()=>wb().ITEMS)} view="maned" monthPlan={{...month,onChange:v=>X.set(key,{...month,...v})}}/>;}

/* PH-11-PER · Grunnperiode 2, uke 44–51 */
const Periode = ({ state, setState }) => <Bench state={state} setState={setState} items={useConst(() => wb().ITEMS)} view="periode" date="2026-10-26" />;
/* PH-11-AR · sesong uke 40–39, perioder fra gruppa merket «Fra gruppa» (D-26) */
const Ar = ({ state, setState }) => <Bench state={state} setState={setState} items={useConst(() => wb().ITEMS)} periods={window.AK_HANDLING.use("year-plan:tobias-lindvik",{}).periods} view="ar" />;
/* PH-11-PANEL · Planlagt mot registrert (sidepanel fra 1024 px, ark under) */
const Panel = ({ state, setState }) => <Bench state={state} setState={setState} items={useConst(() => wb().ITEMS)} view="uke" weekOnMobile panel="plan" />;
/* PH-11-PUBLISER · «Publiser · 4» med publiseringsarket (D-22) */
/* Publisering gjelder uka, også på mobil (weekOnMobile). */
const Publiser = ({ state, setState }) => <Bench state={state} setState={setState} items={useConst(() => wb().ITEMS)} view="uke" weekOnMobile initialPublishOpen />;

/* PH-11-BIBLIOTEK · øvelsesbanken som sidepanel (fra 1024 px), «Legg til» med ark på mobil. Varianter: standard (arket «Legg til» åpent under 1024 px) · bank (arket lukket, øvelsesbanken åpen) */
function Bibliotek({ state, setState, variant }) {
  const { mob, desk } = H.useW(), D = wb();
  const dropped = { id: "dr-tir", title: "Innspill 100–150 m", ...D.T(D.O(6), "15:00", "16:00"), axes: ["slag"], status: "utkast", own: true, player: "tl", exercises: ["Innspill 100–150 m"] };
  const [items, setItems] = React.useState(() => (desk ? [...D.ITEMS, dropped] : D.ITEMS));
  const [lib, setLib] = React.useState(true), [add, setAdd] = React.useState(desk || variant === "bank" ? null : D.DRILLS[1]), [toast, setToast] = React.useState(desk);
  const isComp = (d) => D.ALLDAY.some((e) => e.kind === "turnering" && e.from <= d && e.to >= d);
  const confirm = ({ date, start, item }) => { const x = { id: "dr-" + Date.now(), title: item.title, axes: item.axes, start: date + "T" + String(Math.floor(start / 60)).padStart(2, "0") + ":" + String(start % 60).padStart(2, "0"), end: date + "T" + String(Math.floor((start + (item.min || 60)) / 60)).padStart(2, "0") + ":" + String((start + (item.min || 60)) % 60).padStart(2, "0"), status: "utkast", own: true, player: "tl" }; setItems((l) => [...l, x]); setAdd(null); H.toast("«" + item.title + "» er lagt inn som utkast", "PUBLISER NÅR UKA ER KLAR"); };
  const ex = useConst(() => D.DRILLS.map((d) => ({ ...NS.DrillToExercise(d), bilder: d.bilder })));
  const libEl = <H.Fit><NS.ExerciseBank exercises={ex} total={ex.length} role="spiller" category="D" draggable={desk} embedded onOpen={(x) => setAdd(D.DRILLS.find((d) => d.id === x.id))} /></H.Fit>;
  return <Bench state={state} setState={setState} title="Workbench · øvelsesbanken" items={items} view={mob ? "dag" : "uke"} date={mob ? D.O(6) : undefined}
    actions={<WB.Act icon="layers" label="Øvelser" pressed={lib} onClick={() => setLib(!lib)} />}
    side={desk && lib && state === "data" ? <aside aria-label="Øvelsesbanken" style={{ width: 340, flex: "none", minWidth: 0 }}>{libEl}</aside> : null}>
    {!desk && <NS.Sheet open={lib && !add && state === "data"} onClose={() => setLib(false)} kicker="Øvelsesbanken" title="Legg til øvelse">{libEl}</NS.Sheet>}
    {state === "data" && <NS.AddToPlanSheet open={!!add} item={add} date={D.O(6)} time={15 * 60} isCompetitionDay={isComp} marks={D.MARKS} today={D.TODAY} onClose={() => setAdd(null)} onConfirm={confirm} />}
    {toast && state === "data" && <NS.UndoToast open message="«Innspill 100–150 m» er lagt inn som utkast tir. 6. okt. kl. 15:00" meta="DRATT FRA ØVELSESBANKEN · KAN ANGRES" duration={600000} onUndo={() => { setItems(D.ITEMS); setToast(false); }} onClose={() => setToast(false)} />}
  </Bench>;
}

/* PH-11-GJENTA · «Hver tirsdag kl. 15:00 til 15. des.», én kolliderer med konkurransedag. D-31: dagene med WeekdayPicker og siste dato med DateField + DatePicker, begge inne i RecurrenceSheet (2.16.1). Merkene viser konkurransedager, testdager og perioder. */
function Gjenta({ state, setState }) {
  const D = wb();
  const it = { id: "dr-tir", title: "Innspill 100–150 m", ...D.T(D.O(6), "15:00", "16:00"), axes: ["slag"], status: "utkast", own: true, player: "tl" };
  const [items, setItems] = React.useState(() => [...D.ITEMS, it]), [open, setOpen] = React.useState(true);
  return <Bench state={state} setState={setState} title="Workbench · gjenta økt" items={items} view="uke"
    actions={<WB.Act icon="rotate-cw" label="Gjenta" onClick={() => setOpen(true)} />}>
    {state === "data" && <NS.RecurrenceSheet open={open} item={{ title: it.title, start: it.start }} periodEnd="2026-12-20" initial={{ rule: "uke", end: "dato", until: "2026-12-15" }} collides={D.collides} marks={D.MARKS} today={D.TODAY}
      onClose={() => setOpen(false)} onConfirm={({ dates, skipped }) => { setItems((l) => [...l.map((x) => (x.id === it.id ? { ...x, series: "rs1" } : x)), ...dates.map((d) => ({ ...it, id: "rs-" + d, start: d + "T15:00", end: d + "T16:00", series: "rs1" }))]); setOpen(false); H.toast(dates.length + " økter er lagt inn som utkast", skipped.length ? skipped.length + " HOPPET OVER · KONKURRANSEDAG 17. NOV." : "INGEN HOPPET OVER"); }} />}
  </Bench>;
}

/* PH-11-FORSLAG · samlet forslag fra coachen (D-23), Godta alle og Angre (D-24). Varianter: for · etter */
function Forslag({ state, setState, variant }) {
  const D = wb(), after = variant === "etter";
  const [st, setSt] = React.useState(() => Object.fromEntries(D.BUNDLE.map((b) => [b.id, after ? "godtatt" : "venter"])));
  const [open, setOpen] = React.useState(true);
  const items = React.useMemo(() => D.ITEMS.map((x) => { const b = D.BUNDLE.find((y) => y.id === x.id); if (!b) return x; const s = st[b.id];
    const p = { ...b.at, from: D.AK, reason: b.reason, changes: b.changes, sentAt: "I DAG 09:12", status: s };
    return s === "godtatt" ? { ...x, ...b.at, status: "publisert", own: false, proposal: { ...p, prevStart: x.start, prevEnd: x.end, answeredAt: "I DAG 14:20" } } : { ...x, status: "publisert", own: false, proposal: s === "venter" ? p : { ...p, answeredAt: "I DAG 14:20" } }; }), [st]);
  const set = (id, s) => setSt((o) => ({ ...o, [id]: s }));
  const waiting = Object.values(st).filter((s) => s === "venter").length;
  return <Bench state={state} setState={setState} title="Workbench · forslag fra coach" items={items} view="uke" date={D.O(6)}
    actions={<WB.Act icon="inbox" label={waiting ? "Forslag · " + waiting : "Forslag"} onClick={() => setOpen(true)} />}>
    {state === "data" && <NS.Sheet open={open} onClose={() => setOpen(false)} kicker="Fra coach" title="Forslag til uke 41">
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <NS.ProposalCard from={D.AK} title="3 endringer i uke 41 fra Anders Kristiansen" sentAt="I DAG 09:12" items={D.BUNDLE.map((b) => ({ ...b, status: st[b.id], started: false }))}
          onAccept={(id) => { set(id, "godtatt"); H.toast("Forslaget er godtatt", "ANDERS KRISTIANSEN FÅR VARSEL"); }} onReject={(id) => { set(id, "avvist"); H.toast("Forslaget er avvist", "ANDERS KRISTIANSEN FÅR VARSEL"); }}
          onUndo={(id) => { set(id, "angret"); H.toast("Coachens endring er angret", "ØKTA ER TILBAKE · ANDERS KRISTIANSEN FÅR VARSEL"); }} onAcceptAll={(ids) => { ids.forEach((id) => set(id, "godtatt")); H.toast(ids.length + " forslag er godtatt", "ANDERS KRISTIANSEN FÅR VARSEL"); }} />
        <p data-varsel-tekst="" style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>Du kan angre coachens endring helt til økta starter. Anders Kristiansen får varsel når du godtar, avviser eller angrer.</p>
      </div>
    </NS.Sheet>}
  </Bench>;
}

/* PH-11-START · forhåndsvisning → Start økt → gjennomføring med slagteller → avslutning → «Gjennomført» i uka (D-28). Varianter: forhand · live · avslutning · etter */
function Start({ state, setState, variant }) {
  const D = wb(), { mob } = H.useW();
  const [step, setStep] = React.useState(variant || "forhand"), [reg, setReg] = React.useState(84);
  const done = React.useMemo(() => D.ITEMS.map((x) => (x.id === "s-man-slag" ? { ...x, status: "gjennomfort", registered: reg, results: ["Innenfor 8 m: 13 av 20 · 9-jern og PW", "Innenfor 10 m: 9 av 20 · 7-jern"] } : x)), [reg]);
  const base = useConst(() => D.ITEMS);
  if (step === "forhand") return <Bench state={state} setState={setState} title="Workbench · dagens økt" items={base} view={mob ? "dag" : "uke"} initialPreview={{ id: "s-man-slag", mode: "pin" }} onStart={() => setStep("live")} />;
  if (step === "etter") return <Bench state={state} setState={setState} title="Workbench · økta er gjennomført" items={done} view={mob ? "dag" : "uke"} initialPreview={{ id: "s-man-slag", mode: "pin" }} />;
  return <Steg state={state} setState={setState} loading="Henter Innspill 100–150 m …">
    <NS.LiveSession key={step} session={D.GOLF} exercises={D.GOLF_EX} initialIndex={step === "avslutning" ? 3 : 1} initialElapsed={step === "avslutning" ? 5040 : 1500} initialResults={{ e2: [true, false, true, true, false, true, true], ...(step === "avslutning" ? { e3: [true, false, true, false, true] } : {}) }}
      initialWrapUp={step === "avslutning"} onSave={(v) => { window.AK_HANDLING.completeSession("s-man-slag",v);setReg((v && v.actualMin) || 84); setStep("etter"); H.toast("Økta er lagret", "GJENNOMFØRT · REGISTRERT I UKA"); }} />
  </Steg>;
}

/* PH-11-FYS · fysisk økt i samme kalender (FYS), SetLogger og pausetimer (D-29). I dag er satt til onsdag 7. okt. kl. 06:30. Varianter: kalender · live */
function Fys({ state, setState, variant }) {
  const D = wb(), { mob } = H.useW();
  const [step, setStep] = React.useState(variant || "kalender");
  const items = useConst(() => D.ITEMS.map((x) => (x.id === "u-ons-fys" ? { ...x, status: "publisert", place: "WANG treningssal", goal: "4 × 6 @ 60 kg, RIR 2" } : x)));
  if (step === "kalender") return <Bench state={state} setState={setState} title="Workbench · fysisk økt" items={items} view={mob ? "dag" : "uke"} today={D.O(7)} now={6 * 60 + 30} initialPreview={{ id: "u-ons-fys", mode: "pin" }} onStart={() => setStep("live")} />;
  return <Steg state={state} setState={setState} loading="Henter Beinstyrke …">
    <NS.LiveSession session={D.FYS} exercises={D.FYS_EX} initialIndex={1} initialElapsed={980} onSave={v => { window.AK_HANDLING.completeSession("u-ons-fys",v); setStep("kalender"); H.toast("Økta er lagret", "BEINSTYRKE · GJENNOMFØRT"); }} />
  </Steg>;
}

/* PH-11-TURNERING · turnering i heldagsraden (D-30) og varsel ved økt på konkurransedag. Varianter: ny · varsel */
function Turnering({ state, setState, variant }) {
  const D = wb(), ny = variant !== "varsel";
  const without = D.ALLDAY.filter((e) => e.id !== "t-holt" && e.id !== "r-holt");
  const [allDay, setAllDay] = React.useState(ny ? without : D.ALLDAY), [open, setOpen] = React.useState(ny);
  const items = useConst(() => D.ITEMS);
  /* TournamentEditor (2.23.1, TournamentValue): onSave gir name, goals, place, from, to, travelBefore, travelAfter, rounds og type regnet ut av målene (D-53). Navn, mål, sted, første og siste dag, reisedager og antall runder. */
  const save = (v) => { const ev = [{ id: "t-ny", kind: "turnering", title: v.name, from: v.from, to: v.to, goals: v.goals, type: v.type }, ...(v.travelBefore ? [{ id: "r-ny", kind: "reise", title: "Reise til " + v.name.split(" ")[0], from: D.add(v.from, -1), to: D.add(v.from, -1) }] : []), ...(v.travelAfter ? [{ id: "r-ny2", kind: "reise", title: "Hjemreise", from: D.add(v.to, 1), to: D.add(v.to, 1) }] : [])];
    setAllDay([...without, ...ev]);window.AK_HANDLING.set("calendar-all-day:tobias-lindvik",[...without,...ev]); setOpen(false); H.toast(v.name + " er lagt inn", (v.rounds || "—") + " RUNDER · " + ({ prosess: "Prosessturnering", prestasjon: "Prestasjonsturnering", ingen: "Turnering · ingen mål ennå" }[v.type] || "Turnering · ingen mål ennå").toUpperCase() + (v.travelBefore ? " · REISEDAG FØR" : "")); };
  return <Bench state={state} setState={setState} title="Workbench · turnering" items={items} allDay={allDay} view="uke" newSession={!ny}
    initialCreate={ny ? undefined : { d: D.O(10), s: 15 * 60, e: 16 * 60 }}
    actions={<WB.Act icon="trophy" label="Ny turnering" onClick={() => setOpen(true)} />}>
    {state === "data" && <NS.TournamentEditor open={open} today={D.TODAY} onClose={() => setOpen(false)} onSave={save}
      initial={{ name: "Holtsmark Open", place: "Holtsmark GK", from: D.O(9), to: D.O(11), travelBefore: true, rounds: 3 }} />}
  </Bench>;
}

/* PH-11 · startvisningen: Uke fra 600 px, Dag under */
/* PH-11-TEK · live TEK-økt koblet til teknisk plan (Precision 2.24.1, LiveTek, D-72). Demodata: Tobias Lindvik, P7.0 Treffpunktet med to oppgaver.
   Kjeden: Workbench (forhand) → «Start økt» → live → oppsummering → «Lagre» → I dag (PH-01).
   Varianter: forhand · igang · tid · coach («Registrert av coach») · utennett · panel · oppsummering · oppgave-ny · oppgave-utfylt · oppgave-forna · oppgave-forslag */
const TEK_V = {
  igang: { initialIndex: 0, initialElapsed: 372, initialPer: [372, 0, 0, 0, 0], initialCounts: { x1: { lav75: 12, automatikk: 20 } }, initialHits: { x1: [true, true, false, true, true] } },
  tid: { initialIndex: 0, initialElapsed: 640, initialPer: [612, 0, 0, 0, 0], initialCounts: { x1: { lav75: 20, automatikk: 41 } }, initialHits: { x1: [true, true, false, true, true, false, true] } },
  coach: { initialIndex: 0, initialElapsed: 372, initialPer: [372, 0, 0, 0, 0], initialCounts: { x1: { lav75: 12, automatikk: 20 } }, by: "coach" },
  utennett: { initialIndex: 0, initialElapsed: 372, initialPer: [372, 0, 0, 0, 0], initialCounts: { x1: { lav75: 12, automatikk: 23 } }, net: "offline", initialPending: 3 },
  panel: { initialIndex: 0, initialElapsed: 372, initialPer: [372, 0, 0, 0, 0], initialCounts: { x1: { lav75: 12, automatikk: 20 } }, defaultPanel: true },
  oppsummering: { initialIndex: 4, initialElapsed: 3240, initialPer: [580, 600, 610, 540, 910], initialCounts: { x1: { lav75: 20, automatikk: 50 }, x2: { "uten-ball": 20, lav50: 30 }, x3: { automatikk: 36 } }, initialWrapUp: true },
};
function Tek({ state, setState, variant, go }) {
  const D = wb(), K = window.AK_DATA.tek, { mob, cw } = H.useW();
  const [step, setStep] = React.useState(variant || "forhand");
  const base = useConst(() => [...D.ITEMS, K.ITEM]);
  /* 2.27.0 (D-73): «Legg til oppgave» på en posisjon → «Ny teknisk oppgave». Varianter: oppgave-ny · oppgave-utfylt · oppgave-forna · oppgave-forslag */
  if (/^oppgave-/.test(step)) return <WB.TekOppgave state={state} setState={setState} variant={step} role="spiller" />;
  if (step === "forhand") return <Bench state={state} setState={setState} title="Workbench · dagens TEK-økt" items={base} view={mob ? "dag" : "uke"} initialPreview={{ id: K.ITEM.id, mode: "pin" }} onStart={() => setStep("igang")} />;
  const v = TEK_V[step] || TEK_V.igang, w = Math.min(cw, 1200) - (mob ? 32 : 48);
  return <Steg state={state} setState={setState} loading="Henter Treffpunkt med 7-jern …" narrow={false}>
    <NS.LiveTek key={step} session={K.SESSION} exercises={K.EX} tasks={K.TASKS} width={w} {...v} by={v.by === "coach" ? K.COACH : { role: "spiller" }}
      onSave={v => { window.AK_HANDLING.completeSession(K.ITEM.id,v); H.toast("Økta er lagret", "LAGT TIL I TEKNISK PLAN · P7.0 TREFFPUNKTET"); go && go("PH-01"); }} />
  </Steg>;
}

/* Fysisk plan (D-70, Precision 2.25.0): FysWeek, FysProgram, FysLogger og RirSheet. Demodata i data/fys.js: Tobias Lindvik, kategori D.
   Kjeden: I dag (PH-01 «Neste fysiske økt») → PH-11-FYSUKE → PH-11-FYSVELG → PH-11-FYSLIVE → avslutning → «Lagre økta» → I dag. */
/* Fast bredde per brudd (ikke målt bredde): målt bredde vippet rullefeltet av og på i en ResizeObserver-løkke i 768 og 1440 (08.10.2026). */
const fysW = (cw, mob) => mob ? 358 : cw < 1024 ? 720 : 1200;
function FysUke({ state, setState, go }) {
  const F = window.AK_DATA.fys, { mob, cw } = H.useW();
  /* 2.27.0: FysWeek har «Neste: <økt>» og «Velg økt» (nextId, onPick). */
  return <Steg state={state} setState={setState} loading="Henter uka …" narrow={false}>
    <H.Fit><NS.FysWeek days={F.DAYS} sessions={F.WEEK} today={F.TODAY} nextId="w2" onOpen={() => go && go("PH-11-FYSVELG")} onPick={() => go && go("PH-11-FYSVELG")} /></H.Fit>
  </Steg>;
}
function FysVelg({ state, setState, go }) {
  const F = window.AK_DATA.fys, { mob, cw } = H.useW();
  return <Steg state={state} setState={setState} loading="Henter programmet …" narrow={false}>
    <H.Fit><NS.FysProgram program={window.AK_HANDLING.get("fys-program:tobias-lindvik",F.PROG)} nextId={F.NEXT} role="spiller" onStart={(s) => {window.AK_HANDLING.set("fys-session:tobias-lindvik",s); H.toast(s.title + " er startet", "FYS · " + s.exercises.length + " ØVELSER"); go && go("PH-11-FYSLIVE"); }} /></H.Fit>
  </Steg>;
}
/* Varianter: igang · pause · rir · samme · avslutning */
function FysLive({ state, setState, variant, go }) {
  const F = window.AK_DATA.fys, { mob, cw } = H.useW(), v = variant || "igang";
  const selected=window.AK_HANDLING.get("fys-session:tobias-lindvik",F.PROG.sessions[0]), ex = selected.exercises, L = F.LIVE;
  const p = v === "pause" ? { ...L.igang, restLeft: 84 } : v === "rir" ? { ...L.igang, rirOpenFor: 1 } : v === "samme" ? L.samme : v === "avslutning" ? { ...L.igang, initialDone: true, initialLoad: 7 } : L.igang;
  return <Steg state={state} setState={setState} loading="Henter Underkropp A …" narrow={false}>
    <H.Fit><NS.FysLogger key={v} exercises={ex} {...p}
      onFinish={o=>{window.AK_HANDLING.set("fys-result:"+selected.id,{...o,session:selected.title});go&&go("PH-01");}} /></H.Fit>
  </Steg>;
}

function Start11(p) { const { mob } = H.useW(); return mob ? <Dag {...p} /> : <Uke {...p} />; }

/* PH-10 Plan: Plan-fanen åpner Workbench (D-65, én kalenderflate med innganger). PH-11-NY: første gang, arket «Lag årsplanen» åpent. */
reg("PH-10", "Plan", Start11);
reg("PH-11-NY", "Workbench › Opprett årsplan", (p) => <Uke {...p} variant="forste" openFirst />);
reg("PH-11", "Workbench (spiller)", Start11);
reg("PH-11-UKE", "Workbench › Uke", Uke);
reg("PH-11-DAG", "Workbench › Dag", Dag);
reg("PH-11-MND", "Workbench › Måned", Maned);
reg("PH-11-PER", "Workbench › Periode", Periode);
reg("PH-11-AR", "Workbench › År", Ar);
reg("PH-11-BIBLIOTEK", "Workbench › Øvelsesbanken", Bibliotek);
reg("PH-11-GJENTA", "Workbench › Gjenta økt", Gjenta);
reg("PH-11-PUBLISER", "Workbench › Publiser", Publiser);
reg("PH-11-FORSLAG", "Workbench › Forslag fra coach", Forslag);
reg("PH-11-START", "Workbench › Start økt", Start);
reg("PH-11-FYS", "Workbench › Fysisk økt", Fys);
reg("PH-11-TURNERING", "Workbench › Turnering", Turnering);
reg("PH-11-PANEL", "Workbench › Planlagt mot registrert", Panel);
reg("PH-11-TEK", "Workbench › Live TEK-økt med teknisk plan", Tek);
reg("PH-11-FYSUKE", "Workbench › Fysisk uke", FysUke);
reg("PH-11-FYSVELG", "Workbench › Velg fysisk økt", FysVelg);
reg("PH-11-FYSLIVE", "Workbench › Live fysisk økt", FysLive);
})();
