/* Registrer runde og live runde · Precision 2.28.0 (09.10.2026). Kandidat. Demodata: data/runde.js (Tobias Lindvik, Fredrikstad GK).
   PH-09 Registrer runde: PostRoundEntry (slag for slag etter runden, SG regnes for førte hull).
   PH-RD-01 velg nivå: RoundSetup, nivået (Rask score · Hull for hull · Slag for slag) uten husket valg. PH-RD-02 oppsett: RoundSetup fylt inn fra kalenderen (turnering).
   PH-RD-03 slag og PH-RD-04 putt: ShotEntry (natt i registeret), hull 7. PH-RD-05 SG hittil: SGSummary for hull 1–6, referanse kategori C (estimat). */
(() => {
const NS = window.AKGolfPrecisionAthletics_7d7c29, H = window.AK_HOST;
const R = () => window.AK_DATA.runde, X = window.AK_HANDLING;
function Wrap({ state, setState, kicker, loading, empty, go, children }) {
  const { Gate, EmptyState } = NS, [attempts, setAttempts] = React.useState(0);
  return <NS.Page narrow bottomInset={80}>
    {kicker && <span className="kicker">{kicker}</span>}
    <Gate state={state} loading={loading} attempts={attempts} onRetry={() => { setAttempts((n) => n + 1); setState("data"); }} error={{ title: "Runden kunne ikke hentes", text: "Tidligere lagringer i denne demofanen beholdes. Prøv igjen.", code: "FEIL 503 · RUNDE · 05.10.2026 16:40" }}>
      {state === "tom" ? <EmptyState icon="flag" title={empty || "Ingen runde i gang"} text="Start en runde, så fører du den her." action="Registrer runde" actionIcon="flag" onAction={() => go("PH-RD-01")} /> : <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", minWidth: 0, maxWidth: 640, width: "100%", marginInline: "auto" }}>{children}</div>}
    </Gate>
  </NS.Page>;
}
function PH09(p) { const { cw } = H.useW(), D = R();
  return <Wrap {...p} kicker="Registrer runde · Fredrikstad GK · 05.10.2026" loading="Henter runden …" empty="Ingen runde å registrere">
    <NS.PostRoundEntry holes={X.roundDraft().holes} clubs={D.clubs} bag={D.bag} width={Math.min(cw, 640)} initialHole={6} onSave={holes => { X.saveRound({holes,mode:"slag"}); p.go("PH-18"); }} />
  </Wrap>; }
function Setup(p, from) { const D = R();
  return <Wrap {...p} kicker={from ? "Ny runde · fra kalenderen" : "Ny runde"} loading="Henter banene …" empty="Ingen baner å velge">
    <NS.RoundSetup courses={D.courses} tees={D.tees} today={D.today} fromTournament={from ? D.tournament : undefined} defaultMode={from ? "slag" : undefined} onStart={v => { X.set("round-draft:tobias-lindvik",{...v,id:X.id("round"),holes:D.holes().slice(0,v.holes).map(h=>({...h,score:null,putts:null,shots:[],holed:false})),current:0}); p.go(v.mode==="rask"?"PH-RD-06":v.mode==="slag"?"PH-RD-03":"PH-08"); }} />
  </Wrap>; }
const RD01 = (p) => Setup(p, false), RD02 = (p) => Setup(p, true);
function Shot(p, green) { const D=R(), saved=X.use("round-draft:tobias-lindvik",null), draft=saved || X.roundDraft(), cur=draft.current ?? 6, holes=draft.holes, hole=holes[cur] || holes[0], shots=hole.shots || (green?D.shots7g:D.shots7);
  const put=(next,done=false)=>{const hs=holes.map((h,i)=>i===cur?{...h,shots:next,holed:done,score:next.reduce((n,s)=>n+1+(s.penalty?1:0),0)}:h);X.saveRoundDraft({holes:hs,...(done?{current:Math.min(cur+1,hs.length-1)}:{})});if(done){if(cur===hs.length-1){X.saveRound({holes:hs});p.go("PH-RD-08");}else p.go("PH-RD-05");}};
  return <Wrap {...p} kicker={"Runde live · "+draft.course+" · hull "+hole.n} loading="Henter runden …">
    <NS.ShotEntry key={hole.n} hole={hole} shots={shots} clubs={D.clubs} bag={D.bag} initial={green?{lie:"green",dist:11}:undefined} onAdd={s=>put([...shots,s])} onHoled={s=>put([...shots,s],true)} onPenalty={()=>put(shots.map((s,i)=>i===shots.length-1?{...s,penalty:true}:s))} onUndo={()=>put(shots.slice(0,-1))} />
  </Wrap>; }
const RD03 = (p) => Shot(p, false), RD04 = (p) => Shot(p, true);
function RD05(p) { const { cw } = H.useW(), D = R(), r = NS.SG.round(X.roundDraft().holes.filter((h) => h.holed));
  return <Wrap {...p} kicker="SG hittil · fullførte hull" loading="Regner ut SG …">
    <NS.SGSummary by={r.by} total={r.total} worst={NS.SG.worst(r.shots)} reference={D.reference} rounds={1} shotsStored={r.shots.length} holes={r.done.length} width={Math.min(cw, 640)} />
    <NS.Button variant="primary" size="xl" icon="flag" fullWidth onClick={() => p.go("PH-RD-03")}>Fortsett runden</NS.Button>
  </Wrap>; }
/* PH-RD-08 Runde gjennomført: RoundSummary (svaret først, beste og svakeste hull, notat, «Lagre») og ScorecardFull. */
function RD08(p) { const { cw } = H.useW(), D = R(), hs = X.roundDraft(D.done()).holes, w = Math.min(cw, 640);
  return <Wrap {...p} kicker="Runde gjennomført · Fredrikstad GK · 05.10.2026" loading="Henter runden …" empty="Ingen runde er ført">
    <NS.RoundSummary holes={hs} width={w} onSave={v => { X.saveRound({...v,holes:hs}); p.go("PH-18"); }} />
    <NS.ScorecardFull holes={hs} width={w} course="Fredrikstad GK · gul tee" source="Ført i appen" />
  </Wrap>; }
/* PH-RD-09 Rediger runde: samme føring som Runde live (HoleStrip og HoleEntry) på en ferdig runde. Hull 13 er valgt. «Lagre endringene» er primær; HoleEntry har primary={false}. */
function RD09(p) { const { HoleStrip, HoleEntry, Button } = NS, D = R(); const [hs, setHs] = React.useState(() => X.roundDraft(D.done()).holes), [cur, setCur] = React.useState(Math.min(12,X.roundDraft(D.done()).holes.length-1)), [val, setVal] = React.useState({});
  const h = hs[cur] || hs[0], put = () => {const next=hs.map((x,i)=>i===cur?{...x,...val}:x);setHs(next);X.saveRoundDraft({holes:next});return next;};
  return <Wrap {...p} kicker="Rediger runde · Fredrikstad GK · 05.10.2026" loading="Henter runden …" empty="Ingen runde å redigere">
    <HoleStrip holes={hs} current={cur} onHole={(i) => { put(); setCur(i); setVal({}); }} />
    <HoleEntry key={cur} primary={false} hole={h} value={{ ...h, ...val }} onChange={setVal} onNext={() => { put(); setVal({}); if (cur < 17) setCur(cur + 1); }} last={cur === 17} />
    <Button variant="primary" size="lg" icon="check" fullWidth onClick={() => { X.saveRound({holes:put()}); p.go("PH-RD-08"); }}>Lagre endringene</Button>
  </Wrap>; }
/* PH-RD-06 Etterregistrering · rask score (2.32.0): QuickScoreEntry, brutto per hull, hull 1–9 ført. «Lagre runden» er flatens ene primær. Rask score gir ikke SG-grunnlag (står i komponenten). */
function RD06(p) { const { cw } = H.useW(), D = R(), Q = window.AK_DATA.raskScore, draft=X.roundDraft(), initial=draft.mode==="rask"?draft.holes.map(h=>h.score??null):Q.initial, [sc, setSc] = React.useState(initial);
  const n = sc.filter((x) => x != null).length;
  return <Wrap {...p} kicker={"Rask score · " + Q.course + " · " + Q.date} loading="Henter banen …" empty="Ingen runde å registrere">
    <NS.QuickScoreEntry course={Q.course} tee={Q.tee} date={Q.date} par={D.holes().map((h) => h.par)} initial={initial} onChange={setSc} width={Math.min(cw, 640)} />
    <NS.Button variant="primary" size="xl" icon="check" fullWidth disabled={!n} onClick={() => { X.saveRound({mode:"rask",holes:draft.holes.map((h,i)=>({...h,score:sc[i]??null,shots:[],holed:sc[i]!=null}))}); p.go("PH-18"); }}>Lagre runden</NS.Button>
  </Wrap>; }
const reg = (id, name, route, C) => { window.AK_SCREENS[id] = { id, name, route, Component: C }; };
reg("PH-09", "Registrer runde", "/portal/runde/logg", PH09);
reg("PH-RD-01", "Registrer runde · velg nivå", "/portal/mal/runder/ny", RD01);
reg("PH-RD-02", "Registrer runde · oppsett", "/portal/runde/logg", RD02);
reg("PH-RD-03", "Live runde · slag", "/portal/runde/live", RD03);
reg("PH-RD-04", "Live runde · putt", "/portal/mal/runder/[id]/slag", RD04);
reg("PH-RD-05", "SG hittil", "/portal/runde/live", RD05);
reg("PH-RD-06", "Etterregistrering · rask score", "/portal/mal/runder/ny", RD06);
reg("PH-RD-08", "Runde gjennomført", "/portal/mal/runder/[id]", RD08);
reg("PH-RD-09", "Rediger runde", "/portal/mal/runder/[id]/rediger", RD09);
})();
