(() => {
const TABS = [{ value: "saker", label: "Saker" }, { value: "utkast", label: "E-postutkast" }, { value: "maler", label: "Maler" }];
const ta = { width: "100%", boxSizing: "border-box", minHeight: 140, padding: 12, borderRadius: 8, border: "1px solid var(--border-control)", background: "var(--surface-card)", color: "var(--text-primary)", font: "var(--type-body)", resize: "vertical" };
const fill = (s, v) => s.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, k) => v[k] != null ? v[k] : "—");
function AG04({ state, go }) {
  const { PageHeader, Button, StatusPill, EmptyState, Tabs, Avatar, TextInput, FormField, Dialog, Icon } = window.AGQ.ns();
  const A = window.AGQ, D = window.AG_DATA, { mob, pad, desk } = A.useW(), empty = state === "tom";
  const [tab, setTab] = React.useState("saker"), [sid, setSid] = React.useState(desk ? "s1" : null), [threads, setThreads] = React.useState(D.threads);
  const [reply, setReply] = React.useState({}), [drafts, setDrafts] = React.useState(D.drafts), [did, setDid] = React.useState(desk ? "e1" : null);
  const [tpls, setTpls] = React.useState(D.templates), [tid, setTid] = React.useState(null), [edit, setEdit] = React.useState(null), [del, setDel] = React.useState(false);
  const th = empty ? [] : threads, dr = empty ? [] : drafts, tp = empty ? [] : tpls;
  const t = th.find((x) => x.id === sid), d = dr.find((x) => x.id === did);
  const back = (fn) => !desk && <div><Button size="sm" variant="ghost" icon="arrow-left" onClick={() => fn(null)}>Tilbake</Button></div>;
  const send = (x) => { const txt = reply[x.id] ?? x.draft; if (!txt) return; setThreads((l) => l.map((y) => y.id === x.id ? { ...y, msgs: [...y.msgs, ["Anders Kristiansen", new Date().toTimeString().slice(0, 5), txt]], draft: null, unread: false } : y)); setReply((r) => ({ ...r, [x.id]: "" })); A.toast("Sendt", ("TIL " + x.who).toUpperCase()); };
  const listRow = (on, onClick, lead, title, sub, meta, i, pill) => <button key={i} type="button" aria-pressed={on} onClick={onClick} style={{ all: "unset", boxSizing: "border-box", width: "100%", cursor: "pointer", display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 16px", minHeight: 64, borderTop: i ? "1px solid var(--border-hairline)" : "none", background: on ? "var(--surface-flat)" : "transparent", boxShadow: on ? "inset 2px 0 0 var(--border-ink)" : "none" }}>
    {lead}<span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}><span style={{ display: "flex", gap: 8, alignItems: "baseline" }}><span style={{ font: "600 14px/1.3 var(--font-sans)", color: "var(--text-primary)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</span><A.Meta>{meta}</A.Meta></span><span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</span>{pill}</span>
  </button>;
  let left, right;
  if (tab === "saker") {
    left = <div className="pa-card" style={{ padding: 0, overflow: "hidden" }}>{th.map((x, i) => listRow(sid === x.id, () => setSid(x.id), <Avatar name={x.who} size={32} />, x.who, x.sub, x.at, i, <span style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 2 }}><A.Meta>{x.role.toUpperCase()}</A.Meta>{x.unread && <StatusPill tone="info">Ubesvart</StatusPill>}{x.draft && <A.Draft>Svarutkast</A.Draft>}</span>))}</div>;
    right = t && <A.Card pad={mob ? 16 : 20} gap={14}>{back(setSid)}
      <div><span className="kicker">{t.role}</span><div style={{ font: "var(--type-title-s)", color: "var(--text-primary)", marginTop: 4 }}>{t.who} · {t.sub}</div></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{t.msgs.map(([who, at, txt], i) => { const me = who === "Anders Kristiansen"; return <div key={i} style={{ alignSelf: me ? "flex-end" : "flex-start", maxWidth: "min(88%, 520px)", padding: "10px 12px", borderRadius: 8, background: me ? "var(--surface-sunken)" : "var(--surface-card)", border: "1px solid var(--border-hairline)", display: "flex", flexDirection: "column", gap: 4 }}><A.Meta>{who.toUpperCase()} · {at}</A.Meta><span style={{ font: "var(--type-body)", color: "var(--text-primary)", textWrap: "pretty" }}>{txt}</span></div>; })}</div>
      <FormField label={t.draft && reply[t.id] == null ? "Svar · utkast fra Jarvis" : "Svar"} hint={t.draft && reply[t.id] == null ? "Les og endre. Ingenting sendes før du trykker Send." : undefined}><textarea style={ta} value={reply[t.id] ?? t.draft ?? ""} onChange={(e) => setReply((r) => ({ ...r, [t.id]: e.target.value }))} placeholder="Skriv et svar" /></FormField>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}><Button icon="send" disabled={!(reply[t.id] ?? t.draft)} onClick={() => send(t)}>Send</Button><Button variant="ghost" icon="sparkles" onClick={() => A.toast("Jarvis skriver et nytt utkast", "DU GODKJENNER FØR SENDING")}>Nytt utkast</Button></div>
    </A.Card>;
  }
  if (tab === "utkast") {
    left = <div className="pa-card" style={{ padding: 0, overflow: "hidden" }}>{dr.map((x, i) => listRow(did === x.id, () => setDid(x.id), <Icon name="mail" size={18} />, x.subject, "Til " + x.to + " · " + x.toRole, x.at, i, <span style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 2 }}><A.Draft /><A.Meta>FRA {x.from.toUpperCase()}</A.Meta></span>))}</div>;
    right = d && <A.Card pad={mob ? 16 : 20} gap={14}>{back(setDid)}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><A.Draft /><A.Meta>MAL · {d.tpl.toUpperCase()} · LAGET AV {d.from.toUpperCase()} {d.at}</A.Meta></div>
      <FormField label="Til"><TextInput value={d.to + " · " + d.toRole} readOnly /></FormField>
      <FormField label="Emne"><TextInput value={d.subject} onChange={(e) => setDrafts((l) => l.map((y) => y.id === d.id ? { ...y, subject: e.target.value } : y))} /></FormField>
      <FormField label="Tekst"><textarea style={{ ...ta, minHeight: 180 }} value={d.body} onChange={(e) => setDrafts((l) => l.map((y) => y.id === d.id ? { ...y, body: e.target.value } : y))} /></FormField>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Button icon="send" onClick={() => { setDrafts((l) => l.filter((y) => y.id !== d.id)); setDid(null); A.toast("E-posten er sendt", ("TIL " + d.to).toUpperCase()); }}>Send</Button><Button variant="ghost" onClick={() => { setDrafts((l) => l.filter((y) => y.id !== d.id)); setDid(null); A.toast("Utkastet er forkastet", "INGENTING SENDT"); }}>Forkast</Button></div>
    </A.Card>;
  }
  if (tab === "maler") {
    const e = edit;
    left = <div className="pa-card" style={{ padding: 0, overflow: "hidden" }}>{tp.map((x, i) => listRow(e && e.id === x.id, () => setEdit({ ...x }), <Icon name="file-text" size={18} />, x.name, x.subject, "BRUKT " + x.used, i, <A.Meta>ENDRET {x.edited}</A.Meta>))}</div>;
    right = e ? <A.Card pad={mob ? 16 : 20} gap={14}>{!desk && <div><Button size="sm" variant="ghost" icon="arrow-left" onClick={() => setEdit(null)}>Tilbake</Button></div>}
      <div><span className="kicker">Rediger e-postmal</span><div style={{ font: "var(--type-title-s)", color: "var(--text-primary)", marginTop: 4 }}>{e.name}</div></div>
      <FormField label="Navn på mal"><TextInput value={e.name} onChange={(v) => setEdit({ ...e, name: v.target.value })} /></FormField>
      <FormField label="Emne"><TextInput mono value={e.subject} onChange={(v) => setEdit({ ...e, subject: v.target.value })} /></FormField>
      <FormField label="Tekst" hint="Felter i doble krøllparenteser fylles ut når utkastet lages."><textarea style={{ ...ta, minHeight: 160, font: "var(--type-num-s)", lineHeight: 1.5 }} value={e.body} onChange={(v) => setEdit({ ...e, body: v.target.value })} /></FormField>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{["spiller.fornavn", "forelder.fornavn", "uke", "dato", "tid", "tjeneste"].map((k) => <button key={k} type="button" className="pa-chip" onClick={() => setEdit({ ...e, body: e.body + " {{" + k + "}}" })} style={{ minHeight: 36, padding: "0 10px", borderRadius: 999, border: "1px solid var(--border-strong)", background: "var(--surface-card)", color: "var(--text-primary)", font: "500 12px/1 var(--font-mono)", cursor: "pointer" }}>{"{{" + k + "}}"}</button>)}</div>
      <div style={{ padding: 14, borderRadius: 8, background: "var(--surface-flat)", border: "1px solid var(--border-hairline)", display: "flex", flexDirection: "column", gap: 6 }}><A.Meta>FORHÅNDSVISNING · DEMODATA TOBIAS LINDVIK</A.Meta><span style={{ font: "600 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{fill(e.subject, D.vars)}</span><span style={{ font: "var(--type-body-s)", color: "var(--text-body)", whiteSpace: "pre-wrap" }}>{fill(e.body, D.vars)}</span></div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}><Button icon="check" onClick={() => { setTpls((l) => l.map((y) => y.id === e.id ? { ...e, edited: D.today } : y)); A.toast("Malen er lagret", e.name.toUpperCase()); }}>Lagre mal</Button><Button variant="ghost" onClick={() => setEdit(null)}>Avbryt</Button><span style={{ flex: 1 }}></span><Button variant="ghost" icon="trash-2" onClick={() => setDel(true)}>Slett mal</Button></div>
      <A.Meta>/ADMIN/EMAIL-TEMPLATES/{e.id.toUpperCase()}/REDIGER</A.Meta>
    </A.Card> : desk && <A.Card><EmptyState icon="file-text" title="Velg en mal" text="Maler brukes av Jarvis og deg når utkast lages. Utkast sendes aldri automatisk." /></A.Card>;
  }
  const detailOpen = tab === "saker" ? !!t : tab === "utkast" ? !!d : !!edit;
  const hasItems = tab === "saker" ? th.length : tab === "utkast" ? dr.length : tp.length;
  return <A.Page>
    <PageHeader kicker={"Innboks · " + D.dayLabel} title="Innboks" sub="Saker fra spillere og foreldre, e-postutkast og maler. Utkast sendes aldri uten at du trykker Send." actions={<Button variant="secondary" icon="pen-line" onClick={() => A.toast("Ny melding", "VELG MOTTAKER")}>Ny melding</Button>} />
    <A.Gate state={state} loading="Henter meldinger …" error={{ title: "Innboksen kunne ikke hentes", text: "Ingen meldinger er sendt eller slettet. Prøv igjen.", code: "FEIL 504 · KOMMUNIKASJON" }}>
      <Tabs tabs={TABS.map((x) => ({ ...x, count: empty ? undefined : x.value === "saker" ? th.filter((y) => y.unread).length : x.value === "utkast" ? dr.length : tp.length }))} value={tab} onChange={(v) => { setTab(v); setEdit(null); if (!desk) { setSid(null); setDid(null); } }} />
      {!hasItems ? <EmptyState icon="inbox" title={tab === "saker" ? "Ingen saker" : tab === "utkast" ? "Ingen utkast" : "Ingen maler"} text={tab === "maler" ? "Lag første mal, for eksempel bookingbekreftelse." : "Nye meldinger fra spillere og foreldre dukker opp her."} action={tab === "maler" ? "Ny mal" : "Ny melding"} actionIcon="plus" onAction={() => A.toast("Ny", "UTKAST")} />
        : desk ? <A.Cols tpl="minmax(0,.9fr) minmax(0,1.3fr)">{left}{right}</A.Cols> : detailOpen ? right : left}
    </A.Gate>
    <Dialog open={del} onClose={() => setDel(false)} title="Slette malen?" footer={<><Button variant="ghost" onClick={() => setDel(false)}>Avbryt</Button><Button variant="signal" onClick={() => { setTpls((l) => l.filter((y) => y.id !== edit.id)); setEdit(null); setDel(false); A.toast("Malen er slettet", "UTKAST SOM BRUKTE DEN BEHOLDES"); }}>Slett</Button></>}><p style={{ margin: 0, font: "var(--type-body)" }}>Malen fjernes for hele AgencyOS. Utkast som allerede er laget beholdes.</p></Dialog>
  </A.Page>;
}
window.AG_SCREENS["AG-04"] = { id: "AG-04", name: "Innboks", route: "/admin/kommunikasjon", Component: AG04 };
})();
