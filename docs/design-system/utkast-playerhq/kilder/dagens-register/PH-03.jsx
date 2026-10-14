/* PH-03 Øktark · familie 1a · Kandidat 05.10.2026.
   Én øvelse om gangen med StepProgress. AK-formelen vises som FormulaCode på hver øvelse. Start økt · Fullfør · Hopp over.
   Bygget på _eksport-skjermprosjekt/ui_kits/playerhq/screens/PH-03.jsx (handlinger, årsaker for Hopp over) med designsystemets komponenter. Data: data/phq-idag.js (okter). */
(() => {
const NS = window.AKGolfPrecisionAthletics_7d7c29, H = window.AK_HOST;
const AXN = { fys: "FYS", tek: "TEK", slag: "SLAG", spill: "SPILL", turn: "TURN" };
const TONE = { Planlagt: "neutral", "Pågår": "info", "Gjennomført": "ok", "Hoppet over": "warn" };

function Ovelse({ e, i, n, st }) {
  const { AxisSection, AxisBadge, FormulaCode, Meta, Num, StatusPill } = NS;
  return <AxisSection axes={[e.axis]} kicker={"Øvelse " + (i + 1) + " av " + n} title={e.n} action={<StatusPill tone={st === "ferdig" ? "ok" : st === "hoppet" ? "warn" : "neutral"}>{st === "ferdig" ? "Gjennomført" : st === "hoppet" ? "Hoppet over" : "Planlagt"}</StatusPill>}
    footer={(e.club ? "KØLLE " + e.club.toUpperCase() : "") + (e.p ? " · " + e.p : "")}>
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-2)", flexWrap: "wrap" }}>
        <Num s={{ font: "var(--type-metric)" }}>{e.qty}</Num><span style={{ font: "var(--type-label)", color: "var(--text-secondary)" }}>{e.unit}</span>
        <Meta s={{ marginLeft: "auto" }}>{e.min} MIN</Meta>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", minWidth: 0 }}>
        <span className="kicker">AK-formelen</span>
        {e.code ? <FormulaCode code={e.code} /> : <Meta>—</Meta>}
      </div>
      <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", flexWrap: "wrap" }}><AxisBadge axis={e.axis} /><Meta>{AXN[e.axis]} · {e.qty} {e.unit.toUpperCase()}</Meta></div>
    </div>
  </AxisSection>;
}

function PH03({ state, setState, go }) {
  const { PageHeader, Gate, Button, StepProgress, StatusPill, EmptyState, Sheet, ChoicePill, Meta, InlineAlert } = NS;
  const { mob } = H.useW(), D = window.AK_DATA.phqIdag;
  const sel = (window.PHQ_SEL && D.okter[window.PHQ_SEL.sessionId]) || D.okter["okt-0510"];
  const ex = state === "tom" ? [] : sel.ex;
  const [status, setStatus] = React.useState("Planlagt"), [cur, setCur] = React.useState(0), [res, setRes] = React.useState({});
  const [skip, setSkip] = React.useState(false), [why, setWhy] = React.useState(null), [attempts, setAttempts] = React.useState(0);
  const done = Object.values(res).filter((x) => x === "ferdig").length, handled = Object.keys(res).length, last = handled >= ex.length;
  const mark = (v) => { setRes((r) => ({ ...r, [cur]: v })); H.toast(v === "ferdig" ? "Øvelsen er gjennomført" : "Øvelsen er hoppet over", (cur + 1) + " AV " + ex.length + " · LAGRET"); if (cur < ex.length - 1) setCur(cur + 1); };
  const steps = ex.map((e, i) => ({ label: e.n.split(" · ")[0], status: res[i] ? "lagret" : "ikke-lagret" }));
  const reached = Math.min(ex.length - 1, Math.max(cur, handled));
  return <NS.Page narrow bottomInset={80}>
    <PageHeader kicker={"I dag " + sel.time + "–" + sel.end + " · " + sel.place} title={sel.title} sub={sel.min + " min · " + ex.length + " øvelser · " + sel.focus} meta={<StatusPill tone={TONE[status]}>{status}</StatusPill>} />
    <Gate state={state} loading="Henter økta …" attempts={attempts} onRetry={() => { setAttempts((n) => n + 1); setState("data"); }} error={{ title: "Kunne ikke hente økta", text: "Tilkoblingen ble brutt. Ingenting er endret i økta.", code: "FEIL 503 · ØKTARK · " + sel.id.toUpperCase() }}>
      {!ex.length ? <EmptyState icon="plus" title="Økta har ingen øvelser" text="Legg til øvelser i Workbench, så kan du starte økta." action="Legg til øvelse" actionIcon="plus" onAction={() => go("PH-11")} /> : <>
        <section aria-label="Mål for økta" className="pa-card" style={{ padding: "var(--space-4)", gap: "var(--space-2)" }}>
          <span className="kicker">Mål for økta</span>
          <p style={{ margin: 0, font: "var(--type-title-s)", color: "var(--text-primary)", textWrap: "pretty" }}>{sel.goal}</p>
          <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>{sel.note}</p>
          <Meta>{sel.noteFrom.toUpperCase()}</Meta>
        </section>
        {status === "Hoppet over" ? <InlineAlert tone="warn" title="Økta er hoppet over">{"Årsak: " + why + ". " + D.player.coachFirst + " ser årsaken og kan flytte økta."}</InlineAlert> : <>
          {status !== "Planlagt" && <StepProgress steps={steps} current={cur} reached={reached} noun="Øvelse" onStep={(i) => setCur(i)} />}
          <Ovelse e={ex[cur]} i={cur} n={ex.length} st={res[cur]} />
        </>}
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", flexDirection: mob ? "column" : "row" }}>
          {status === "Planlagt" && <><Button size="xl" fullWidth={mob} icon="play" onClick={() => { setStatus("Pågår"); H.toast("Økta er startet", sel.time + " · " + sel.title.toUpperCase()); }}>Start økt</Button><Button size="xl" variant="secondary" fullWidth={mob} onClick={() => setSkip(true)}>Hopp over økt</Button></>}
          {status === "Pågår" && !last && <><Button size="xl" fullWidth={mob} icon="check" onClick={() => mark("ferdig")}>Fullfør øvelse</Button><Button size="xl" variant="ghost" fullWidth={mob} onClick={() => mark("hoppet")}>Hopp over øvelse</Button></>}
          {status === "Pågår" && last && <Button size="xl" fullWidth={mob} icon="check" onClick={() => { setStatus("Gjennomført"); H.toast("Økta er gjennomført", done + " AV " + ex.length + " ØVELSER · LAGRET"); }}>Fullfør økt</Button>}
          {status === "Gjennomført" && <Button size="xl" variant="secondary" fullWidth={mob} iconRight="arrow-right" onClick={() => go("PH-07")}>Se oppsummering</Button>}
          {status === "Hoppet over" && <Button size="xl" variant="ghost" fullWidth={mob} icon="undo-2" onClick={() => { setStatus("Planlagt"); setWhy(null); }}>Angre</Button>}
        </div>
        <Meta>{status === "Planlagt" ? "IKKE STARTET" : done + " AV " + ex.length + " GJENNOMFØRT · " + (handled - done) + " HOPPET OVER"}</Meta>
      </>}
    </Gate>
    <Sheet open={skip} onClose={() => setSkip(false)} kicker={"Hoppe over · " + sel.time} title={sel.title} footer={<Button fullWidth disabled={!why} onClick={() => { setStatus("Hoppet over"); setSkip(false); H.toast("Økta er hoppet over", why.toUpperCase() + " · " + D.player.coachFirst.toUpperCase() + " FÅR BESKJED"); }}>Hopp over økt</Button>}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Velg årsak. Coachen din ser den og kan flytte økta.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>{D.hoppOver.map((r) => <ChoicePill key={r} selected={why === r} onClick={() => setWhy(r)}>{r}</ChoicePill>)}</div>
      </div>
    </Sheet>
  </NS.Page>;
}
window.AK_SCREENS["PH-03"] = { id: "PH-03", name: "Øktark", route: "/portal/gjennomfore/[id]", Component: PH03 };
})();
