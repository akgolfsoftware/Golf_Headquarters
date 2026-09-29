(() => {
const { Button, StatusPill, Select, Segmented, Toast } = window.AKGolfPrecisionAthletics_7d7c29;
const PM = window.PM;
const RANGES = { "År": [1, 52], "Periode": [36, 44], "Måned": [40, 44] };

function PlanEngine({ onToast, w = 1280 }) {
  const mob = w < 600;
  const [sessions, setSessions] = React.useState(PM.sessions);
  const [target, setTarget] = React.useState(25);
  const [sel, setSel] = React.useState("e");
  const [zoom, setZoom] = React.useState("År");
  const [composer, setComposer] = React.useState(null);
  const [dirty, setDirty] = React.useState(0);
  const say = (t, m) => onToast && onToast(t, m);

  const weekMin = sessions.reduce((a, s) => a + PM.sessionMin(s), 0);
  const w40 = PM.weeks.find((w) => w.w === PM.CURRENT_WEEK).planned * 60;
  const sumWeeks = (a, b) => PM.weeks.filter((w) => w.w >= a && w.w <= b).reduce((x, w) => x + w.planned * 60, 0) - (PM.CURRENT_WEEK >= a && PM.CURRENT_WEEK <= b ? w40 - weekMin : 0);
  const yearMin = sumWeeks(1, 52), periodMin = sumWeeks(36, 44), monthMin = sumWeeks(40, 44);
  const doneMin = PM.weeks.reduce((a, w) => a + w.done * 60, 0);
  const s = sessions.find((x) => x.id === sel);

  const update = (fn) => { setSessions((all) => all.map((x) => x.id === sel ? fn(x) : x)); setDirty((n) => n + 1); };
  const addDrill = (d) => {
    const id = composer.id;
    const { sessionName, ...drill } = d;
    setSessions((all) => all.map((x) => x.id === id ? { ...x, name: x.name || sessionName, drills: [...x.drills, { ...drill, id: Math.random().toString(36).slice(2, 8) }] } : x));
    setDirty((n) => n + 1); setComposer(null); setSel(id);
    say(d.title + " lagt til", "+" + PM.fmtHM(d.min) + " · UKE " + PM.fmtH(weekMin + d.min) + " / " + target + " T");
  };
  const addSession = (day) => {
    const id = "n" + Date.now();
    setSessions((all) => [...all, { id, day, t: "16:00", drills: [] }]);
    setSel(id); setComposer({ id });
  };
  const publish = () => { setDirty(0); say("Uke 40 publisert til Ida Berg", "DELT 14:02 · " + sessions.length + " ØKTER · " + PM.fmtH(weekMin) + " T"); };

  const cells = [
    { level: "År 2026", name: "Makromål", planned: PM.fmtN(yearMin / 60), target: PM.fmtN(PM.YEAR_TARGET), sub: PM.fmtN(doneMin / 60) + " T FULLFØRT", active: zoom === "År", onClick: () => setZoom("År") },
    { level: "Periode", name: "Spesialperiode høst · U36–44", planned: Math.round(periodMin / 60), target: 216, sub: "FOKUS SLAG · SPILL", active: zoom === "Periode", onClick: () => setZoom("Periode") },
    { level: "Måned", name: "Oktober · U40–44", planned: Math.round(monthMin / 60), target: 120, sub: "5 UKER", active: zoom === "Måned", onClick: () => setZoom("Måned") },
    { level: "Uke 40", name: "28.09–04.10", planned: PM.fmtH(weekMin), target, sub: sessions.length + " ØKTER", active: true, onClick: () => {} },
    { level: "Økt", name: s ? PM.days[s.day] + " · " + PM.sessionTitle(s) : "—", planned: s ? PM.fmtHM(PM.sessionMin(s)) : "—", target: null, sub: s ? s.drills.length + " ØVELSER" : "VELG ØKT", active: !!s, onClick: () => {} },
  ];

  return (
    <div style={{ padding: "var(--page-y) var(--page-x) 48px", display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 240px", minWidth: 0, marginRight: 8 }}><div className="kicker">Workbench · Sesong 2026</div><h1 style={{ font: "600 clamp(22px, 1.2vw + 16px, 28px)/1.15 var(--font-sans)", color: "var(--text-primary)", marginTop: 8 }}>Ida Berg</h1></div>
        <div style={{ flex: mob ? "1 1 100%" : "0 1 200px", minWidth: 0 }}><Select options={["Ida Berg", "Jonas Lie", "Sara Holm", "Maja Strand"]} /></div>
        {dirty > 0 ? <StatusPill tone="signal">Ikke publisert · {dirty} endringer</StatusPill> : <StatusPill tone="ok">Publisert</StatusPill>}
        <div style={{ flex: mob ? "1 1 auto" : "none", display: "flex", justifyContent: "flex-end" }}><Button icon="send" onClick={publish} disabled={!dirty}>{mob ? "Publiser" : "Publiser til spiller"}</Button></div>
      </div>

      <div className="pa-card" style={{ padding: 16, gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ font: "var(--type-title-s)", color: "var(--text-primary)", minWidth: 0 }}>{zoom === "År" ? "Årsplan og sesongkurve" : zoom === "Periode" ? "Spesialperiode høst" : "Oktober"}</span>
          <span style={{ font: "var(--type-meta)", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{zoom === "År" ? "UKE 1–52 · TIMER PER UKE" : zoom === "Periode" ? "UKE 36–44 · BUDSJETT 216 T" : "UKE 40–44 · BUDSJETT 120 T"}</span>
          <span style={{ flex: 1 }} />
          <div style={{ flex: mob ? "1 1 100%" : "none" }}><Segmented options={["År", "Periode", "Måned"]} value={zoom} onChange={setZoom} fullWidth={mob} /></div>
        </div>
        <YearCurve weeks={PM.weeks} range={RANGES[zoom]} currentMin={weekMin} currentAxes={Object.fromEntries(PM.AXES.map((x) => [x, sessions.reduce((t, s) => t + s.drills.filter((d) => d.axis === x).reduce((u, d) => u + d.min, 0), 0)]))} activePeriod={zoom !== "År" ? "s2" : null} onPickPeriod={(id) => setZoom(id === "s2" ? "Periode" : "År")} />
      </div>

      <Cascade cells={cells} />

      <div style={{ display: "grid", gridTemplateColumns: w > 1024 ? "minmax(0,1.6fr) minmax(0,1fr)" : "minmax(0,1fr)", gap: 16, alignItems: "start" }}>
        <div className="pa-card" style={{ padding: 16, gap: 16, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}><span style={{ font: "var(--type-title-s)", color: "var(--text-primary)" }}>Uke 40</span><span style={{ font: "var(--type-meta)", color: "var(--text-muted)", minWidth: 0 }}>28.09–04.10 · SPESIALPERIODE HØST</span></div>
          <WeekMeter sessions={sessions} target={target} setTarget={setTarget} />
          <WeekBoard sessions={sessions} selected={sel} onSelect={setSel} onAddSession={addSession} />
        </div>
        <SessionPanel s={s} onOpenComposer={() => setComposer({ id: sel })}
          onEdit={(id, dm) => update((x) => ({ ...x, drills: x.drills.map((d) => d.id === id ? { ...d, min: Math.max(5, d.min + dm) } : d) }))}
          onRemove={(id) => update((x) => ({ ...x, drills: x.drills.filter((d) => d.id !== id) }))} />
      </div>

      {composer && (
        <div className="pa-scrim" onClick={() => { setSessions((all) => all.filter((x) => x.drills.length || x.id !== composer.id)); setComposer(null); }}>
          <div style={{ width: "100%", maxWidth: 760, maxHeight: "calc(100vh - 48px)", display: "flex", minWidth: 0 }} onClick={(e) => e.stopPropagation()}>
            <ExerciseComposer keyboard context={(() => { const x = sessions.find((y) => y.id === composer.id); return x ? PM.days[x.day] + " · " + x.t + " · " + PM.sessionTitle(x) : ""; })()} onAdd={addDrill} onClose={() => { setSessions((all) => all.filter((x) => x.drills.length || x.id !== composer.id)); setComposer(null); }} />
          </div>
        </div>
      )}
    </div>
  );
}
Object.assign(window, { PlanEngine });
})();
