(() => {
/* AG-10 · Teknisk plan (utvidet 27.09.2026). Posisjoner P1.0–P10.0, oppgaver med rep-mål per læringssteg og miljø, TrackMan-mål på skala, treffprotokoll, kvalitetssjekk, siste registreringer. Ingen regel sperrer noe. */
const PT = { "Godkjent": "ok", "Jobber med": "info", "Ikke startet": "neutral" };
function AG10({ state, go }) {
  const { PageHeader, Button, StatusPill, EmptyState, TextInput } = window.AGQ.ns();
  const A = window.AGQ, TP = window.TP, D = window.TP_DATA, { mob, cw } = A.useW(), empty = state === "tom", wide = cw >= 900;
  const [tasks, setTasks] = React.useState(D.tasks), [sel, setSel] = React.useState(null), [open, setOpen] = React.useState({ t1: true }), [ps, setPs] = React.useState(D.posStatus), [qc, setQc] = React.useState(null), [log, setLog] = React.useState(D.log), [reply, setReply] = React.useState({});
  const K = empty ? [] : tasks, shown = sel ? K.filter((t) => t.pos === sel) : K;
  const tot = K.reduce((a, t) => { const s = D.sum(t); return [a[0] + s[0], a[1] + s[1]]; }, [0, 0]);
  const cycle = (p) => { const o = ["Ikke startet", "Jobber med", "Godkjent"]; setPs((m) => ({ ...m, [p]: o[(o.indexOf(m[p]) + 1) % 3] })); A.toast(p + " endret", "SPILLEREN SER ENDRINGEN I TEKNISK PLAN"); };
  const status = sel && !empty ? <button type="button" onClick={() => cycle(sel)} aria-label={"Endre status for " + sel} style={{ all: "unset", cursor: "pointer", minHeight: 44, display: "flex", alignItems: "center" }}><StatusPill tone={PT[ps[sel]]}>{ps[sel]}</StatusPill></button> : null;
  const saveQc = (r) => { setTasks((l) => l.map((t) => t.id === qc.id ? { ...t, qc: { ...r, date: "27.09.2026", src: t.tm ? "TrackMan" : "Manuelt" } } : t)); A.toast("Kvalitetssjekken er lagret", r.hits + " AV " + r.of + " · 27.09.2026 · LÅSER IKKE NESTE STEG"); setQc(null); };
  const posName = (p) => (D.POS.find((x) => x[0] === p) || [])[1];
  const taskName = (id) => (tasks.find((t) => t.id === id) || {}).title;
  return <A.Page>
    <PageHeader kicker="Teknisk plan · Tobias Lindvik" title={D.plan.name} sub="Oppgaver per posisjon med ett teknisk fokus, repetisjoner per læringssteg og miljø, TrackMan-mål og treffprotokoll. Status vises. Ingenting låses." actions={<><Button variant="secondary" icon="arrow-left" onClick={() => go("AG-08")}>Spiller 360</Button><Button variant="secondary" icon="columns-2" onClick={() => go("AG-TP-02")}>Før og nå</Button><Button icon="plus" onClick={() => go("AG-TP-01", "ny")}>Ny oppgave</Button></>} />
    <A.Gate state={state} loading="Henter teknisk plan …" error={{ title: "Teknisk plan kunne ikke hentes", text: "Ingen oppgaver er endret. Prøv igjen.", code: "FEIL 502 · PLAN TEKNISK" }}>
      {empty ? <EmptyState icon="list-checks" title="Ingen teknisk plan ennå" text="Start med posisjonen dere jobber mest med. Legg til én oppgave med ett teknisk fokus. Spilleren ser planen når du publiserer." action="Ny oppgave" actionIcon="plus" onAction={() => go("AG-TP-01", "ny")} /> : <>
      <TP.Summary plan={D.plan} done={tot[0]} goal={tot[1]} mob={mob} />
      <A.Card gap={12}><A.Head k="Posisjoner P1.0–P10.0" aside={K.length + " OPPGAVER · " + D.plan.coach.toUpperCase() + " · " + D.plan.pub} />
        <TP.PosLine tasks={K} sel={sel} onSel={setSel} focus={D.plan.focus} mob={mob} status={status} />
      </A.Card>
      <A.Stack gap={12}>
        <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}><span className="kicker" style={{ flex: "1 1 auto" }}>Oppgaver · {sel ? sel + " " + posName(sel) : "alle posisjoner"}</span><A.Meta>{shown.length} {shown.length === 1 ? "OPPGAVE" : "OPPGAVER"}</A.Meta></div>
        {shown.length === 0 ? <A.Card><p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Ingen oppgaver på {sel}.</p><div><Button size="sm" variant="secondary" icon="plus" onClick={() => go("AG-TP-01", "ny")}>Legg til oppgave på {sel}</Button></div></A.Card> : shown.map((t) => <TP.TaskCard key={t.id} t={t} mob={mob} wide={wide} open={!!open[t.id]} onToggle={() => setOpen((o) => ({ ...o, [t.id]: !o[t.id] }))} onQC={() => setQc(t)}
          actions={<><Button size="sm" variant="secondary" icon="calendar-plus" onClick={() => A.toast("Øvelsen er lagt i Workbench som utkast", "KOBLET TIL OPPGAVEN · " + t.pos + " · IKKE PUBLISERT")}>Legg i økt</Button><Button size="sm" variant="ghost" icon="pencil" onClick={() => go("AG-TP-01", t.id)}>Rediger</Button>{t.img && <Button size="sm" variant="ghost" icon="columns-2" onClick={() => go("AG-TP-02", t.id)}>Før og nå</Button>}</>} />)}
      </A.Stack>
      <A.Card gap={0}><A.Head k="Siste registreringer" aside="LIVE-ØKT · TRACKMAN · MANUELT" />
        {log.map((l, i) => <div key={l.id} style={{ display: "flex", flexDirection: "column", gap: 6, padding: "12px 0", borderTop: i || true ? "1px solid var(--border-hairline)" : "none", marginTop: i ? 0 : 10 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "baseline" }}><span style={{ font: "600 13px/1.3 var(--font-mono)" }}>{l.date}</span><span style={{ font: "500 14px/1.3 var(--font-sans)", flex: "1 1 200px", minWidth: 0 }}>{taskName(l.task)}</span><span style={{ font: "600 13px/1.3 var(--font-mono)" }}>{l.reps} rep.</span></div>
          <A.Meta>{(l.step ? D.stepName(l.step) : "Uten læringssteg").toUpperCase()} · {l.env.toUpperCase()} · {l.src.toUpperCase()}</A.Meta>
          {l.cmt ? <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-body)", textWrap: "pretty" }}><b style={{ fontWeight: 600 }}>Tobias Lindvik:</b> {l.cmt}</p> : <A.Meta>INGEN KOMMENTAR FRA SPILLEREN</A.Meta>}
          {l.reply ? <p style={{ margin: 0, paddingLeft: 12, boxShadow: "inset 2px 0 0 var(--border-strong)", font: "var(--type-body-s)", color: "var(--text-body)", textWrap: "pretty" }}><b style={{ fontWeight: 600 }}>Anders Kristiansen · {l.replyDate}:</b> {l.reply}</p> : l.cmt && (reply[l.id] != null ? <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}><div style={{ flex: "1 1 220px", minWidth: 0 }}><TextInput aria-label="Svar til Tobias Lindvik" value={reply[l.id]} onChange={(e) => setReply((r) => ({ ...r, [l.id]: e.target.value }))} placeholder="Skriv kort" /></div><Button size="sm" variant="secondary" icon="send" disabled={!reply[l.id].trim()} onClick={() => { setLog((x) => x.map((y) => y.id === l.id ? { ...y, reply: reply[l.id], replyDate: "27.09.2026" } : y)); A.toast("Svaret er sendt", "TIL TOBIAS LINDVIK"); }}>Send svar</Button></div> : <div><Button size="sm" variant="ghost" icon="message-square" onClick={() => setReply((r) => ({ ...r, [l.id]: "" }))}>Svar</Button></div>)}
        </div>)}
      </A.Card>
      </>}
    </A.Gate>
    <TP.QCSheet open={!!qc} task={qc} onClose={() => setQc(null)} onSave={saveQc} toast={A.toast} />
  </A.Page>;
}
window.AG_SCREENS["AG-10"] = { id: "AG-10", parent: "AG-08", name: "Teknisk plan", route: "/admin/spillere/[id]/plan/[planId]", Component: AG10 };
})();
