/* Workbench-skjemaer · Precision 2.28.1 (09.10.2026). Kandidat. Demodata: data/skjema.js (Tobias Lindvik).
   PH-11-PERSKJEMA: PeriodPlan. PH-11-MNDSKJEMA: MonthPlan. PH-11-OKT: SessionHero og SessionBlocks, «Start økt».
   PH-11-MAL: GoalsHub (alle nivåer). PH-11-MAL-IUP: GoalsHub på fanen IUP-måltall. PH-11-UKEMAL: WeekTemplate for periodetypen Forberedelse. */
(() => {
const NS = window.AKGolfPrecisionAthletics_7d7c29, H = window.AK_HOST;
const K = () => window.AK_DATA.skjema;
function Wrap({ state, setState, kicker, title, loading, empty, go, narrow, children }) {
  const { Gate, EmptyState, PageHeader } = NS, [attempts, setAttempts] = React.useState(0);
  return <NS.Page narrow={narrow} bottomInset={80}>
    <PageHeader kicker={kicker} title={title} />
    <Gate state={state} loading={loading} attempts={attempts} onRetry={() => { setAttempts((n) => n + 1); setState("data"); }} error={{ title: title + " kunne ikke hentes", text: "Ingenting er endret.", code: "FEIL 503 · WORKBENCH · 09.10.2026 10:12" }}>
      {state === "tom" ? <EmptyState icon={empty.icon} title={empty.title} text={empty.text} action={empty.action} actionIcon="plus" onAction={() => setState("data")} /> : <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", minWidth: 0 }}>{children}</div>}
    </Gate>
  </NS.Page>;
}
function Per(p) { const { cw } = H.useW(), D = K();
  return <Wrap {...p} kicker="Workbench › Periode" title="Sesongforberedelse" loading="Henter perioden …" empty={{ icon: "layers", title: "Ingen periode her", text: "Perioden lages fra årsplanen.", action: "Lag periode" }}>
    <H.Fit><NS.PeriodPlan period={D.period} weeks={D.periodWeeks} role="spiller" /></H.Fit>
  </Wrap>; }
function Mnd(p) { const D = K(),X=window.AK_HANDLING,month=X.use("month:spiller:tobias-lindvik",D.month);
  return <Wrap {...p} kicker="Workbench › Måned" title="Oktober 2026" loading="Henter månedsplanen …" empty={{ icon: "calendar-range", title: "Ingen månedsplan for oktober", text: "Sett fokus og mål for måneden. Timene hentes fra ukeplanene.", action: "Lag månedsplan" }}>
    <NS.MonthPlan {...month} viewer="spiller" onChange={patch => X.set("month:spiller:tobias-lindvik",{...month,...patch})} />
  </Wrap>; }
function Okt(p) { const { cw } = H.useW(), D = K();
  return <Wrap {...p} narrow kicker="Workbench › Økt · mandag 12. oktober" title="Innspill 100–150 m" loading="Henter økta …" empty={{ icon: "dumbbell", title: "Ingen økt valgt", text: "Velg en økt i uka, eller lag en ny.", action: "Ny økt" }}>
    <H.Fit><NS.SessionHero session={D.session} /></H.Fit>
    <H.Fit><NS.SessionBlocks blocks={D.blocks} /></H.Fit>
    <NS.Button variant="primary" size="lg" icon="play" fullWidth onClick={() => p.go("PH-11-START")}>Start økt</NS.Button>
  </Wrap>; }
function Mal(p, iup) { const { cw } = H.useW(), D = K(), X=window.AK_HANDLING, goals=X.use("goals:tobias-lindvik",D.goals);
  return <Wrap {...p} kicker={"Workbench › Målsetninger" + (iup ? " · IUP-måltall" : "")} title="Målsetninger" loading="Henter målsetningene …" empty={{ icon: "target", title: "Ingen målsetninger ennå", text: "Sett mål for sesongen, perioden, måneden eller en økt.", action: "Ny målsetning" }}>
    <H.Fit><NS.GoalsHub goals={goals} today="2026-10-09" role="spiller" player="Tobias Lindvik" initialTab={iup ? "iup" : "alle"} onChange={v=>X.set("goals:tobias-lindvik",v)} /></H.Fit>
  </Wrap>; }
function Ukemal(p) { const D = K(),X=window.AK_HANDLING,rows=X.use("week-template:tobias-lindvik",D.weekTemplate),[draft,setDraft]=React.useState(null);
  return <Wrap {...p} kicker="Workbench › Ukemal · periodetype Forberedelse" title="Ukemal" loading="Henter ukemalen …" empty={{ icon: "calendar-days", title: "Ingen ukemal ennå", text: "Legg inn økter for morgen, ettermiddag og kveld.", action: "Legg inn økt" }}>
    <NS.WeekTemplate sessions={rows} title="Forberedelse" onCell={(day,slot,session)=>setDraft(session?{...session}:{day,slot,type:"golfslag",min:60,label:""})} />
    <NS.Sheet open={!!draft} title="Økt i ukemalen" onClose={()=>setDraft(null)} footer={<NS.Button disabled={!draft?.label?.trim() || !(draft?.min>0)} onClick={()=>{X.set("week-template:tobias-lindvik",[...rows.filter(r=>r.day!==draft.day||r.slot!==draft.slot),draft]);setDraft(null);}}>Lagre økt</NS.Button>}>{draft&&<><NS.Input label="Navn" value={draft.label||""} onChange={e=>setDraft({...draft,label:e.target.value})}/><NS.Input label="Minutter" type="number" min="1" value={draft.min} onChange={e=>setDraft({...draft,min:Number(e.target.value)})}/><NS.Select label="Økttype" value={draft.type} options={Object.entries(NS.SESSION_TYPES).map(([value,t])=>({value,label:t.label}))} onChange={e=>setDraft({...draft,type:e.target.value})}/><NS.Button variant="ghost" onClick={()=>{X.set("week-template:tobias-lindvik",rows.filter(r=>r.day!==draft.day||r.slot!==draft.slot));setDraft(null);}}>Fjern økt</NS.Button></>}</NS.Sheet>
  </Wrap>; }
const reg = (id, name, C) => { window.AK_SCREENS[id] = { id, name, route: "/portal/planlegge/workbench", Component: C }; };
reg("PH-11-PERSKJEMA", "Workbench › Periodeskjema", Per);
reg("PH-11-MNDSKJEMA", "Workbench › Månedsskjema", Mnd);
reg("PH-11-OKT", "Workbench › Økt", Okt);
reg("PH-11-MAL", "Workbench › Målsetninger", (p) => Mal(p, false));
reg("PH-11-MAL-IUP", "Workbench › Målsetninger · IUP-måltall", (p) => Mal(p, true));
reg("PH-11-UKEMAL", "Workbench › Ukemal per periodetype", Ukemal);
})();
