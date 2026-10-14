/* PH-04 Live-økt · før start og PH-05 Live-økt · aktiv · Precision 2.28.0 (09.10.2026). Kandidat. Natt i registeret: begge virker i lyst og natt.
   PH-04: SessionHero (tegningen slag-jern-matte) og SessionBlocks, «Start økt» som eneste primær, nederst under 600 px (mønster 3) og øverst fra 600 px.
   PH-05: LiveRun, steg for steg, sentrert og høyst 640 px bred fra 600 px. Klokka står når ?fast=1 (måling).
   Data: data/live.js (dagens økt i data/phq-idag.js, Tobias Lindvik, demodata).
   10.10.2026: reisen I dag → PH-04 → PH-05 → PH-07 → I dag. «Avslutt økt» i PH-05 åpner LiveSessions egen avslutning, og «Lagre» der, som «Lagre» i PH-07 (Etter økt), setter dagens økt til Gjennomført med registrert tid
   i demotilstanden («okt-status», data/handling.js), og PH-01 viser neste økt og uka med økta registrert. PH-06 gjør det samme for styrkeøkta. */
(() => {
const NS = window.AKGolfPrecisionAthletics_7d7c29, H = window.AK_HOST;
const FAST = new URLSearchParams(location.search).get("fast") === "1";
const ferdig = (id, min, go) => { const X = window.AK_HANDLING; X.set("okt-status", { ...X.get("okt-status", {}), [id]: { status: "Gjennomført", registered: min, at: X.stamp().time } }); go("PH-01"); };
function Wrap({ state, setState, loading, children, go }) {
  const { Gate, EmptyState } = NS, [attempts, setAttempts] = React.useState(0);
  return <NS.Page narrow bottomInset={24}>
    <Gate state={state} loading={loading} attempts={attempts} onRetry={() => { setAttempts((n) => n + 1); setState("data"); }} error={{ title: "Økta kunne ikke hentes", text: "Ingenting er endret. Prøv igjen om litt.", code: "FEIL 503 · LIVE-ØKT · 05.10.2026 15:28" }}>
      {state === "tom" ? <EmptyState icon="calendar-days" title="Ingen økt å starte" text="Du har ingen planlagt økt nå. Legg inn en økt i Workbench, så kan du starte den her." action="Bygg økter i Workbench" actionIcon="layers" onAction={() => go && go("PH-11")} /> : children}
    </Gate>
  </NS.Page>;
}
function PH04({ state, setState, go }) {
  const { SessionHero, SessionBlocks, Button } = NS, { cw } = H.useW(), L = window.AK_DATA.live(), narrow = cw < 600;
  const start = <Button variant="primary" size="xl" icon="play" fullWidth onClick={() => go("PH-05")}>Start økt</Button>;
  return <Wrap go={go} state={state} setState={setState} loading="Henter Innspill og nærspill …">
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", minWidth: 0 }}>
      {!narrow && start}
      <SessionHero session={L.session} bilder={L.bilder} width={Math.min(cw, 760)} showActions={false} />
      <SessionBlocks blocks={L.blocks} width={Math.min(cw, 760)} />
      {narrow && <div data-dock="" style={{ position: "sticky", bottom: "var(--space-4)", zIndex: 2, display: "flex" }}>{start}</div>}
    </div>
  </Wrap>;
}
/* 2.31.0: PH-05 bruker LiveSession (LiveClock med én hovedtid og «ØKTA» som sekundær, ExerciseNotes per øvelse, CoachMessage øverst). LiveRun har ikke dette.
   Varianter: standard · coach (melding fra Anders øverst) · avbrutt. Data: data/live.js og data/live-coach.js. */
function PH05({ state, setState, go, variant }) {
  const { LiveSession } = NS, L = window.AK_DATA.live(), C = window.AK_DATA.liveCoach, per = Math.round((L.o.min - 15) / L.o.ex.length);
  const exercises = L.o.ex.map((x, i) => ({ id: "h" + i, title: x.n, axis: L.o.axes[0], min: per, goal: x.qty + " " + x.unit + " · " + x.club, ...(i === 1 ? { bilder: L.bilder } : {}), hits: x.unit === "putter" ? { label: "I hull", goal: x.qty } : { label: "Innenfor 4 m", goal: x.qty } }));
  return <Wrap go={go} state={state} setState={setState} loading="Henter Innspill og nærspill …">
    <LiveSession session={L.session} exercises={exercises} initialIndex={1} initialElapsed={1320} initialResults={{ h1: Array.from({ length: 12 }, (_, k) => k % 3 !== 2) }}
      mode={variant === "avbrutt" ? "avbrutt" : "live"} interruptedAt="15:52" tick={!FAST}
      notes={{ h1: C.live[0].notes.map(({ session, exercise, ...n }) => n) }} coachMessages={variant === "coach" ? C.coachMessages : []}
      onReply={() => go("PH-21")} onSave={(v) => { H.toast("Økta er lagret", "GJENNOMFØRT · REGISTRERT I UKA · " + window.AK_HANDLING.demoMeta); ferdig("okt-0510", (v && v.totalMin) || L.o.min, go); }} />
  </Wrap>;
}
window.AK_SCREENS["PH-04"] = { id: "PH-04", name: "Live-økt · før start", route: "/portal/live/[id]/brief", Component: PH04 };
window.AK_SCREENS["PH-05"] = { id: "PH-05", name: "Live-økt · aktiv", route: "/portal/live/[id]/active", Component: PH05 };
/* PH-06 Live-økt · fysisk (D-29): FysLogger for Underkropp A fra data/fys.js, sett 2 av 4 på første øvelse. Natt i registeret. */
/* 2.31.0: ExerciseNotes under FysLogger for øvelsen som pågår. Variant coach: CoachMessage øverst og CoachMessageList. 2.32.0: LiveClock (sekundær, «Økta») over FysLogger; pausen i FysLogger er hovedtiden. */
function PH06({ state, setState, go, variant }) {
  const F = window.AK_DATA.fys, C = window.AK_DATA.liveCoach, { cw } = H.useW(), ex = F.PROG.sessions[0].exercises;
  const [msg, setMsg] = React.useState(variant === "coach" ? { ...C.coachMessages[0], text: "Bra dybde. Hold samme vekt på sett 3." } : null), [closed, setClosed] = React.useState([]);
  return <Wrap go={go} state={state} setState={setState} loading="Henter Underkropp A …">
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", minWidth: 0 }}>
      {msg && <NS.CoachMessage message={msg} onClose={() => { setClosed((c) => [...c, msg]); setMsg(null); }} onReply={() => go("PH-21")} />}
      {closed.length > 0 && <NS.CoachMessageList messages={closed} />}
      <NS.LiveClock role="sub" label="Økta" sec={1140} planned={2700} />
      <NS.FysLogger exercises={ex} width={Math.min(cw, 760)} {...F.LIVE.igang} onFinish={(o) => { H.toast("Økta er lagret", "GJENNOMFØRT · OPPLEVD BELASTNING " + ((o && o.load) || "—") + " · " + window.AK_HANDLING.demoMeta); ferdig("fys-0510", 45, go); }} />
      <NS.ExerciseNotes notes={C.fysNotes} exerciseTitle={(ex[0] || {}).title || (ex[0] || {}).name} />
    </div>
  </Wrap>;
}
/* PH-07 Etter økt: SessionWrapUp for dagens golføkt. Faktisk tid per øvelse, opplevd belastning, dagsform og notat. «Lagre» er flatens ene primær. */
function PH07({ state, setState, go }) {
  const L = window.AK_DATA.live(), ex = L.o.ex.map((x, i) => ({ title: x.n, actualMin: [20, 22, 15, 0][i] ?? x.min, done: i < 3, result: i === 1 ? "Innenfor 4 m: 26 av 40" : undefined }));
  return <Wrap go={go} state={state} setState={setState} loading="Henter Innspill og nærspill …">
    <NS.SessionWrapUp title={L.o.title} plannedMin={L.o.min} exercises={ex} onSave={() => { H.toast("Økta er lagret", "GJENNOMFØRT · REGISTRERT I UKA · " + window.AK_HANDLING.demoMeta); ferdig("okt-0510", ex.reduce((a, x) => a + (x.actualMin || 0), 0), go); }} />
  </Wrap>;
}
window.AK_SCREENS["PH-06"] = { id: "PH-06", name: "Live-økt · fysisk", route: "/portal/live/[id]/tapper", Component: PH06 };
window.AK_SCREENS["PH-07"] = { id: "PH-07", name: "Etter økt", route: "/portal/live/[id]/summary", Component: PH07 };
})();
