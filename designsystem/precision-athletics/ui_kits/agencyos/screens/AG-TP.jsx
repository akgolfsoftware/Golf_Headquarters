(() => {
/* AG-TP-01 · Oppgaveskjema (inspektør 340 over 1024, ark på 1024 og smalere). AG-TP-02 · Før og nå per posisjon. */
const hhmm = () => { const d = new Date(); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
function fromTask(t) {
  const D = window.TP_DATA;
  if (!t) return { id: null, pos: null, title: "", shot: "", area: null, steps: [], focus: null, club: null, envs: [], press: null, gear: "Uten", tm: [], repStep: {}, repEnv: {}, rep: 0, proto: null };
  return { id: t.id, step: t.step, env: t.env, pos: t.pos, title: t.title, shot: t.shot, area: t.area, steps: t.steps.map((s) => s[0]).filter(Boolean), focus: t.focus, club: t.club, envs: t.envs.filter((e) => e[2] != null).map((e) => e[0]), press: t.press, gear: t.gear,
    tm: t.tm ? t.tm.rows.map((r) => ({ k: r.k, lo: r.lo, hi: r.hi })) : [], repStep: Object.fromEntries(t.steps.filter((s) => s[0]).map((s) => [s[0], s[2]])), repEnv: Object.fromEntries(t.envs.filter((e) => e[2] != null).map((e) => [e[0], e[2]])), rep: t.steps.length === 1 && !t.steps[0][0] ? t.steps[0][2] : 0, proto: t.proto ? { type: t.proto.type, shots: t.proto.shots, hits: t.proto.hits } : null };
}
function TPG({ label, hint, children }) { return <div role="group" aria-label={label} style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 14, borderTop: "1px solid var(--border-hairline)" }}><span style={{ font: "500 13px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{label}</span>{hint && <window.AGQ.Meta>{hint}</window.AGQ.Meta>}{children}</div>; }
function AGTP01({ state, go, arg, nav }) {
  const { PageHeader, Button, ChoicePill, Stepper, FormField, TextInput, Select, Sheet, InlineAlert, EmptyState } = window.AGQ.ns();
  const A = window.AGQ, TP = window.TP, D = window.TP_DATA, V = window.AK_VOCAB, { mob, desk, cw } = A.useW();
  const fromTest = arg === "fra-test", base = state === "tom" || arg === "ny" || fromTest ? null : D.tasks.find((t) => t.id === arg) || D.tasks[0];
  const [f, setF] = React.useState(() => fromTask(base)), [sheet, setSheet] = React.useState(true), [st, setSt] = React.useState(base ? "pub" : "new"), [at, setAt] = React.useState(null);
  const up = (p) => { setF((o) => ({ ...o, ...p })); setSt("dirty"); nav && nav.setDirty(true); };
  const fam = f.area ? D.family(f.area) : null, full = fam === "Fullsving", sand = fam === "Bunker", radar = D.RADAR.includes(f.gear);
  const stepList = full ? D.STEPS_FULL : sand ? D.STEPS_SAND : [];
  const togg = (arr, v) => arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  const curStep = full ? (f.steps.includes(f.step) ? f.step : f.steps[0]) : null, curEnv = f.envs.includes(f.env) ? f.env : f.envs[0];
  const formula = D.formula({ area: f.area, step: curStep, env: curEnv, press: f.press });
  const baseRows = base && base.tm ? base.tm.rows : [];
  const sumSteps = stepList.length ? f.steps.reduce((a, c) => a + (f.repStep[c] || 0), 0) : f.rep, sumEnv = f.envs.reduce((a, e) => a + (f.repEnv[e] || 0), 0);
  const canSave = f.pos && f.title.trim() && f.area && f.focus;
  const save = () => { if (!canSave) { A.toast("Oppgaven mangler felt", "POSISJON · TITTEL · OMRÅDE · TEKNISK FOKUS"); return; } setSt("saving"); setTimeout(() => { setSt("saved"); setAt(hhmm()); nav && nav.setDirty(false); A.toast("Oppgaven er lagret", (f.pos || "") + " · IKKE PUBLISERT"); }, 400); };
  const statusText = st === "pub" ? "Publisert 18.09.2026 · ingen endringer" : st === "new" ? "Ikke lagret · ikke publisert" : st === "dirty" ? "Endret · ikke lagret" : st === "saving" ? "Lagrer …" : st === "published" ? "Lagret " + at + " · publisert " + at : "Lagret " + at + " · ikke publisert";
  const pill = (sel, onClick, label, mono) => <ChoicePill key={label} selected={sel} aria-pressed={sel} mono={mono} onClick={onClick}>{label}</ChoicePill>;
  const row = { display: "flex", gap: 6, flexWrap: "wrap" };
  const G = TPG; const _unused = ({ label, hint, children }) => <div role="group" aria-label={label} style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 14, borderTop: "1px solid var(--border-hairline)" }}><span style={{ font: "500 13px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{label}</span>{hint && <A.Meta>{hint}</A.Meta>}{children}</div>;
  const setTm = (i, p) => up({ tm: f.tm.map((r, j) => j === i ? { ...r, ...p } : r) });
  const form = <>
    <div style={{ display: "flex", flexDirection: "column", gap: 6, position: "sticky", top: 0, zIndex: 1, background: "var(--surface-card)", paddingBottom: 10 }}><A.Meta>AK-FORMELEN · OPPDATERES FOR HVERT VALG</A.Meta><TP.Formula big>{formula}</TP.Formula></div>
    <G label="Posisjon"><div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 6 }}>{D.POS.map(([p]) => pill(f.pos === p, () => up({ pos: p }), p, true))}</div><A.Meta>{f.pos ? f.pos + " · " + D.POS.find((x) => x[0] === f.pos)[1].toUpperCase() : "IKKE VALGT"}</A.Meta></G>
    <G label="Tittel"><TextInput aria-label="Tittel" value={f.title} onChange={(e) => up({ title: e.target.value })} placeholder="Hendene foran ballen i treff" /></G>
    <G label="Slag" hint="FRITEKST · F.EKS. 7-JERN LAV FADE"><TextInput aria-label="Slag" value={f.shot} onChange={(e) => up({ shot: e.target.value })} placeholder="7-jern lav fade" /></G>
    <G label="Område"><div style={row}>{Object.keys(D.AREAS).map((k) => pill(fam === k, () => up({ area: D.AREAS[k][0], focus: null, steps: k === "Fullsving" ? D.STEPS_FULL.map((s) => s[0]) : k === "Bunker" ? D.STEPS_SAND.map((s) => s[0]) : [] }), k))}</div>
      {fam && D.AREAS[fam].length > 1 && <div style={row}>{D.AREAS[fam].map((a) => pill(f.area === a, () => up({ area: a, focus: null }), a))}</div>}</G>
    {stepList.length > 0 && <G label={full ? "Læringssteg" : "Sandtrinn"} hint={full ? "BARE FULLSVING · FORMELEN VISER STEGET SPILLEREN ER PÅ" : "UTEN BALL I SANDEN · MED BALL"}><div style={row}>{stepList.map(([c, n]) => pill(f.steps.includes(c), () => up({ steps: stepList.map((s) => s[0]).filter((x) => x === c ? !f.steps.includes(c) : f.steps.includes(x)) }), n))}</div></G>}
    <G label="Teknisk fokus" hint={f.area ? "LISTEN FØLGER OMRÅDET · MAKS ETT" : "VELG OMRÅDE FØRST"}>{f.area && <div style={row}>{V.dimsFor(f.area).map((d) => pill(f.focus === d, () => up({ focus: f.focus === d ? null : d }), d))}</div>}</G>
    <G label="Kølle"><Select aria-label="Kølle" value={f.club || ""} onChange={(e) => up({ club: e.target.value || null })} options={[{ value: "", label: "—" }].concat(D.CLUBS)} /></G>
    <G label="Miljø og press" hint="MILJØ = BELASTNING · FLERE KAN VELGES · FORMELEN VISER HOVEDMILJØET"><div style={row}>{D.ENV.map((e) => pill(f.envs.includes(e), () => up({ envs: D.ENV.filter((x) => x === e ? !f.envs.includes(e) : f.envs.includes(x)) }), e))}</div><div style={row}>{D.PRESS.map((p) => pill(f.press === p, () => up({ press: f.press === p ? null : p }), p))}</div></G>
    <G label="Måleutstyr"><div style={row}>{D.GEAR.map((g) => pill(f.gear === g, () => up({ gear: g, tm: D.RADAR.includes(g) ? (f.tm.length ? f.tm : [{ k: "Attack Angle", lo: -5, hi: -3 }]) : f.tm }), g))}</div></G>
    {radar && <G label="TrackMan-mål" hint="NEDRE OG ØVRE GRENSE · UTGANGSPUNKT HENTES FRA SISTE ØKT">
      {f.tm.map((r, i) => { const b = baseRows.find((x) => x.k === r.k), stp = r.k === "Smash Factor" ? 0.01 : 0.5, dd = r.k === "Smash Factor" ? 2 : 1;
        return <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8, padding: 10, border: "1px solid var(--border-hairline)", borderRadius: "var(--radius)" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}><div style={{ flex: 1, minWidth: 0 }}><Select aria-label="Parameter" value={r.k} onChange={(e) => setTm(i, { k: e.target.value })} options={V.TRACKMAN} /></div><Button size="sm" variant="ghost" icon="trash-2" aria-label={"Fjern " + r.k} onClick={() => up({ tm: f.tm.filter((_, j) => j !== i) })}>Fjern</Button></div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Stepper size="sm" label="Nedre" value={r.lo} step={stp} min={-99} max={r.hi} format={(v) => TP.dec(v, dd)} onChange={(v) => setTm(i, { lo: +v.toFixed(2) })} /><Stepper size="sm" label="Øvre" value={r.hi} step={stp} min={r.lo} max={999} format={(v) => TP.dec(v, dd)} onChange={(v) => setTm(i, { hi: +v.toFixed(2) })} /></div>
          <A.Meta>UTGANGSPUNKT {b ? TP.dec(b.base, dd) + " · " + (base.tm.src || "").toUpperCase() + " " + base.tm.base : "— · INGEN TRACKMAN-ØKT REGISTRERT"}</A.Meta>
        </div>; })}
      <div><Button size="sm" variant="secondary" icon="plus" onClick={() => up({ tm: [...f.tm, { k: "Club Path", lo: -1, hi: 1 }] })}>Legg til parameter</Button></div></G>}
    <G label="Rep-mål" hint={stepList.length ? "PER " + (full ? "LÆRINGSSTEG" : "SANDTRINN") + " OG PER MILJØ" : "ÉN REP-STREK · UTEN STEG"}>
      {stepList.length ? f.steps.map((c) => <Stepper key={c} size="sm" label={D.stepName(c)} value={f.repStep[c] || 0} step={10} min={0} max={1000} onChange={(v) => up({ repStep: { ...f.repStep, [c]: v } })} />) : <Stepper size="sm" label="Repetisjoner" value={f.rep} step={10} min={0} max={1000} onChange={(v) => up({ rep: v })} />}
      {stepList.length > 0 && f.steps.length === 0 && <A.Meta>VELG MINST ETT STEG FOR REP-MÅL</A.Meta>}
      {f.envs.map((e) => <Stepper key={e} size="sm" label={e} value={f.repEnv[e] || 0} step={10} min={0} max={1000} onChange={(v) => up({ repEnv: { ...f.repEnv, [e]: v } })} />)}
      <A.Meta>SUM STEG {TP.num(sumSteps)} · SUM MILJØ {TP.num(sumEnv)}{sumSteps !== sumEnv ? " · ULIK SUM, LAGRES LIKEVEL" : " · LIK SUM"}</A.Meta></G>
    <G label="Treffprotokoll" hint="VISER STATUS · LÅSER IKKE NESTE STEG">
      <div style={row}>{pill(!f.proto, () => up({ proto: null }), "Ingen")}{Object.entries(D.PROTO).map(([k, n]) => pill(f.proto && f.proto.type === k, () => up({ proto: { type: k, shots: k === "streak" ? null : (f.proto && f.proto.shots) || 20, hits: (f.proto && f.proto.hits) || (k === "gate" ? 3 : 16) } }), n))}</div>
      {f.proto && <><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{f.proto.type !== "streak" && <Stepper size="sm" label={f.proto.type === "gate" ? "Antall økter" : "Antall slag"} value={f.proto.shots} step={1} min={f.proto.hits} max={100} onChange={(v) => up({ proto: { ...f.proto, shots: v } })} />}<Stepper size="sm" label={f.proto.type === "gate" ? "Økter innenfor" : "Antall treff"} value={f.proto.hits} step={1} min={1} max={f.proto.shots || 50} onChange={(v) => up({ proto: { ...f.proto, hits: v } })} /></div>
        <p style={{ margin: 0, font: "500 14px/1.4 var(--font-sans)", color: "var(--text-primary)" }}>{D.protoText(f.proto)}</p></>}</G>
  </>;
  const foot = <><div aria-live="polite" style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-secondary)", textTransform: "uppercase", minHeight: 16 }}>{statusText}</div><Button fullWidth icon="check" loading={st === "saving"} onClick={save}>Lagre oppgave</Button><Button variant="secondary" fullWidth icon="send" disabled={st !== "saved"} onClick={() => { setSt("published"); A.toast("Publisert til Tobias Lindvik", "OPPGAVEN VISES I PLAYERHQ"); }}>Publiser til spiller</Button></>;
  const pv = { ...(base || D.tasks[0]), id: "pv", pos: f.pos || "—", title: f.title || "Uten tittel", shot: f.shot || "—", area: f.area || "—", focus: f.focus || "—", club: f.club, step: curStep, env: curEnv, press: f.press, gear: f.gear, status: base ? "Aktiv" : "Utkast",
    steps: stepList.length ? f.steps.map((c) => { const o = base && base.steps.find((s) => s[0] === c); return [c, o ? o[1] : 0, f.repStep[c] || null]; }) : [["", base && !base.steps[0][0] ? base.steps[0][1] : 0, f.rep || null]],
    envs: D.ENV.map((e) => { const o = base && base.envs.find((x) => x[0] === e); return [e, o ? o[1] : null, f.envs.includes(e) ? f.repEnv[e] || null : null]; }),
    tm: radar && f.tm.length ? { ...(base && base.tm ? base.tm : { club: f.club || "—", n: 0, src: "TrackMan", date: "—", base: "—" }), rows: f.tm.map((r) => { const b = baseRows.find((x) => x.k === r.k); return { k: r.k, u: r.k === "Smash Factor" ? "" : "°", d: r.k === "Smash Factor" ? 2 : 1, lo: r.lo, hi: r.hi, base: b ? b.base : null, now: b ? b.now : null }; }) } : null,
    proto: f.proto ? { ...f.proto, now: base && base.proto && base.proto.type === f.proto.type ? base.proto.now : 0 } : null, src: base ? base.src : "INGEN REGISTRERINGER ENNÅ" };
  const preview = <A.Stack gap={12}>
    <A.Meta>FORHÅNDSVISNING · SLIK SER TOBIAS LINDVIK OPPGAVEN</A.Meta>
    <TP.TaskCard t={pv} mob={mob} wide={desk ? cw - 380 >= 900 : cw >= 900} open={true} />
    {!desk && <div><Button variant="secondary" icon="pencil" onClick={() => setSheet(true)}>Åpne skjemaet</Button></div>}
  </A.Stack>;
  return <A.Page>
    <PageHeader kicker={"Teknisk plan · Tobias Lindvik · " + (base ? "Rediger oppgave" : "Ny oppgave")} title={base ? base.title : "Ny oppgave"} sub="Skjemaet følger AK-formelen. Et ledd som ikke gjelder, utelates. Ingen regel sperrer neste steg." actions={<Button variant="secondary" icon="arrow-left" onClick={() => go("AG-10")}>Teknisk plan</Button>} />
    <A.Gate state={state} loading="Henter oppgaven …" error={{ title: "Oppgaven kunne ikke hentes", text: "Ingenting er endret. Prøv igjen.", code: "FEIL 502 · OPPGAVE" }}>
      {fromTest && state !== "tom" && <InlineAlert tone="info" title="Fra test · Putting 5–10 fot · 24.09.2026">Du valgte «Vurder teknisk oppgave». Ingenting er fylt ut på forhånd. Velg posisjon og område selv.</InlineAlert>}
      {state === "tom" && <InlineAlert tone="info" title="Første oppgave i planen">Planen har ingen oppgaver ennå. Velg posisjon og område, så fylles formelen ut.</InlineAlert>}
      {desk ? <div style={{ display: "flex", gap: 24, alignItems: "flex-start", minWidth: 0 }}><div style={{ flex: 1, minWidth: 0 }}>{preview}</div><div style={{ width: 340, flex: "none", position: "sticky", top: 16, height: "calc(100vh - 32px)", maxHeight: "calc(100vh - 32px)", display: "flex", flexDirection: "column" }}><Sheet open mode="docked" className="tp-dock" title={base ? "Rediger oppgave" : "Ny oppgave"} kicker="Oppgaveskjema" footer={foot}>{form}</Sheet><style>{".tp-dock{flex:1 1 auto;min-height:0;max-height:100%;display:flex;flex-direction:column}.tp-dock>.pa-sheet__body{flex:1 1 auto;min-height:0;overflow-y:auto}.tp-dock>.pa-sheet__head,.tp-dock>.pa-sheet__foot{flex:none}"}</style></div></div> : <>{preview}<Sheet open={sheet} mode="bottom" onClose={() => setSheet(false)} kicker="Oppgaveskjema" title={base ? "Rediger oppgave" : "Ny oppgave"} footer={foot}>{form}</Sheet></>}
    </A.Gate>
  </A.Page>;
}
window.AG_SCREENS["AG-TP-01"] = { id: "AG-TP-01", parent: "AG-10", name: "Oppgaveskjema", route: "/admin/spillere/[id]/plan/[planId]?oppgave=[taskId]", Component: AGTP01 };

function AGTP02({ state, go, arg }) {
  const { PageHeader, Button, ChoicePill, EmptyState } = window.AGQ.ns();
  const A = window.AGQ, TP = window.TP, D = window.TP_DATA, { mob } = A.useW();
  const list = D.tasks.filter((t) => t.img), [sel, setSel] = React.useState(list.find((t) => t.id === arg) ? arg : list[0].id), t = list.find((x) => x.id === sel);
  const upl = () => A.toast("Velg bilde fra video eller kamerarull", t.pos + " · DATO SETTES FRA BILDET");
  return <A.Page max={1100}>
    <PageHeader kicker="Teknisk plan · Tobias Lindvik · Før og nå" title={"Før og nå · " + t.pos + " " + (D.POS.find((x) => x[0] === t.pos) || [])[1]} sub="To daterte bilder av samme posisjon. Ingen referansefigur og ingen vinkler som ikke er målt." actions={<Button variant="secondary" icon="arrow-left" onClick={() => go("AG-10")}>Teknisk plan</Button>} />
    <A.Gate state={state} loading="Henter bildene …" error={{ title: "Bildene kunne ikke hentes", text: "Ingen bilder er slettet. Prøv igjen.", code: "FEIL 504 · MEDIA" }}>
      {state === "tom" ? <EmptyState icon="image" title="Ingen bilder registrert" text="Last opp et bilde av posisjonen nå. Når det kommer et nytt, kan dere sammenligne før og nå." action="Last opp bilde" actionIcon="upload" onAction={upl} /> : <>
      <div role="group" aria-label="Oppgave" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{list.map((x) => <ChoicePill key={x.id} selected={x.id === sel} aria-pressed={x.id === sel} onClick={() => setSel(x.id)}>{x.pos + " · " + x.title}</ChoicePill>)}</div>
      <A.Card gap={12}><A.Head k={t.title} aside={"FØR " + (t.img.before ? t.img.before.date : "—") + " · NÅ " + (t.img.now ? t.img.now.date : "—")} />
        <TP.BeforeAfter key={t.id} img={t.img} pos={t.pos} mob={mob} onUpload={upl} />
      </A.Card>
      </>}
    </A.Gate>
  </A.Page>;
}
window.AG_SCREENS["AG-TP-02"] = { id: "AG-TP-02", parent: "AG-10", name: "Før og nå", route: "/admin/spillere/[id]/plan/[planId]/for-og-na", Component: AGTP02 };
})();
