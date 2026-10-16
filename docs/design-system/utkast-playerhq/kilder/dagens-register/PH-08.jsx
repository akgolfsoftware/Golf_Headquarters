/* PH-08 Runde live · Precision 2.28.0 (09.10.2026). Kandidat. Natt i registeret: virker i lyst og natt.
   Enkel føring per hull (RoundSetup-nivået «hull»): HoleStrip (1–18) og HoleEntry for valgt hull. Brutto score, putter. Variant avbrutt: RoundStatus.
   Demodata: Tobias Lindvik, Fredrikstad GK, treningsrunde mandag 05.10.2026, hull 1–6 ført. */
(() => {
const NS = window.AKGolfPrecisionAthletics_7d7c29, H = window.AK_HOST;
const PAR = [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5], LEN = [356, 372, 158, 478, 341, 389, 172, 365, 492, 344, 401, 149, 467, 362, 330, 184, 395, 511];
const DONE = [[5, 2], [4, 2], [3, 2], [5, 1], [4, 2], [5, 3]];
function PH08({ state, setState, go, variant }) {
  const { Gate, EmptyState, HoleStrip, HoleEntry, RoundStatus } = NS, { cw } = H.useW();
  const X=window.AK_HANDLING;
  const [holes, setHoles] = React.useState(() => X.roundDraft(PAR.map((par, i) => ({ n: i + 1, par, length: LEN[i], score: DONE[i] ? DONE[i][0] : null, putts: DONE[i] ? DONE[i][1] : null }))).holes);
  const [cur, setCur] = React.useState(X.roundDraft().current ?? 6), [val, setVal] = React.useState({}), [attempts, setAttempts] = React.useState(0);
  const h = holes[cur] || holes[0];
  const [resumed,setResumed]=React.useState(false);
  const put=()=>{const next=holes.map((x,i)=>i===cur?{...x,...val}:x);setHoles(next);X.saveRoundDraft({holes:next,current:cur});return next;};
  const next=()=>{const hs=put();setVal({});if(cur<holes.length-1){setCur(cur+1);X.saveRoundDraft({current:cur+1});}else {X.saveRound({holes:hs,mode:"hull"});go("PH-RD-08");}};
  return <NS.Page narrow bottomInset={24}>
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}><span className="kicker">Runde live · Fredrikstad GK · gul tee</span></div>
    <Gate state={state} loading="Henter runden …" attempts={attempts} onRetry={() => { setAttempts((n) => n + 1); setState("data"); }} error={{ title: "Runden kunne ikke hentes", text: "Tidligere lagringer i denne demofanen beholdes.", code: "FEIL 503 · RUNDE · 05.10.2026 16:40" }}>
      {state === "tom" ? <EmptyState icon="flag" title="Ingen runde i gang" text="Start en runde, så fører du score hull for hull." action="Registrer runde" actionIcon="flag" onAction={() => go("PH-RD-01")} />
        : <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", minWidth: 0, maxWidth: 640, width: "100%", marginInline: "auto" }}>
            {variant === "avbrutt" && !resumed && <RoundStatus kind="avbrutt" at="Hull 7 · 16:12" onContinue={() => setResumed(true)} onFinish={() => {X.saveRound({holes,mode:"hull"});go("PH-RD-08");}} />}
            <HoleStrip holes={holes} current={cur} onHole={(i) => { put(); setCur(i); setVal({}); }} />
            {(variant !== "avbrutt" || resumed) && <HoleEntry key={cur} hole={h} value={{ score: val.score ?? h.score, putts: val.putts ?? h.putts, ...val }} onChange={setVal} onNext={next} last={cur === holes.length-1} />}
          </div>}
    </Gate>
  </NS.Page>;
}
window.AK_SCREENS["PH-08"] = { id: "PH-08", name: "Runde live", route: "/portal/runde/live", Component: PH08 };
})();
