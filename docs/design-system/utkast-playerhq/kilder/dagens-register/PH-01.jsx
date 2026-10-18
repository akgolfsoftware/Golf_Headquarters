/* PH-01 I dag · 2.28.0 (09.10.2026). Ny side etter session/format.card.html (Anders 08.10.2026):
   1 dagens økt med «Start økt» · 2 forslag som venter · 3 neste økt · 4 nye meldinger · 5 uka. Tomme blokker vises ikke.
   Under 600 px: LargeTitle (mønster 4) og «Start økt» fast nederst (mønster 3). Fra 768 px: blokk 2–4 i høyre kolonne og «Start økt» i sidehodet.
   Varianter: standard / wang-test (testsamtykket fra WANG, D-55, repo 09.10.2026) / med-forslag (forslag og meldinger) · uten-forslag (bare dagens økt og uka) · sesong (IUP-kort for sesongevalueringen).
   Forslagene er demodata: teknisk oppgave fra Anders (coach) og økt fra WANG. Godta og Avvis er sekundære (primary={false}), så flaten har én primær.
   Forrige versjon: PH-01-utgatt-2.27.jsx (status Utgår). Skall: AppShell playerhq/ak fra felles/host.jsx. Data: data/phq-idag.js og data/spillere.js. */
(() => {
const NS = window.AKGolfPrecisionAthletics_7d7c29, H = window.AK_HOST;
const DATA = () => window.AK_DATA.phqIdag;
const DAYS = ["2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08", "2026-10-09", "2026-10-10", "2026-10-11"];
const ST = { "Gjennomført": "gjennomfort", "Hoppet over": "hoppet", "Planlagt": "publisert" };
const hm = (t, min) => { const [h, m] = t.split(":").map(Number), e = h * 60 + m + min; return String(Math.floor(e / 60)).padStart(2, "0") + ":" + String(e % 60).padStart(2, "0"); };
/* 10.10.2026: status fra demotilstanden («okt-status», satt av PH-07 og PH-06). Dagens økter (dag 0) kobles på tittel. */
const OST = () => window.AK_HANDLING.get("okt-status", {});
const idagSessions = () => DATA().idag.sessions.map((s) => OST()[s.id] ? { ...s, status: OST()[s.id].status, registered: OST()[s.id].registered } : s);
const planSessions = () => { const o = OST(), ids = DATA().idag.sessions; return DATA().plan.sessions.map((s) => { const m = s.day === 0 && ids.find((x) => x.title === s.title && o[x.id]); return m ? { ...s, status: o[m.id].status, min: o[m.id].registered || s.min } : s; }); };
const items = () => planSessions().map((s) => ({ id: s.id, title: s.title, start: DAYS[s.day] + "T" + s.t, end: DAYS[s.day] + "T" + hm(s.t, s.min), axes: [s.axis], status: ST[s.status] || "publisert", ...(s.status === "Gjennomført" ? { registered: s.min } : {}) }));
/* Øktarket for dagens økt. Første øvelse har tegningen «slag-jern-matte» (D-67). */
const blocks = (o) => [{ id: "o", kind: "oppvarming", min: 10, steps: [{ id: "o1", type: "slag", amount: "10 slag fra 50 m", text: "PW, halv sving" }] },
  { id: "h", kind: "hoveddel", min: o.min - 15, steps: o.ex.map((x, i) => ({ id: "h" + i, type: x.unit === "putter" ? "putt" : "slag", amount: x.qty + " " + x.unit, text: x.n + " · " + x.club })) },
  { id: "a", kind: "avslutning", min: 5, steps: [{ id: "a1", type: "putt", amount: "10 putter fra 3 fot" }] }];
const PROPS = [
  { id: "f1", from: { name: "Anders Kristiansen", role: "AK-coach" }, changes: [{ label: "Teknisk oppgave", after: "P7.0 · Treffpunktet før ballen" }], reason: "Ballstarten går til høyre på de siste 20 slagene.", sentAt: "05.10 · 07:40" },
  { id: "f2", from: { name: "WANG Toppidrett", role: "Trener" }, changes: [{ label: "Økt", before: "Tor 08.10 · Innspill", after: "Tor 08.10 · Nærspill på chippinggreenen" }], reason: "Range 2 er booket av VG1 torsdag.", sentAt: "04.10 · 20:41" },
];
const MSGS = [
  { id: "m1", type: "melding", title: "Innspill og nærspill er flyttet til 15:30. Vi bruker Range 3.", who: "Anders Kristiansen", role: "AK-coach", time: "07:52", unread: true, group: "idag" },
  { id: "m2", type: "melding", title: "Oppmøte 15:45 ved rangen torsdag.", who: "WANG G2", role: "Gruppe", time: "07:10", unread: true, group: "idag" },
];
const Meta = ({ children }) => <span style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums" }}>{children}</span>;
const Blk = ({ t, n, children }) => <section aria-label={t} data-idag-blokk={t} style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", minWidth: 0 }}>
  <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-2)" }}><h2 style={{ margin: 0, flex: 1, font: "var(--type-title-s)", color: "var(--text-primary)" }}>{t}</h2>{n != null && <Meta>{n}</Meta>}</div>{children}</section>;
const More = ({ n, onClick }) => n > 3 ? <div><NS.Button variant="ghost" iconRight="chevron-right" onClick={onClick}>{"Se alle (" + n + ")"}</NS.Button></div> : null;

/* Fireukerssjekk og sesongevaluering · bare for spillere i WANG- eller Team Norway-gruppe (D-04). Sekundære knapper. */
const SEEN = (p) => { const S = window.AK_DATA.sharing[p.id] || {}, orgs = [["wang", "WANG"], ["team-norway", "Team Norway"]].filter(([o]) => S[o] && S[o].status === "aktiv" && S[o].scope.includes("iup")).map(([, n]) => n), all = ["Anders", ...orgs]; return all.length === 1 ? all[0] : all.slice(0, -1).join(", ") + " og " + all[all.length - 1]; };
function Fireuker({ go, player }) {
  const I = window.IUP27, C = DATA().check, lvl = player.born >= 2011 ? "ung" : "junior";
  let s = null; try { s = JSON.parse(sessionStorage.getItem("iup-demo:" + player.id + ":uke-" + C.weeks + ":" + lvl) || "null"); } catch (e) {}
  const n = I.antall[lvl], nT = I.niva[lvl].length, draft = s ? Object.keys(s.ans || {}).length : 0, done = s && s.levert;
  return <section aria-label="Fireukerssjekk" className="pa-card" style={{ padding: "var(--space-4)", gap: "var(--space-3)", minWidth: 0 }}>
    <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "baseline", flexWrap: "wrap" }}><span className="kicker" style={{ flex: "1 1 auto" }}>Fireukerssjekk · uke {C.weeks}</span>{done ? <Meta>{"LEVERT " + s.levert}</Meta> : <span style={{ font: "var(--type-deadline)", color: "var(--text-secondary)" }}>{"Frist " + C.due}</span>}</div>
    <p style={{ margin: 0, font: "600 var(--fs-15)/1.35 var(--font-sans)", color: "var(--text-primary)", textWrap: "pretty" }}>{done ? "Levert. " + SEEN(player) + " ser svarene." : draft ? draft + " av " + n + " svar er lagret. Fortsett der du slapp." : C.process.length + " prosessmål og " + n + " spørsmål i " + nT + " områder. Tar rundt 10 minutter."}</p>
    <Meta>NIVÅ {I.nivaNavn[lvl].toUpperCase()} · SKALA 1–5 · IUP 2027</Meta>
    <div><NS.Button variant="secondary" icon={done ? "eye" : "clipboard-check"} onClick={() => go(done ? "PH-IUP-01-LEVERT" : lvl === "ung" ? "PH-IUP-01-UNG" : "PH-IUP-01")}>{done ? "Se svarene" : draft ? "Fortsett sjekken" : "Start sjekken"}</NS.Button></div>
  </section>;
}
function Sesongkort({ go, player }) {
  return <section aria-label="Sesongevaluering" className="pa-card" style={{ padding: "var(--space-4)", gap: "var(--space-3)", minWidth: 0 }}>
    <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "baseline", flexWrap: "wrap" }}><span className="kicker" style={{ flex: "1 1 auto" }}>Sesongevaluering · uke 42</span><Meta>12.10–18.10.2026</Meta></div>
    <p style={{ margin: 0, font: "600 var(--fs-15)/1.35 var(--font-sans)", color: "var(--text-primary)", textWrap: "pretty" }}>Tre åpne spørsmål, ti påstander, tidsfordeling og minst tre forbedringspunkter. Tar rundt 20 minutter.</p>
    <Meta>IUP 2027 · {SEEN(player).toUpperCase()} SER SVARENE</Meta>
    <div><NS.Button variant="secondary" icon="clipboard-check" onClick={() => go("PH-IUP-02")}>Start evalueringen</NS.Button></div>
  </section>;
}

const TN_OK = () => /tester-tn/.test(String(NS.ShareRequest));
/* PH-01-OPPGAVE (D-49): individuell oppgave fra WANG i gruppeøkta tirsdag. AssignmentCard med primary={false}, så «Start økt» er flatens ene primær. Variant planlagt: tiden er satt. */
const OPPG = (planned) => ({ id: "wg-oppg-1", session: { start: 15 * 60, end: 17 * 60, label: "Tir 06.10 · WANG G2" }, minutes: 30, content: "Innspill 100–150 m med 7-jern", purpose: "Lengdekontroll før testdagen lørdag.", coach: "Marte Vik", status: planned ? "planlagt" : "ikke", ...(planned ? { slot: { start: 15 * 60 + 30, order: 2, of: 3 } } : {}) });
function PH01({ state, setState, go, player, variant, oppgave }) {
  const { Button, Gate, EmptyState, PageHeader, LargeTitle, SessionHero, SessionBlocks, ProposalCard, InboxItem, PlanVsActual, AxisBadge, Icon, Sheet, ShareRequest } = NS;
  const { cw } = H.useW(), D = DATA(), A = window.AK_DATA, empty = state === "tom", narrow = cw < 600, two = cw >= 720;
  const [wtOpen, setWtOpen] = React.useState(true);
  const tom = variant === "uten-forslag";
  const X=window.AK_HANDLING, done=X.use("idag:forslag:"+player.id,{}), setDone=v=>X.set("idag:forslag:"+player.id,typeof v==="function"?v(done):v);
  const [attempts, setAttempts] = React.useState(0), [sheet, setSheet] = React.useState(false), [req, setReq] = React.useState(() => A.pendingRequest(player));
  /* Mønster 4: AppShell ruller innholdet i en egen flate, så LargeTitle får den som root. */
  const mark = React.useRef(null), [sc, setSc] = React.useState(null);
  React.useLayoutEffect(() => { let el = mark.current && mark.current.parentElement; while (el && el !== document.body) { const o = getComputedStyle(el).overflowY; if ((o === "auto" || o === "scroll") && el.scrollHeight > el.clientHeight) break; el = el.parentElement; } if (el && el !== document.body) setSc({ current: el }); }, [narrow, state]);
  window.AK_HANDLING.use("okt-status", {});
  const ss = idagSessions().filter((s) => s.status === "Planlagt").sort((a, b) => a.time.localeCompare(b.time));
  const cur = empty ? null : ss[0], nxt = empty || tom ? null : ss[1], okt = cur && D.okter[cur.id];
  const props = tom || empty ? [] : PROPS.filter((p) => !done[p.id]), msgs = tom || empty ? [] : MSGS;
  const colW = two ? Math.round((cw - 24) / 2) : cw;
  const kicker = D.date.short + " · " + (empty ? "INGEN ØKTER" : !ss.length ? "ALLE ØKTER GJENNOMFØRT" : ss.length === 1 ? "1 ØKT IGJEN" : ss.length + " ØKTER IGJEN");
  const start = (sz) => cur && state === "data" && <Button variant="primary" size={sz} icon="play" fullWidth={narrow} onClick={() => { window.PHQ_SEL = { sessionId: cur.id, kind: "golf" }; go("PH-04"); }}>Start økt</Button>;
  const accept = (proposal, ok) => { setDone(d=>({...d,[proposal.id]:ok?'godtatt':'avvist'}));if(ok){if(proposal.id==='f1')X.append('accepted-tasks:'+player.id,{id:proposal.id,text:proposal.changes[0].after,from:proposal.from.name},[]);if(proposal.id==='f2'){const k='workbench:'+player.id,base=X.get(k,A.wb.ITEMS);X.set(k,base.map(x=>x.start?.startsWith('2026-10-08')&&x.axes?.includes('slag')?{...x,title:'Nærspill på chippinggreenen'}:x));}}H.toast(ok?'Forslaget er godtatt':'Forslaget er avvist','LAGRET I DEMOEN'); };
  const today = cur && <Blk t="Dagens økt">
    <H.Fit fallback={colW}><SessionHero compact showActions={false} session={{ title: cur.title, axis: cur.axes[0], time: cur.time + "–" + cur.end, duration: cur.min + " min", place: okt ? okt.place : cur.place, equipment: okt ? [...new Set(okt.ex.map(x => x.club))] : [] }} /></H.Fit>
    {start("lg")}
    {okt && <details className="ak-disclosure"><summary>Se øktplan · {okt.ex.length} øvelser</summary><H.Fit fallback={colW}><SessionBlocks blocks={blocks(okt)} /></H.Fit></details>}
  </Blk>;
  const akProposals=X.use('suggestions:ak',[]), wangProposals=X.use('suggestions:wang',[]), tnProposals=X.use('suggestions:team-norway',[]);
  const orgProposals=[['ak',akProposals],['wang',wangProposals],['team-norway',tnProposals]].flatMap(([org,list])=>list.filter(x=>x.playerId===player.id&&x.status==='Venter på spiller').map(x=>({...x,org})));
  const forslag = (props.length > 0 || orgProposals.length > 0) && <Blk t="Forslag som venter" n={props.length+orgProposals.length}>
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>{props.slice(0, 3).map((p) => <div key={p.id} data-forslag={p.changes[0].label} className="pa-card" style={{ padding: "var(--space-3)", minWidth: 0 }}><ProposalCard from={p.from} changes={p.changes} reason={p.reason} sentAt={p.sentAt} status="venter" primary={false} onAccept={() => accept(p, true)} onReject={() => accept(p, false)} /></div>)}</div>
    {orgProposals.map(x=><NS.Card key={x.id} title={x.org==='ak'?'Fra coach':x.org==='wang'?'Fra WANG':'Fra Team Norway'}><p>{x.text}</p><div style={{display:'flex',gap:8,flexWrap:'wrap'}}><NS.Button variant="secondary" onClick={()=>{X.update('suggestions:'+x.org,x.id,{status:'Godtatt'},[]);X.append('accepted-tasks:'+player.id,{id:x.id,text:x.text,from:x.org},[])}}>Godta</NS.Button><NS.Button variant="ghost" onClick={()=>X.update('suggestions:'+x.org,x.id,{status:'Avvist'},[])}>Avvis</NS.Button></div></NS.Card>)}<More n={props.length} onClick={() => go("PH-21")} />
  </Blk>;
  const share = !empty && !tom && req && (!req.d13 || TN_OK()) && <ShareRequest primary={false} variant={req.d13 ? "tester-tn" : "standard"} inGroup={A.inOrg(player, req.org)} org={req.org} under16={A.under16(player)} status={req.status} sentAt={req.sentAt} onShare={(v) => { X.changeSharing(player,req.org,v?.scope?.length===1?"Bare tester":"Full profil",{helse:false,meldinger:false});setReq(null); H.toast(A.under16(player) ? "Sendt til forelder for godkjenning" : "Deling er aktiv", (req.d13 || req.org === "team-norway" ? "TEAM NORWAY" : "WANG") + " · " + (v && v.scope && v.scope.length === 1 ? "BARE TESTER" : "FULL PROFIL")); }} onLater={() => { setReq(null); H.toast("Ikke delt", "DU FINNER FORESPØRSELEN I MEG › DELING"); }} />;
  const iup = !empty && !tom && A.iupVisible(player) && <><Fireuker go={go} player={player} />{variant === "sesong" && <Sesongkort go={go} player={player} />}</>;
  const neste = nxt && <Blk t="Neste økt">
    <button type="button" onClick={() => setSheet(true)} aria-label={"Neste økt: " + nxt.title + ", i dag " + nxt.time} className="pa-card" style={{ all: "unset", boxSizing: "border-box", display: "flex", alignItems: "center", gap: "var(--space-3)", minHeight: 56, padding: "var(--space-2) var(--space-3)", cursor: "pointer", background: "var(--surface-card)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-card, 8px)" }}>
      <AxisBadge axis={nxt.axes[0]} />
      <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}><span style={{ font: "600 var(--fs-15)/1.3 var(--font-sans)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{nxt.title}</span><span style={{font:"var(--type-deadline)",color:"var(--text-secondary)"}}>{nxt.time + "–" + nxt.end + " · " + nxt.place}</span></span>
      <Icon name="chevron-right" size={18} aria-hidden="true" />
    </button>
  </Blk>;
  const meld = msgs.length > 0 && <Blk t="Nye meldinger" n={msgs.length}><div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>{msgs.slice(0, 3).map((m) => <InboxItem key={m.id} item={m} onAction={() => go("PH-21")} />)}</div><More n={msgs.length} onClick={() => go("PH-21")} /></Blk>;
  const uka = !empty && <Blk t="Uka"><PlanVsActual items={items()} days={DAYS} label={"Uke " + D.plan.week} today={DAYS[0]} now={8 * 60 + 14} /></Blk>;
  const head = <PageHeader kicker={kicker} title="I dag" />;
  const oppg = oppgave && !empty && <H.Fit key="oppg" fallback={colW}><NS.AssignmentCard org="wang" assignment={{...OPPG(variant==="planlagt"),...(X.get("assignment-slot:wg-oppg-1",null)?{status:"planlagt",slot:X.get("assignment-slot:wg-oppg-1")}: {})}} primary={false} onPlan={v=>{const task=OPPG(false),id="assignment:"+task.id,key="workbench:"+player.id,hm=m=>String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0"),rows=X.get(key,A.wb.ITEMS),rec={id,createId:id,title:task.content,start:"2026-10-06T"+hm(v.start),end:"2026-10-06T"+hm(v.start+task.minutes),order:v.order,axes:["slag"],status:"utkast",own:true};X.set(key,rows.some(x=>x.id===id)?rows.map(x=>x.id===id?rec:x):[...rows,rec]);X.set("assignment-slot:"+task.id,v);H.toast("Oppgaven er lagt i Workbench","UTKAST · LOKAL DEMO");}} /></H.Fit>;
  /* Repo 09.10.2026 (src/app/portal/page.tsx, D-55): WANG-elever som ikke har svart, får testsamtykket i I dag. Variant wang-test: TestConsent «mangler», primary={false}. */
  const wg = A.groupsOf(player).find((g) => g.org === "wang");
  const wt = variant === "wang-test" && !empty && wtOpen && <NS.TestConsent key="wt" primary={false} status="mangler" group={wg ? wg.name : "WANG-gruppe"} under16={A.under16(player)} onConsent={() => { X.set("test-consent:"+player.id,A.under16(player)?"forelder":"gitt");setWtOpen(false); H.toast(A.under16(player) ? "Sendt til forelder for godkjenning" : "Samtykket er gitt", "WANG TOPPIDRETT · TESTER"); }} onLater={() => { setWtOpen(false); H.toast("Ikke svart ennå", "DU FINNER SPØRSMÅLET I MEG › DELING"); }} />;
  const right = [wt, oppg, forslag, share, iup, neste, meld].map((node,i)=>node&&<React.Fragment key={i}>{node}</React.Fragment>).filter(Boolean);
  return <NS.Page bottomInset={24}>
    {head}
    <Gate state={state} loading="Henter dagen din …" attempts={attempts} onRetry={() => { setAttempts((n) => n + 1); setState("data"); }} error={{ title: "Kunne ikke hente dagens plan", text: "Tilkoblingen ble brutt. Ingenting er endret i planen din.", code: "FEIL 503 · I DAG · " + D.date.now }}>
      {empty ? <EmptyState icon="calendar-range" title="Ingen økt i dag" text={"Du har ingen økter " + D.date.weekday + " og ingen treningsplan ennå."} action="Bygg økter i Workbench" actionIcon="layers" onAction={() => go("PH-11")} secondary="Registrer runde" onSecondary={() => go("PH-RD-01")} />
        : !two ? <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", minWidth: 0 }}>{today}{wt}{oppg}{forslag}{share}{iup}{neste}{meld}{uka}</div>
        : <div style={{ display: "grid", gridTemplateColumns: right.length ? "minmax(0,1fr) minmax(0,1fr)" : "minmax(0,1fr)", gap: "var(--space-6)", alignItems: "start", minWidth: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", minWidth: 0 }}>{today}{uka}</div>
            {right.length > 0 && <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)", minWidth: 0 }}>{right}</div>}
          </div>}

    </Gate>
    {nxt && <Sheet open={sheet} mode="bottom" kicker="Neste økt" title={nxt.title} label={nxt.title} onClose={() => setSheet(false)}><SessionHero session={{ title: nxt.title, axis: nxt.axes[0], duration: nxt.time + "–" + nxt.end + " · " + nxt.min + " min", place: nxt.place }} showActions={false} /></Sheet>}
  </NS.Page>;
}
window.AK_SCREENS["PH-01"] = { id: "PH-01", name: "I dag", route: "/portal", Component: PH01 };
window.AK_SCREENS["PH-01-OPPGAVE"] = { id: "PH-01-OPPGAVE", name: "I dag › Din oppgave fra WANG", route: "/portal", Component: (p) => <PH01 {...p} oppgave /> };
})();
