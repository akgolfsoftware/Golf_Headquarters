/* PH-IUP-01 Fireukerssjekk og PH-IUP-02 Sesongevaluering · familie 1a · Kandidat 05.10.2026.
   Spørsmålene står uendret i data/iup2027.js (IUP 2027, skala 1–5 og 1–4). D-20: ett område om gangen med StepProgress, svaret først i Levert-visningen.
   Vises bare for spillere i en WANG- eller Team Norway-gruppe (D-04). Svarene ligger i PlayerHQ (D-02) og autolagres. */
(() => {
const NS = window.AKGolfPrecisionAthletics_7d7c29, H = window.AK_HOST, F = window.AK_FMT;
const now = () => new Date().toTimeString().slice(0, 5);
const load = (k, d) => { try { return JSON.parse(sessionStorage.getItem(k)) || d; } catch (e) { return d; } };
const keep = (k, v) => { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
/* Demolagring (oppdrag 57): nøkkelen har demospiller, runde og nivå. Prototypen lagrer bare i fanen (sessionStorage), og er ikke appens lagringskontrakt. */
const demoKey = (p, runde, niva) => "iup-demo:" + p.id + ":" + runde + ":" + niva;
const today = () => new Date().toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric" });
const DemoMerke = () => <NS.StatusPill tone="neutral">Demodata · lagres ikke</NS.StatusPill>;
const mean = (ids, svar) => { const v = ids.map((id) => svar[id]).filter((x) => x != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
const seenBy = (p) => { const S = window.AK_DATA.sharing[p.id] || {}, o = [["wang", "WANG"], ["team-norway", "Team Norway"]].filter(([k]) => S[k] && S[k].status === "aktiv" && S[k].scope.includes("iup")).map(([, n]) => n), all = ["Anders", ...o]; return all.length === 1 ? all[0] : all.slice(0, -1).join(", ") + " og " + all[all.length - 1]; };
/* Lagrestatus: Lagrer … → Lagret hh:mm (masteren · lagring) */
function useSave(key, init) {
  const [v, setV] = React.useState(() => load(key, init)), [s, setS] = React.useState({ st: "ikke-lagret", at: null }), t = React.useRef(null);
  const set = (fn) => setV((o) => { const n = typeof fn === "function" ? fn(o) : fn; keep(key, n); setS({ st: "lagrer", at: null }); clearTimeout(t.current); t.current = setTimeout(() => setS({ st: "lagret", at: now() }), 500); return n; });
  return [v, set, s];
}
const SaveMeta = ({ s }) => <NS.Meta>{s.st === "lagrer" ? "LAGRER …" : s.st === "lagret" ? "LAGRET " + s.at : "IKKE LAGRET"}</NS.Meta>;
function NotIup({ go }) { return <NS.EmptyState icon="clipboard-check" title="IUP er ikke aktiv for deg" text="IUP vises når du er med i en WANG- eller Team Norway-gruppe." action="Gå til I dag" actionIcon="sun" onAction={() => go("PH-01")} />; }
const Sec = ({ label, kicker, children, footer }) => <section aria-label={label} className="pa-card" style={{ padding: "var(--space-4)", gap: "var(--space-4)", minWidth: 0 }}>{kicker && <span className="kicker">{kicker}</span>}{children}{footer}</section>;
const Q = ({ children }) => <span style={{ font: "var(--type-title-s)", color: "var(--text-primary)", textWrap: "pretty" }}>{children}</span>;

/* ---------- PH-IUP-01 Fireukerssjekk ---------- */
function Levert({ go, player, lvl, rec }) {
  const { Chart, BarRow, Button, Meta, InlineAlert } = NS, I = window.IUP27, L = window.AK_DATA.phqIdag.iupLevert;
  /* Det som faktisk ble levert i demoen (rec). Forrige runde er demodata. */
  const prev = lvl === L.niva ? L.forrige : null, svar = rec.ans || {};
  const rows = I.niva[lvl].map(([area, qs]) => { const ids = qs.map((q) => q[0]), a = mean(ids, svar), b = prev ? mean(ids, prev.svar) : null; return { area, a, b, d: a != null && b != null ? a - b : null }; });
  const up = rows.filter((r) => r.d > 0.05).length, down = rows.filter((r) => r.d < -0.05).length, best = rows.filter((r) => r.d != null).sort((x, y) => y.d - x.d)[0];
  return <>
    <InlineAlert tone="ok" title={"Levert " + rec.levert}>{seenBy(player) + " ser svarene."}</InlineAlert>
    <Sec label="Snitt per område" kicker="Snitt per område mot forrige runde">
      <p style={{ margin: 0, font: "var(--type-title-s)", color: "var(--text-primary)", textWrap: "pretty" }}>{prev ? up + " områder opp, " + down + " ned siden uke " + prev.uker + "." + (best && best.d > 0.05 ? " Mest fremgang: " + best.area + " (+" + F.dec(best.d) + ")." : "") : "Første sjekk på dette nivået. Neste runde får du sammenligning."}</p>
      <Chart footer={"SKALA 1–5 · UKE " + rec.uker + " LEVERT " + rec.levert + (prev ? " · MERKE = UKE " + prev.uker + " (" + prev.dato + ")" : "")}>
        {rows.map((r) => <BarRow key={r.area} label={r.area} value={r.a == null ? null : Math.round(r.a * 10) / 10} min={0} max={5} goal={r.b == null ? undefined : Math.round(r.b * 10) / 10} goalLabel="Forrige" display={F.dec(r.a)} meta={r.d == null ? "FORRIGE —" : "FORRIGE " + F.dec(r.b) + " · " + (r.d > 0.04 ? "+" : r.d < -0.04 ? "−" : "±") + F.dec(Math.abs(r.d)).replace("−", "")} />)}
      </Chart>
    </Sec>
    <div><Button variant="secondary" icon="arrow-left" onClick={() => go("PH-01")}>Tilbake til I dag</Button></div>
  </>;
}
function Sjekk({ go, player, lvl, setLevert, k }) {
  const { StepProgress, ScaleSelect, Button, Meta } = NS, I = window.IUP27, C = window.AK_DATA.phqIdag.check, { mob } = H.useW();
  /* Prosessmålene vurderes først, på egen side før områdene. StepProgress viser bare de sju områdene (8 steg ga under 44 px per steg i 390). */
  const pm = ["Prosessmål", C.process.map((t, i) => ["pm-" + i, t])], areas = I.niva[lvl];
  const [v, set, s] = useSave(k, { ans: {} });
  const [cur, setCur] = React.useState(() => { if (pm[1].some(([id]) => v.ans[id] == null)) return -1; const i = areas.findIndex(([, qs]) => qs.some(([id]) => v.ans[id] == null)); return i < 0 ? areas.length - 1 : i; });
  const doneArea = (qs) => qs.every(([id]) => v.ans[id] != null);
  const steps = areas.map(([a, qs]) => ({ label: a, status: doneArea(qs) ? "lagret" : "ikke-lagret" }));
  const reached = Math.max(cur, ...areas.map((x, i) => (doneArea(x[1]) ? i + 1 : 0)).map((i) => Math.min(i, areas.length - 1)));
  const [area, qs] = cur < 0 ? pm : areas[cur], last = cur === areas.length - 1, all = doneArea(pm[1]) && areas.every(([, q]) => doneArea(q));
  const answered = Object.keys(v.ans).filter((k) => !k.startsWith("pm-")).length;
  return <>
    {cur < 0 ? <NS.Meta>FØRST: PROSESSMÅLENE DINE · DERETTER {areas.length} OMRÅDER</NS.Meta> : <StepProgress steps={steps} current={cur} reached={reached} noun="Område" onStep={setCur} />}
    <Sec label={area} kicker={area + " · " + qs.filter(([id]) => v.ans[id] != null).length + " av " + qs.length + " svart"} footer={<div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-2)", flexWrap: "wrap", borderTop: "var(--border-w) solid var(--border-hairline)", paddingTop: "var(--space-3)" }}><SaveMeta s={s} /><Meta>{answered} AV {I.antall[lvl]} SPØRSMÅL · NIVÅ {I.nivaNavn[lvl].toUpperCase()}</Meta></div>}>
      {qs.map(([id, t], i) => <div key={id} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", paddingTop: i ? "var(--space-4)" : 0, borderTop: i ? "var(--border-w) solid var(--border-hairline)" : "none" }}>
        <Q>{t}</Q>
        <ScaleSelect preset="1-5" value={v.ans[id] ?? null} minLabel={I.skala[0]} maxLabel={I.skala[4]} onChange={(x) => set((o) => ({ ...o, ans: { ...o.ans, [id]: Number(x) } }))} />
      </div>)}
    </Sec>
    <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", flexDirection: mob ? "column" : "row" }}>
      {!last && <Button size="lg" fullWidth={mob} iconRight="arrow-right" disabled={!doneArea(qs)} onClick={() => setCur(cur + 1)}>{cur < 0 ? "Start områdene" : "Neste område"}</Button>}
      {cur === 0 && <Button size="lg" variant="ghost" fullWidth={mob} icon="arrow-left" onClick={() => setCur(-1)}>Prosessmål</Button>}
      {last && <Button size="lg" fullWidth={mob} icon="send" disabled={!all} onClick={() => { const n = { ...v, levert: today(), uker: C.weeks }; keep(k, n); set(n); H.toast("Sjekken er levert", seenBy(player).toUpperCase() + " SER SVARENE"); setLevert(true); }}>Lever sjekken</Button>}
    </div>
    {!doneArea(qs) && <Meta>SVAR PÅ ALLE I OMRÅDET FOR Å GÅ VIDERE · DU KAN GÅ TILBAKE NÅR SOM HELST</Meta>}
  </>;
}
function makeFT(force) {
  return function FT({ state, setState, go, player }) {
    const { PageHeader, Gate, Meta } = NS, I = window.IUP27, C = window.AK_DATA.phqIdag.check, A = window.AK_DATA;
    const lvl = force === "ung" ? "ung" : force === "levert" ? "junior" : player.born >= 2011 ? "ung" : "junior";
    const k = demoKey(player, "uke-" + C.weeks, lvl), L = A.phqIdag.iupLevert;
    /* Variant «levert»: har demoen ingen levering, legges demosvarene inn som levert. Ellers vises det spilleren leverte. */
    const [rec, setRec] = React.useState(() => { const r = load(k, null); if (r && r.levert) return r; if (force === "levert") { const n = { ans: { ...L.svar }, levert: L.dato, uker: L.uker }; keep(k, n); return n; } return r; });
    const [levert, setLevertS] = React.useState(!!(rec && rec.levert));
    const setLevert = (x) => { setRec(load(k, null)); setLevertS(x); };
    const [attempts, setAttempts] = React.useState(0);
    const tom = state === "tom" || !A.iupVisible(player);
    return <NS.Page narrow bottomInset={80}>
      <PageHeader kicker={"Fireukerssjekk · uke " + (levert && rec ? rec.uker : C.weeks) + " · IUP 2027"} meta={<DemoMerke />} title={levert ? "Svarene dine" : "Fireukerssjekk"} sub={levert ? "Snitt per område mot forrige runde" : "Ett område om gangen · skala 1–5 · frist " + C.due.toLowerCase()} />
      <Gate state={state === "tom" ? "data" : state} loading="Henter sjekken …" attempts={attempts} onRetry={() => { setAttempts((n) => n + 1); setState("data"); }} error={{ title: "Kunne ikke hente sjekken", text: "Tilkoblingen ble brutt. Svarene du har gitt, er lagret.", code: "FEIL 503 · IUP · FIREUKERSSJEKK" }}>
        {tom ? <NotIup go={go} /> : levert && rec ? <Levert go={go} player={player} lvl={lvl} rec={rec} /> : <Sjekk go={go} player={player} lvl={lvl} setLevert={setLevert} k={k} />}
      </Gate>
    </NS.Page>;
  };
}

/* ---------- PH-IUP-02 Sesongevaluering ---------- */
function PH_IUP_02({ state, setState, go, player }) {
  const { PageHeader, Gate, StepProgress, ScaleSelect, Input, Allocation, Button, Meta, InlineAlert } = NS, I = window.IUP27, A = window.AK_DATA, { mob } = H.useW();
  const open = I.sesong.filter((q) => q[2] === "fritekst"), stmts = I.sesong.filter((q) => q[2] === "skala-1-4");
  const [v, set, s] = useSave(demoKey(player, "sesong-2026", "sesong"), { fri: {}, skala: {}, tid: { actual: { ...I.tid.faktisk }, target: { fys: null, tek: null, slag: null, spill: null, turn: null } }, punkt: ["", "", ""] });
  const [cur, setCur] = React.useState(0), [attempts, setAttempts] = React.useState(0), [levert, setLevert] = React.useState(!!v.levert);
  const sum = (c) => Object.values(c || {}).reduce((a, b) => a + (b || 0), 0);
  const ok = [open.every(([id]) => (v.fri[id] || "").trim()), stmts.every(([id]) => v.skala[id] != null), sum(v.tid.actual) === 100 && sum(v.tid.target) === 100, v.punkt.filter((p) => p.trim()).length >= 3];
  const names = ["Åpne spørsmål", "Påstander", "Tidsfordeling", "Forbedringspunkter"];
  const steps = names.map((l, i) => ({ label: l, status: ok[i] ? "lagret" : "ikke-lagret" }));
  const reached = Math.max(cur, ok.lastIndexOf(true) + 1 > 3 ? 3 : ok.lastIndexOf(true) + 1);
  const tom = state === "tom" || !A.iupVisible(player);
  const foot = <div style={{ borderTop: "var(--border-w) solid var(--border-hairline)", paddingTop: "var(--space-3)" }}><SaveMeta s={s} /></div>;
  return <NS.Page narrow bottomInset={80}>
    <PageHeader kicker={"Sesongevaluering 2026 · uke 42 · " + I.runde.sesong.split("· ")[1]} title="Sesongevaluering" meta={<DemoMerke />} sub={levert ? "Levert " + (v.levert || "") : "Fire steg · tar rundt 20 minutter · du kan ta pause når som helst"} />
    <Gate state={state === "tom" ? "data" : state} loading="Henter evalueringen …" attempts={attempts} onRetry={() => { setAttempts((n) => n + 1); setState("data"); }} error={{ title: "Kunne ikke hente evalueringen", text: "Tilkoblingen ble brutt. Svarene du har gitt, er lagret.", code: "FEIL 503 · IUP · SESONGEVALUERING" }}>
      {tom ? <NotIup go={go} /> : levert ? <>
        <InlineAlert tone="ok" title="Evalueringen er levert">{seenBy(player) + " ser svarene. Forbedringspunktene tas med inn i årsplanen for 2027."}</InlineAlert>
        <Sec label="Forbedringspunkter" kicker={"Forbedringspunkter · " + v.punkt.filter((p) => p.trim()).length}>{v.punkt.filter((p) => p.trim()).map((p, i) => <span key={i} style={{ font: "var(--type-body)", color: "var(--text-primary)", textWrap: "pretty" }}>{i + 1}. {p}</span>)}</Sec>
        <div><Button variant="secondary" icon="arrow-left" onClick={() => go("PH-01")}>Tilbake til I dag</Button></div>
      </> : <>
        <StepProgress steps={steps} current={cur} reached={reached} noun="Steg" onStep={setCur} />
        {cur === 0 && <Sec label="Åpne spørsmål" kicker="Åpne spørsmål" footer={foot}>{open.map(([id, t]) => <Input key={id} multiline rows={3} maxLength={800} label={t} value={v.fri[id] || ""} onChange={(e) => { const x = e.target.value; set((o) => ({ ...o, fri: { ...o.fri, [id]: x } })); }} saveState={s.st} savedAt={s.at || undefined} />)}</Sec>}
        {cur === 1 && <Sec label="Påstander" kicker={"Påstander · " + stmts.filter(([id]) => v.skala[id] != null).length + " av " + stmts.length + " svart · skala 1–4"} footer={foot}>
          {stmts.map(([id, t], i) => <div key={id} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", paddingTop: i ? "var(--space-4)" : 0, borderTop: i ? "var(--border-w) solid var(--border-hairline)" : "none" }}><Q>{t}</Q><ScaleSelect preset="1-4" value={v.skala[id] ?? null} onChange={(x) => set((o) => ({ ...o, skala: { ...o.skala, [id]: Number(x) } }))} /></div>)}
        </Sec>}
        {cur === 2 && <Sec label="Tidsfordeling" kicker="Tidsfordeling 2026 og ønsket for 2027" footer={foot}>
          <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>Faktisk er hentet fra øktloggen. Endre den hvis noe mangler, og fordel ønsket tid for neste sesong. Begge må bli 100 %.</p>
          <Allocation value={v.tid} onChange={(x) => set((o) => ({ ...o, tid: x }))} readOnly={[]} step={5} caption={I.tid.kilde} />
        </Sec>}
        {cur === 3 && <Sec label="Forbedringspunkter" kicker={"Forbedringspunkter · minst tre · " + v.punkt.filter((p) => p.trim()).length + " skrevet"} footer={foot}>
          {v.punkt.map((p, i) => <Input key={i} multiline rows={2} maxLength={300} label={"Punkt " + (i + 1)} value={p} onChange={(e) => { const x = e.target.value; set((o) => ({ ...o, punkt: o.punkt.map((q, j) => (j === i ? x : q)) })); }} />)}
          <div><Button variant="ghost" icon="plus" onClick={() => set((o) => ({ ...o, punkt: [...o.punkt, ""] }))}>Legg til punkt</Button></div>
        </Sec>}
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", flexDirection: mob ? "column" : "row" }}>
          {cur < 3 && <Button size="lg" fullWidth={mob} iconRight="arrow-right" disabled={!ok[cur]} onClick={() => setCur(cur + 1)}>Neste steg</Button>}
          {cur === 3 && <Button size="lg" fullWidth={mob} icon="send" disabled={!ok.every(Boolean)} onClick={() => { set((o) => ({ ...o, levert: today() })); setLevert(true); H.toast("Evalueringen er levert", seenBy(player).toUpperCase() + " SER SVARENE"); }}>Lever evalueringen</Button>}
        </div>
        {!ok[cur] && <Meta>{cur === 2 ? "FAKTISK " + sum(v.tid.actual) + " % · ØNSKET " + sum(v.tid.target) + " % · BEGGE MÅ BLI 100 %" : cur === 3 ? "SKRIV MINST TRE PUNKTER" : "SVAR PÅ ALLE FOR Å GÅ VIDERE"}</Meta>}
      </>}
    </Gate>
  </NS.Page>;
}
const S = window.AK_SCREENS;
S["PH-IUP-01"] = { id: "PH-IUP-01", name: "Fireukerssjekk", route: "/portal/iup/fireukerssjekk", Component: makeFT(null) };
S["PH-IUP-01-UNG"] = { id: "PH-IUP-01-UNG", name: "Fireukerssjekk · Ung", route: "/portal/iup/fireukerssjekk", Component: makeFT("ung") };
S["PH-IUP-01-LEVERT"] = { id: "PH-IUP-01-LEVERT", name: "Fireukerssjekk · levert", route: "/portal/iup/fireukerssjekk", Component: makeFT("levert") };
S["PH-IUP-02"] = { id: "PH-IUP-02", name: "Sesongevaluering", route: "/portal/iup/sesongevaluering", Component: PH_IUP_02 };
})();
