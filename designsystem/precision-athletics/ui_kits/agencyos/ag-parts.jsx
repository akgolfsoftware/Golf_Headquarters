(() => {
const ns = () => window.AKGolfPrecisionAthletics_7d7c29;
const WCtx = React.createContext({ w: 1280, cw: 1224, mob: false, pad: false, desk: true });
const useW = () => React.useContext(WCtx);
const toast = (t, m) => window.dispatchEvent(new CustomEvent("ag-toast", { detail: { t, m } }));
const kr = (v) => v == null ? "—" : String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " kr";
const hm = (m) => m == null ? "—" : m < 60 ? m + " min" : Math.floor(m / 60) + " t" + (m % 60 ? " " + (m % 60) + " min" : "");
/* ServiceType → pris. Pris kommer alltid fra data: fast pris på tjenesten, ellers timepris × varighet. */
const price = (svc, rate) => svc == null ? null : svc.price != null ? svc.price : rate == null ? null : Math.round(rate * svc.min / 60);
/* Meny 28.09.2026: Cockpit · Innboks · Stall · Kalender · Workbench · Mer (kilde: _shared/ia.js). */
const IA = () => (window.AK_IA || {}).aos || { menu: [], mer: [], plassering: {} };
const NAV = IA().menu.map((m) => m.id === "MER" ? { id: "MER", label: m.label, icon: m.icon, items: IA().mer.map((x) => ({ id: x.id, label: x.label, icon: x.icon })) } : { id: m.id, label: m.label, icon: m.icon, items: [{ id: m.id, label: m.label, icon: m.icon }] });
const RAIL = IA().menu.map((m) => ({ id: m.id, label: m.label, icon: m.icon, items: [{ id: m.id, label: m.label, icon: m.icon }] }));
const rootOf = (id) => { const p = ((window.AK_IA || {}).plassering || {})[id]; return p ? p[0] : id; };

const CFG = () => window.CAT_CFG || { nav: NAV, rail: RAIL, fab: true, bell: true, reg: "AG_SCREENS", who: null, logo: "../../assets/logo-ak-golf-hq.svg" };
function Page({ children, max = 1360 }) {
  const { mob, pad } = useW();
  return <div style={{ padding: mob ? "20px 16px 104px" : pad ? "28px 24px 104px" : "32px 32px 104px", display: "flex", flexDirection: "column", gap: mob ? 16 : 24, maxWidth: max, width: "100%", boxSizing: "border-box", margin: "0 auto", minWidth: 0 }}>{children}</div>;
}
const Cols = ({ children, tpl, gap = 16, style }) => <div style={{ display: "grid", gridTemplateColumns: tpl, gap, alignItems: "start", minWidth: 0, ...style }}>{children}</div>;
const Stack = ({ children, gap = 16, style }) => <div style={{ display: "flex", flexDirection: "column", gap, minWidth: 0, ...style }}>{children}</div>;
const Meta = ({ children, s }) => <span style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere", ...s }}>{children}</span>;
const Card = ({ children, pad = 16, gap = 12, style }) => <div className="pa-card" style={{ padding: pad, gap, minWidth: 0, ...style }}>{children}</div>;
const Head = ({ k, aside }) => <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", alignItems: "baseline" }}><span className="kicker">{k}</span>{aside && <Meta>{aside}</Meta>}</div>;
const Draft = ({ children = "Utkast" }) => <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 8px", borderRadius: 4, border: "1px dashed var(--border-control)", font: "600 11px/1 var(--font-mono)", letterSpacing: ".06em", color: "var(--text-secondary)", textTransform: "uppercase", whiteSpace: "nowrap" }}>{children}</span>;
/* Aksestripe: 4 px på venstre kant, delt ved flere akser. Farge betyr akse og ingenting annet. */
const stripe = (axes) => !axes || !axes.length ? "var(--border-strong)" : axes.length === 1 ? "var(--axis-" + axes[0] + ")" : "linear-gradient(to bottom," + axes.map((a, i) => "var(--axis-" + a + ") " + (i * 100 / axes.length) + "% " + ((i + 1) * 100 / axes.length) + "%").join(",") + ")";
function EvCard({ axes, dashed, busy, children, onClick, style }) {
  const T = onClick ? "button" : "div";
  return <T type={onClick ? "button" : undefined} onClick={onClick} style={{ all: onClick ? "unset" : undefined, boxSizing: "border-box", cursor: onClick ? "pointer" : "default", position: "relative", display: "flex", flexDirection: "column", gap: 3, padding: "8px 10px 8px 14px", borderRadius: 6, background: busy ? "var(--surface-sunken)" : dashed ? "transparent" : "var(--surface-card)", border: "1px " + (dashed ? "dashed" : "solid") + " var(--border-" + (dashed ? "strong" : "hairline") + ")", overflow: "hidden", minWidth: 0, width: "100%", textAlign: "left", color: "var(--text-primary)", ...style }}>
    {!dashed && !busy && <span aria-hidden="true" style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: stripe(axes) }}></span>}
    {children}
  </T>;
}
function Gate({ state, loading, error, children }) {
  const { LoadingState, ErrorState } = ns();
  if (state === "laster") return <LoadingState text={loading || "Henter …"} />;
  if (state === "feil") return <ErrorState {...error} onRetry={() => toast("Prøver igjen", "HENTER PÅ NYTT")} />;
  return children;
}
function Quick({ kind, onClose, go }) {
  const { Sheet, Button, Select, TextInput, FormField, Segmented } = ns();
  const D = window.AG_DATA, players = ["Tobias Lindvik", "Magnus Aasheim", "Sara Holm", "Jonas Lie", "Thea Nilsen", "Emil Solberg"];
  const [p, setP] = React.useState(players[0]), [q, setQ] = React.useState(""), [holes, setHoles] = React.useState("18");
  const T = { okt: "Ny økt i Workbench", melding: "Ny melding til spiller", runde: "Registrer runde", jarvis: "Spør Jarvis", booking: "Ny booking" }[kind];
  const done = (t, m) => { onClose(); toast(t, m); };
  const foot = { okt: <Button fullWidth icon="arrow-right" onClick={() => done("Økta er lagt i Workbench som utkast", p.toUpperCase() + " · IKKE SENDT")}>Lag utkast i Workbench</Button>,
    melding: <Button fullWidth icon="arrow-right" onClick={() => { onClose(); go("AG-04"); }}>Skriv i Innboks</Button>,
    runde: <Button fullWidth icon="check" onClick={() => done("Runden er lagret", p.toUpperCase() + " · " + holes + " HULL · BRUTTO")}>Lagre runde</Button>,
    jarvis: <Button fullWidth icon="sparkles" disabled={!q.trim()} onClick={() => done("Jarvis forbereder et utkast", "DU GODKJENNER FØR NOE SENDES")}>Spør Jarvis</Button> }[kind];
  return <Sheet open={!!kind} onClose={onClose} kicker="Hurtighandling" title={T} footer={<>{foot}<Button variant="ghost" fullWidth onClick={onClose}>Avbryt</Button></>}>
    <Select label="Spiller" value={p} onChange={(e) => setP(e.target.value)} options={players} />
    {kind === "runde" && <><Select label="Bane" options={["Borregaard GK", "Fredrikstad GK", "Hvaler GK", "Onsøy GK"]} /><FormField label="Antall hull"><Segmented options={["9", "18"]} value={holes} onChange={setHoles} /></FormField><FormField label="Brutto score" hint="Til par regnes av parene på hullene som er spilt."><TextInput mono inputMode="numeric" placeholder="—" /></FormField></>}
    {kind === "okt" && <><Select label="Dag" options={D.cal.days.map((d) => d.join(" "))} /><Select label="Akse" options={["FYS", "TEK", "SLAG", "SPILL", "TURN"]} /></>}
    {kind === "jarvis" && <><FormField label="Hva vil du ha hjelp til?" hint="Jarvis forbereder. Jarvis sender og endrer ingenting selv."><TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Lag en putteblokk for uke 41" /></FormField></>}
    {kind === "melding" && <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Meldingen skrives i Innboks. Ingenting sendes før du trykker Send.</p>}
  </Sheet>;
}
function Back({ meta }) {
  const { BackBar } = ns(), { mob, pad, nav } = useW();
  if (!nav || (!nav.prev && !meta.parent)) return null;
  const reg = window[CFG().reg] || {}, to = reg[nav.prev || meta.parent];
  return <div style={{ maxWidth: meta.max || 1360, margin: "0 auto", padding: mob ? "8px 12px 0" : pad ? "12px 20px 0" : "16px 28px 0", boxSizing: "border-box" }}><BackBar to={to ? to.name : "Tilbake"} onBack={nav.back} /></div>;
}
function NavLayer({ pend, setPend, setDirty, undo, setUndo }) {
  const { ConfirmDialog, UndoToast } = ns();
  return <>
    <ConfirmDialog open={!!pend} kind="unsaved" consequences={["Endringene er ikke lagret.", "Lagre og gå videre, forkast, eller fortsett å redigere."]} onCancel={() => setPend(null)} onSecondary={() => { setDirty(false); const f = pend; setPend(null); setTimeout(f, 0); }} onConfirm={() => { setDirty(false); const f = pend; setPend(null); toast("Endringene er lagret", "LAGRET"); setTimeout(f, 0); }} />
    <UndoToast open={!!undo} message={undo ? undo.message : ""} meta={undo ? undo.meta : ""} onUndo={undo && undo.fn ? () => { undo.fn(); setUndo(null); toast("Angret", "TILBAKE SOM FØR"); } : undefined} onClose={() => setUndo(null)} />
  </>;
}
function Shell({ meta, go, children }) {
  const { NavRail, MenuBar, NavDrawer, Avatar } = ns();
  const { w } = useW();
  const [open, setOpen] = React.useState(false), [mer, setMer] = React.useState(false), [quick, setQuick] = React.useState(null);
  const C0 = CFG(), hide = meta.asst ? ["AG-20"] : [], filt = (g) => (g || []).map((x) => x.id === "MER" ? { ...x, items: x.items.filter((i) => !hide.includes(i.id)) } : x);
  const C = meta.asst ? { ...C0, nav: filt(C0.nav), rail: C0.rail ? filt(C0.rail) : C0.rail, who: { name: "Eirik Moe", role: "ASSISTANT COACH" } } : C0, rail = w >= 1024, who = C.who || window.AG_DATA.coach;
  const { state } = useW();
  if (meta.bare) return <div style={{ height: "100vh", width: "100%", overflow: "hidden", background: "var(--surface-page)", display: "flex" }}><main style={{ flex: 1, minWidth: 0, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>{children}</main></div>;
  const logoFull = <img src={C.logo || "../../assets/logo-ak-golf-hq.svg"} alt="AK Golf HQ" style={{ height: 20, display: "block" }} />;
  const onSel = (id) => { setOpen(false); setMer(false); if (id === "MER") { setMer(true); return; } go(id); };
  const FAB = window.AK_FAB || {}, F = FAB.Hurtigknapp, Bell = FAB.Bjelle, B = C.bell && IA().bell;
  const urgent = state !== "tom" && (meta.bellUrgent || (FAB.harHaster && window.INBOX ? FAB.harHaster(window.INBOX.items) : false));
  const bell = B && Bell ? <Bell count={state === "tom" ? null : B.count} urgent={urgent} label={B.label} onOpen={() => go(B.to)} /> : null;
  const railNav = C.rail || C.nav, act = C.rail ? rootOf(meta.id) : meta.id;
  const merGroups = (IA().mer || []).filter((x) => !hide.includes(x.id)).map((x) => ({ id: x.id, label: x.label, icon: x.icon, items: [x] }));
  const railEl = <NavRail brand={<img src="../../assets/ak-golf-logo-ink.svg" alt="AK Golf HQ" style={{ width: 28, height: 28, objectFit: "contain" }} />} groups={railNav} active={act} onSelect={onSel} footer={<Avatar name={who.name} size={32} />} />;
  return <div style={{ display: "flex", flexDirection: rail ? "row" : "column", height: "100vh", width: "100%", overflow: "hidden", background: "var(--surface-page)" }}>
    {rail ? (bell ? <div style={{ width: 56, flex: "none", height: "100%", display: "flex", flexDirection: "column" }}><div style={{ height: 52, flex: "none", display: "grid", placeItems: "center", background: "var(--surface-flat)", borderRight: "1px solid var(--border-hairline)" }}>{bell}</div><div style={{ flex: 1, minHeight: 0, display: "flex" }}>{railEl}</div></div> : railEl) : <MenuBar brand={logoFull} onMenu={() => setOpen(true)} open={open} actions={bell} />}
    <main style={{ flex: 1, minWidth: 0, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}><Back meta={meta} />{children}</main>
    {!rail && <NavDrawer open={open} onClose={() => setOpen(false)} brand={logoFull} groups={C.nav} active={meta.id} onSelect={onSel} footer={<window.KIT.Who {...who} />} />}
    {rail && C.rail && <NavDrawer open={mer} onClose={() => setMer(false)} brand={<span style={{ font: "600 15px/1 var(--font-sans)", color: "var(--text-primary)" }}>Mer</span>} groups={merGroups} active={meta.id} onSelect={onSel} footer={<window.KIT.Who {...who} />} />}
    {C.fab && F && <F app="aos" onAction={(id, a) => a && a.to ? go(a.to) : setQuick(id)} />}
    {C.fab && <Quick kind={quick} onClose={() => setQuick(null)} go={go} />}
  </div>;
}
function Toaster() {
  const { Toast } = ns();
  const [x, setX] = React.useState(null);
  React.useEffect(() => { const h = (e) => setX({ ...e.detail, k: Date.now() }); window.addEventListener("ag-toast", h); window.addEventListener("phq-toast", h); return () => { window.removeEventListener("ag-toast", h); window.removeEventListener("phq-toast", h); }; }, []);
  React.useEffect(() => { if (!x) return; const t = setTimeout(() => setX(null), 2800); return () => clearTimeout(t); }, [x]);
  if (!x) return null;
  return <div style={{ position: "fixed", top: 16, left: 16, right: 16, display: "flex", justifyContent: "center", zIndex: 200, pointerEvents: "none" }}><div key={x.k} style={{ pointerEvents: "auto", maxWidth: "100%" }}><Toast meta={x.m}>{x.t}</Toast></div></div>;
}
function Host({ init }) {
  const [s, setS] = React.useState(init);
  const ref = React.useRef(null), [w, setW] = React.useState(window.innerWidth);
  React.useLayoutEffect(() => { setW(ref.current.getBoundingClientRect().width); const ro = new ResizeObserver(([e]) => setW(e.contentRect.width)); ro.observe(ref.current); return () => ro.disconnect(); }, []);
  const [hist, setHist] = React.useState([]), [dirty, setDirty] = React.useState(false), [pend, setPend] = React.useState(null), [undo, setUndo] = React.useState(null);
  React.useEffect(() => { window.__agShow = (id, state, arg) => { setHist([]); setDirty(false); setUndo(null); setS((o) => ({ id: id || o.id, state: state || o.state, arg: arg || null })); }; }, []);
  React.useLayoutEffect(() => { document.querySelector("main")?.scrollTo(0, 0); }, [s.id, s.state]);
  const reg = window[CFG().reg] || {}, meta = reg[s.id] || reg[Object.keys(reg)[0]];
  const nav0 = (id, arg, push) => { if (!reg[id]) { toast(id + " er ikke tegnet ennå", "SE OVERSIKT.HTML"); return; } if (push) setHist((h) => [...h, s.id]); setS((o) => ({ ...o, id, arg: arg || null })); window.parent !== window && window.parent.postMessage({ ag: "go", id }, "*"); };
  const guard = (fn) => dirty ? setPend(() => fn) : fn();
  const isRoot = (id) => (CFG().nav || []).some((g) => g.id === id || (g.id === "MER" && g.items.some((i) => i.id === id)));
  const go = (id, arg) => guard(() => { if (isRoot(id)) setHist([]); nav0(id, arg, !isRoot(id)); });
  const back = () => guard(() => { if (hist.length) { const prev = hist[hist.length - 1]; setHist((h) => h.slice(0, -1)); nav0(prev, null, false); } else if (meta.parent) nav0(meta.parent, null, false); });
  const nav = { prev: hist[hist.length - 1] || null, back, dirty, setDirty, undo: (message, m, fn) => setUndo({ message, meta: m, fn }) };
  const cw = w >= 1024 && !meta.bare ? w - 56 : w;
  const ctx = { w, cw, mob: cw < 600, pad: cw >= 600 && cw < 1024, desk: cw >= 1024, wide: cw >= 1280, state: s.state, go, nav };
  const C = meta.Component;
  return <div ref={ref} style={{ width: "100%" }} data-screen-label={meta.id + " " + meta.name}>
    <WCtx.Provider value={ctx}><Shell meta={meta} go={go}><C key={meta.id + s.state} state={s.state} go={go} arg={s.arg} nav={nav} /></Shell><Toaster /><NavLayer pend={pend} setPend={setPend} setDirty={setDirty} undo={undo} setUndo={setUndo} /></WCtx.Provider>
  </div>;
}
window.AGQ = { ns, useW, WCtx, toast, kr, hm, price, NAV, Page, Cols, Stack, Meta, Card, Head, Draft, stripe, EvCard, Gate, Shell, Host, Toaster };
window.AG_SCREENS = window.AG_SCREENS || {};
})();
