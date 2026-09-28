/* AG-05 Kalender — runde 28 (Anders 28.09.2026). Alle bookinger i AK Golf: dag · uke · måned · år. Alle coacher synlige, filter på coach.
   Dag: kolonne per coach. Økta viser initialer, tjeneste og påmeldte mot plasser. Farge = akse, aldri coach.
   Gruppeøkter: faste og åpne for booking. Forslag til ny gruppeøkt (B1) som skisse. Flytt økt → «Varsler X spillere · Angre» i 10 s.
   Head coach ser alt; assistant coach ser egne økter og gruppeøkter. Google koblet begge veier; spillernes private hendelser = «Opptatt». Treningssamling (B7) egen blokk. */
(() => {
const K = () => window.KAL;
const VIEWS = [["dag", "Dag"], ["uke", "Uke"], ["mnd", "Måned"], ["ar", "År"]];
const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const H0 = 7, H1 = 21, HH = 64;
const coachOf = (id) => K().coaches.find((c) => c.id === id);
const Muted = ({ children }) => <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>{children}</p>;
function Block({ e, onOpen, abs }) {
  const A = window.AGQ, c = coachOf(e.c), g = e.kind === "google", full = e.cap && e.n >= e.cap;
  const pos = abs ? { position: "absolute", left: 2, right: 2, top: (toMin(e.t) - H0 * 60) / 60 * HH + 1, height: Math.max(48, (toMin(e.end) - toMin(e.t)) / 60 * HH - 2) } : { minHeight: 56 };
  return <button type="button" onClick={() => onOpen(e)} aria-label={[c.ini, e.t + "–" + e.end, e.svc, e.cap ? e.n + " av " + e.cap + " påmeldt" : null].filter(Boolean).join(", ")} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", ...pos, display: "flex", flexDirection: "column", gap: 2, padding: "4px 6px 4px 8px", borderRadius: 6, overflow: "hidden", minWidth: 0, background: g ? "repeating-linear-gradient(135deg,var(--surface-sunken) 0 6px,var(--surface-flat) 6px 12px)" : "var(--surface-card)", border: "1px solid var(--border-hairline)", boxShadow: g ? "none" : "inset 3px 0 0 var(--axis-" + e.axis + ")" }}>
    <span style={{ font: "600 12px/1.2 var(--font-mono)", color: "var(--text-primary)" }}>{c.ini} · {e.t}</span>
    <span style={{ font: "500 12px/1.25 var(--font-sans)", color: g ? "var(--text-secondary)" : "var(--text-primary)", overflowWrap: "anywhere" }}>{g ? "Google · " + e.svc : e.svc}</span>
    {e.cap != null && <span style={{ font: "600 12px/1.2 var(--font-mono)", color: "var(--text-primary)" }}>{e.n}/{e.cap}{e.kind === "gruppe" ? (e.fast ? " · fast" : " · åpen") : ""}{full && e.wait ? " · +" + e.wait : ""}</span>}
  </button>;
}
function Sketch({ f, onOpen, abs }) {
  const pos = abs ? { position: "absolute", left: 2, right: 2, top: (toMin(f.t) - H0 * 60) / 60 * HH + 1, height: (toMin(f.end) - toMin(f.t)) / 60 * HH - 2 } : { minHeight: 56 };
  return <button type="button" onClick={() => onOpen(f)} aria-label={"Forslag: " + f.svc + ", " + f.t + "–" + f.end + ", " + f.cap + " plasser, " + f.sum + " estimat"} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", ...pos, display: "flex", flexDirection: "column", gap: 2, padding: "4px 6px", borderRadius: 6, overflow: "hidden", minWidth: 0, border: "1.5px dashed var(--border-strong)", background: "transparent" }}>
    <span style={{ font: "600 12px/1.2 var(--font-mono)", color: "var(--text-secondary)" }}>FORSLAG · {f.t}</span>
    <span style={{ font: "500 12px/1.25 var(--font-sans)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{f.svc} · {f.cap} plasser</span>
    <span style={{ font: "600 12px/1.2 var(--font-mono)", color: "var(--text-secondary)" }}>{f.sum} ESTIMAT</span>
  </button>;
}
function DayView({ day, ev, coaches, onOpen, f, onF }) {
  const A = window.AGQ, hours = Array.from({ length: H1 - H0 + 1 }, (_, i) => H0 + i), now = day === K().today ? (toMin(K().now) - H0 * 60) / 60 * HH : null;
  const tpl = "36px repeat(" + coaches.length + ",minmax(0,1fr))";
  return <div style={{ minWidth: 0 }}>
    <div style={{ display: "grid", gridTemplateColumns: tpl, gap: 4, paddingBottom: 6, borderBottom: "1px solid var(--border-hairline)" }}><span></span>{coaches.map((c) => <span key={c.id} style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}><span style={{ font: "600 13px/1.2 var(--font-mono)", color: "var(--text-primary)" }}>{c.ini}</span><A.Meta s={{ overflowWrap: "anywhere" }}>{c.name.split(" ")[0].toUpperCase()}</A.Meta></span>)}</div>
    <div style={{ display: "grid", gridTemplateColumns: tpl, gap: 4, position: "relative" }}>
      <div aria-hidden="true" style={{ position: "relative", height: (H1 - H0) * HH }}>{hours.map((h) => <span key={h} style={{ position: "absolute", top: (h - H0) * HH - 6, left: 0, font: "500 11px/1 var(--font-mono)", color: "var(--text-muted)" }}>{String(h).padStart(2, "0")}</span>)}</div>
      {coaches.map((c) => <div key={c.id} role="list" aria-label={"Økter " + c.name} style={{ position: "relative", height: (H1 - H0) * HH, minWidth: 0, background: "repeating-linear-gradient(to bottom,transparent 0 " + (HH - 1) + "px,var(--border-hairline) " + (HH - 1) + "px " + HH + "px)" }}>
        {ev.filter((e) => e.day === day && e.c === c.id && e.kind !== "turn").map((e) => <div role="listitem" key={e.id}><Block e={e} onOpen={onOpen} abs /></div>)}
        {f && f.day === day && f.c === c.id && <div role="listitem"><Sketch f={f} onOpen={onF} abs /></div>}
      </div>)}
      {now != null && <span aria-hidden="true" style={{ position: "absolute", left: 36, right: 0, top: now, height: 2, background: "var(--text-primary)" }}></span>}
    </div>
  </div>;
}
function WeekView({ ev, onOpen, f, onF, wide, week }) {
  const A = window.AGQ, S = K().samling;
  if (week === 41) return <div style={{ display: "flex", flexDirection: "column", gap: 8 }}><SamlingBlock /><Muted>Ingen andre bookinger lagt inn for uke 41 ennå.</Muted></div>;
  const days = K().days.map((d, i) => ({ d, i, items: [...ev.filter((e) => e.day === i), ...(f && f.day === i ? [{ ...f, sketch: true }] : [])].sort((a, b) => toMin(a.t) - toMin(b.t)) }));
  const col = (x) => <section key={x.i} aria-label={x.d} style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0, paddingTop: wide ? 0 : 12, borderTop: wide || !x.i ? "none" : "1px solid var(--border-hairline)" }}>
    <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}><span style={{ font: (x.i === K().today ? "700" : "600") + " 13px/1.2 var(--font-sans)", color: "var(--text-primary)" }}>{x.d}</span>{x.i === K().today && <A.Meta>I DAG</A.Meta>}<span style={{ flex: 1 }}></span><A.Meta>{x.items.length || "—"}</A.Meta></div>
    {x.items.length ? x.items.map((e) => e.sketch ? <Sketch key={e.id} f={e} onOpen={onF} /> : <Block key={e.id} e={e} onOpen={onOpen} />) : <A.Meta>INGEN ØKTER</A.Meta>}
  </section>;
  return <div style={wide ? { display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 8, alignItems: "start" } : { display: "flex", flexDirection: "column", gap: 4 }}>{days.map(col)}</div>;
}
function SamlingBlock({ compact }) {
  const A = window.AGQ, S = K().samling;
  return <div role="group" aria-label={"Treningssamling " + S.from + "–" + S.to} style={{ display: "flex", flexDirection: "column", gap: 4, padding: 12, borderRadius: 8, background: "var(--surface-sunken)", border: "1px solid var(--border-strong)", minWidth: 0 }}>
    <A.Meta>TRENINGSSAMLING · {S.from}–{S.to}.2026 · {S.days} DAGER</A.Meta>
    <span style={{ font: "600 15px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{S.name}</span>
    {!compact && <A.Meta>{S.who.toUpperCase()} · {S.where.toUpperCase()}</A.Meta>}
  </div>;
}
function MonthView({ empty }) {
  const A = window.AGQ, M = K().month, cells = [...Array(M.first).fill(null), ...Array.from({ length: M.days }, (_, i) => i + 1)];
  return <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}><span style={{ font: "600 15px/1.2 var(--font-sans)", color: "var(--text-primary)", flex: 1 }}>{M.name}</span><A.Meta>BOOKINGER PER DAG</A.Meta></div>
    <div role="grid" aria-label={M.name} style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: 4 }}>
      {["M", "T", "O", "T", "F", "L", "S"].map((d, i) => <A.Meta key={i} s={{ textAlign: "center" }}>{d}</A.Meta>)}
      {cells.map((d, i) => { const s = d && d >= M.samling[0] && d <= M.samling[1], n = empty ? 0 : M.counts[d] || 0; return <div key={i} role={d ? "gridcell" : undefined} aria-label={d ? d + ". oktober: " + (n ? n + " bookinger" : "ingen") + (s ? ", treningssamling" : "") : undefined} style={{ minHeight: 52, borderRadius: 6, border: d ? "1px solid var(--border-hairline)" : "none", background: s ? "var(--surface-sunken)" : d ? "var(--surface-card)" : "transparent", padding: 4, display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>{d && <><span style={{ font: "500 11px/1 var(--font-mono)", color: "var(--text-muted)" }}>{d}</span><span style={{ font: "600 14px/1 var(--font-mono)", color: "var(--text-primary)" }}>{s ? "SAML" : n || "—"}</span></>}</div>; })}
    </div>
    <SamlingBlock compact />
  </div>;
}
function YearView({ empty }) {
  const A = window.AGQ, Y = K().year, max = 180;
  return <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <div role="list" aria-label="2026">{Y.map(([m, n], i) => { const s = K().yearSamling.find((x) => x[0] === m); return <div role="listitem" key={m} style={{ display: "grid", gridTemplateColumns: "40px minmax(0,1fr) 56px", gap: 12, alignItems: "center", minHeight: 44, borderTop: i ? "1px solid var(--border-hairline)" : "none" }}>
      <span style={{ font: "600 13px/1 var(--font-mono)", color: "var(--text-primary)" }}>{m}</span>
      <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}><span aria-hidden="true" style={{ height: 8, background: "var(--surface-sunken)", position: "relative" }}><span style={{ position: "absolute", inset: 0, width: (empty || n == null ? 0 : n / max * 100) + "%", background: "var(--primary)" }}></span></span>{s && <A.Meta>{s[1].toUpperCase()}</A.Meta>}</span>
      <span style={{ font: "600 13px/1 var(--font-mono)", color: "var(--text-primary)", textAlign: "right" }}>{empty || n == null ? "—" : n}</span>
    </div>; })}</div>
    <A.Meta>BOOKINGER PER MÅNED · ALLE COACHER · NOV OG DES ER IKKE PUBLISERT</A.Meta>
  </div>;
}
function AG05({ state, go, nav, view0, asst }) {
  const { PageHeader, Button, ChoicePill, Segmented, Sheet, StatusPill, EmptyState, IconButton, KeyValue, InlineAlert } = window.AGQ.ns(), A = window.AGQ, { cw } = A.useW(), empty = state === "tom";
  const me = asst ? coachOf("em") : coachOf("ak");
  const [view, setView] = React.useState(view0 || "dag"), [day, setDay] = React.useState(K().today), [week, setWeek] = React.useState(40), [sel, setSel] = React.useState(["alle"]);
  const [ev, setEv] = React.useState(empty ? [] : K().ev), [open, setOpen] = React.useState(null), [fo, setFo] = React.useState(null), [mv, setMv] = React.useState(false), [f, setF] = React.useState(empty ? null : K().forslag);
  const vis = ev.filter((e) => !asst || e.c === me.id || e.kind === "gruppe" || e.kind === "turn").filter((e) => sel.includes("alle") || sel.includes(e.c));
  const coaches = K().coaches.filter((c) => sel.includes("alle") || sel.includes(c.id));
  const tog = (id) => { if (id === "alle") return setSel(["alle"]); const s = sel.filter((x) => x !== "alle"); const n = s.includes(id) ? s.filter((x) => x !== id) : [...s, id]; setSel(n.length ? n : ["alle"]); };
  const doMove = ([d, t]) => { const e = open, di = K().days.indexOf(d), dur = toMin(e.end) - toMin(e.t), end = String(Math.floor((toMin(t) + dur) / 60)).padStart(2, "0") + ":" + String((toMin(t) + dur) % 60).padStart(2, "0"), prev = { day: e.day, t: e.t, end: e.end };
    setEv((l) => l.map((x) => x.id === e.id ? { ...x, day: di, t, end } : x)); setMv(false); setOpen(null);
    const n = e.n || 0; nav && nav.undo ? nav.undo("Flyttet til " + d + " " + t + " · varsler " + n + (n === 1 ? " spiller" : " spillere"), "PUSH I PLAYERHQ · ELLERS E-POST EP-02 · ANGRE I 10 SEKUNDER", () => setEv((l) => l.map((x) => x.id === e.id ? { ...x, ...prev } : x))) : A.toast("Varsler " + n + " spillere", "ANGRE I 10 SEKUNDER"); };
  const G = K().google;
  const gRow = <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", minWidth: 0 }}>{empty ? <><Button variant="secondary" size="sm" icon="calendar-plus" onClick={() => A.toast("Google-kalender", "LOGG INN MED GOOGLE · BEGGE VEIER")}>Koble Google-kalender</Button><A.Meta>BOOKINGER LEGGES UT I GOOGLE · SPILLERNES PRIVATE HENDELSER VISES SOM «OPPTATT»</A.Meta></> : <A.Meta>GOOGLE-KALENDER KOBLET BEGGE VEIER · {(asst ? "eirik@akgolf.no" : G.acct).toUpperCase()} · SYNKET {G.synced} · SPILLERNES PRIVATE HENDELSER VISES SOM «OPPTATT»</A.Meta>}</div>;
  const nav2 = view === "dag" ? <div style={{ display: "flex", gap: 8, alignItems: "center" }}><IconButton icon="chevron-left" label="Forrige dag" variant="ghost" disabled={day === 0} onClick={() => setDay(day - 1)} /><span style={{ font: "600 15px/1.2 var(--font-sans)", color: "var(--text-primary)", flex: 1, textAlign: "center" }}>{K().days[day]}{day === K().today ? " · i dag" : ""}</span><IconButton icon="chevron-right" label="Neste dag" variant="ghost" disabled={day === 6} onClick={() => setDay(day + 1)} /></div>
    : view === "uke" ? <div style={{ display: "flex", gap: 8, alignItems: "center" }}><IconButton icon="chevron-left" label="Forrige uke" variant="ghost" disabled={week === 40} onClick={() => setWeek(40)} /><span style={{ font: "600 15px/1.2 var(--font-sans)", color: "var(--text-primary)", flex: 1, textAlign: "center" }}>Uke {week} · {week === 40 ? "28.09–04.10" : "05.10–11.10"}</span><IconButton icon="chevron-right" label="Neste uke" variant="ghost" disabled={week === 41} onClick={() => setWeek(41)} /></div> : null;
  const E = open, busy = E && K().busy[E.id];
  return <A.Page max={1440}>
    <PageHeader kicker={asst ? "Kalender · " + me.name + " · assistant coach" : "Kalender · alle bookinger i AK Golf"} title="Kalender" actions={<Button icon="plus" onClick={() => go("AG-06")}>Ny booking</Button>} />
    <A.Gate state={state} loading="Henter bookinger og Google-kalenderen …" error={{ title: "Kalenderen kunne ikke hentes", text: "Bookingene er uendret. Google-synken prøver igjen om 5 minutter.", code: "FEIL 503 · KALENDER · 08:20" }}>
      <Segmented options={VIEWS.map((v) => v[1])} value={VIEWS.find((v) => v[0] === view)[1]} onChange={(l) => setView(VIEWS.find((v) => v[1] === l)[0])} fullWidth={cw < 700} />
      {asst ? <InlineAlert tone="neutral" title="Du ser egne økter og alle gruppeøkter">Privattimer hos andre coacher er skjult. Head coach ser alt.</InlineAlert>
        : <div role="group" aria-label="Filter på coach" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><ChoicePill selected={sel.includes("alle")} onClick={() => tog("alle")}>Alle coacher</ChoicePill>{K().coaches.map((c) => <ChoicePill key={c.id} selected={sel.includes(c.id)} onClick={() => tog(c.id)}>{c.ini + " · " + c.name.split(" ")[0]}</ChoicePill>)}</div>}
      {gRow}
      {f && (view === "dag" || view === "uke") && <button type="button" onClick={() => setFo(f)} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", padding: "10px 12px", borderRadius: 8, border: "1.5px dashed var(--border-strong)", minWidth: 0 }}><span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: "1 1 260px" }}><span style={{ font: "600 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>Forslag: tirsdag {f.t}–{f.end.slice(0, 2)}, nærspill, {f.cap} plasser, {f.sum} ESTIMAT</span><A.Meta>BYGGER PÅ FULLE ØKTER, VENTELISTER, LEDIG TID OG ANLEGG · OGSÅ I INNBOKS</A.Meta></span><span className="pa-btn pa-btn--secondary pa-btn--sm" style={{ flex: "none" }}>Se forslag</span></button>}
      <section aria-label={"Kalender · " + VIEWS.find((v) => v[0] === view)[1]} className="pa-card" style={{ padding: 16, gap: 12, minWidth: 0 }}>
        {nav2}
        {empty && (view === "dag" || view === "uke") ? <EmptyState icon="calendar-days" title="Ingen bookinger denne uka" text="Legg inn en privattime eller en gruppeøkt. Bookingene legges ut i Google-kalenderen når den er koblet." action="Ny booking" actionIcon="plus" onAction={() => go("AG-06")} />
          : view === "dag" ? <DayView day={day} ev={vis} coaches={asst ? K().coaches : coaches} onOpen={setOpen} f={f} onF={setFo} />
          : view === "uke" ? <WeekView ev={vis} onOpen={setOpen} f={f} onF={setFo} wide={cw >= 1100} week={week} />
          : view === "mnd" ? <MonthView empty={empty} /> : <YearView empty={empty} />}
        <A.Meta>FARGE PÅ KANTEN = AKSE · INITIALER = COACH · TALL = PÅMELDT / PLASSER · +N = VENTELISTE · SKRAVERT = GOOGLE</A.Meta>
      </section>
    </A.Gate>
    {E && !mv && <Sheet open onClose={() => setOpen(null)} kicker={K().days[E.day] + " · " + E.t + "–" + E.end} title={E.kind === "google" ? "Google · " + E.svc : E.svc} footer={E.kind === "google" || E.kind === "turn" ? <Button variant="secondary" fullWidth onClick={() => setOpen(null)}>Lukk</Button> : <><Button fullWidth icon="move" onClick={() => setMv(true)}>Flytt økt</Button><Button variant="ghost" fullWidth onClick={() => setOpen(null)}>Lukk</Button></>}>
      <KeyValue columns={1} items={[["Coach", coachOf(E.c).name, { mono: false }], ["Sted", E.where, { mono: false }], ...(E.cap != null ? [["Påmeldt", E.n + " av " + E.cap, { hint: E.wait ? E.wait + " PÅ VENTELISTE" : undefined }]] : []), ...(E.kind === "gruppe" ? [["Type", E.fast ? "Fast gruppe" : "Åpen for booking", { mono: false }]] : [])]} />
      {busy && <section aria-label="Spillere som er opptatt" style={{ display: "flex", flexDirection: "column", gap: 4 }}><A.Meta>FRA SPILLERNES GOOGLE-KALENDER · BARE «OPPTATT», ALDRI TITTEL</A.Meta><div role="list">{busy.map(([n, t], i) => <div role="listitem" key={n} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 12, alignItems: "center", minHeight: 44, borderTop: i ? "1px solid var(--border-hairline)" : "none" }}><span style={{ font: "400 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{n}</span><StatusPill tone="neutral">{"Opptatt " + t}</StatusPill></div>)}</div></section>}
      {E.kind === "google" && <Muted>Hendelsen kommer fra Google-kalenderen din. Endre den i Google.</Muted>}
    </Sheet>}
    {E && mv && <Sheet open onClose={() => setMv(false)} kicker={"Flytt · " + E.svc} title="Velg nytt tidspunkt" footer={<Button variant="ghost" fullWidth onClick={() => setMv(false)}>Avbryt</Button>}>
      <div role="list">{K().moveTo.map((x, i) => <button key={i} type="button" role="listitem" onClick={() => doMove(x)} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", width: "100%", display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 12, alignItems: "center", minHeight: 52, borderTop: i ? "1px solid var(--border-hairline)" : "none" }}><span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{x[0]} · {x[1]}</span><A.Meta>LEDIG FOR COACH OG ANLEGG</A.Meta></button>)}</div>
      <A.Meta>{(E.n || 0) + " SPILLERE FÅR VARSEL: PUSH I PLAYERHQ, ELLERS E-POST (EP-02) · DU KAN ANGRE I 10 SEKUNDER"}</A.Meta>
    </Sheet>}
    {fo && <Sheet open onClose={() => setFo(null)} kicker="Forslag til ny gruppeøkt · fra motoren" title={"Tirsdag " + fo.t + "–" + fo.end + " · nærspill · " + fo.cap + " plasser"} footer={<><Button fullWidth icon="check" onClick={() => { setEv((l) => [...l, { id: "ny1", day: fo.day, c: fo.c, t: fo.t, end: fo.end, kind: "gruppe", fast: false, svc: fo.svc, axis: fo.axis, n: 0, cap: fo.cap, where: "Chippinggreen" }]); setF(null); setFo(null); A.toast("Godkjent og lagt ut til booking", "VENTELISTA FÅR BESKJED FØRST"); }}>Godkjenn og legg ut til booking</Button><Button variant="ghost" fullWidth onClick={() => { setF(null); setFo(null); A.toast("Forslaget er avvist", "FORSLÅS IKKE IGJEN DENNE UKA"); }}>Avvis</Button></>}>
      <div role="list">{fo.why.map(([k, v], i) => <div role="listitem" key={k} style={{ display: "flex", flexDirection: "column", gap: 2, padding: "8px 0", borderTop: i ? "1px solid var(--border-hairline)" : "none" }}><A.Meta>{k.toUpperCase()}</A.Meta><span style={{ font: "400 14px/1.4 var(--font-sans)", color: "var(--text-primary)", textWrap: "pretty" }}>{v}</span></div>)}</div>
      <A.Meta>COACH {coachOf(fo.c).name.toUpperCase()} · SAMME SAK LIGGER I INNBOKS FOR HEAD OG ASSISTANT COACH</A.Meta>
      <div><Button variant="ghost" size="sm" iconRight="arrow-right" onClick={() => go("AG-04")}>Åpne i Innboks</Button></div>
    </Sheet>}
  </A.Page>;
}
const S = window.AG_SCREENS;
S["AG-05"] = { id: "AG-05", name: "Kalender", route: "/admin/kalender", Component: AG05 };
S["AG-05-UKE"] = { id: "AG-05-UKE", parent: "AG-05", name: "Kalender · uke", route: "/admin/kalender?visning=uke", Component: (p) => <AG05 {...p} view0="uke" /> };
S["AG-05-MND"] = { id: "AG-05-MND", parent: "AG-05", name: "Kalender · måned", route: "/admin/kalender?visning=maned", Component: (p) => <AG05 {...p} view0="mnd" /> };
S["AG-05-AR"] = { id: "AG-05-AR", parent: "AG-05", name: "Kalender · år", route: "/admin/kalender?visning=ar", Component: (p) => <AG05 {...p} view0="ar" /> };
S["AG-05-ASS"] = { id: "AG-05-ASS", parent: "AG-05", name: "Kalender · assistant coach", asst: true, route: "/admin/kalender", Component: (p) => <AG05 {...p} view0="uke" asst /> };
})();
