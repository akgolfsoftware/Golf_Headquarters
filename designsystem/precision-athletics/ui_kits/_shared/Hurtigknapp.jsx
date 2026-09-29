/* Hurtigknapp — én delt komponent for AgencyOS og PlayerHQ. Monteres én gang i skallet, aldri per skjerm. Ikke på nattflater (Live, slagteller, runde live, test).
   Handlingene kommer fra window.AK_IA (aos.fab / phq.fab). inset = plass til fanelinjen nederst (PlayerHQ under 1024). */
(() => {
const SIZE = 56, EDGE = 8, TAP = 5, MENU_W = 264;
const clamp = (p, W, H, b) => ({ x: Math.max(EDGE, Math.min(W - SIZE - EDGE, p.x)), y: Math.max(EDGE, Math.min(H - SIZE - EDGE - b, p.y)) });
function Hurtigknapp({ app = "aos", actions, onAction, inset = 0 }) {
  const { Icon } = window.AKGolfPrecisionAthletics_7d7c29;
  const ACTS = actions || ((window.AK_IA || {})[app] || {}).fab || [];
  const KEY = app + "-fab";
  const vp = () => [document.documentElement.clientWidth, window.innerHeight];
  const [pos, setPos] = React.useState(() => { const [W, H] = vp(); let p = null; try { p = JSON.parse(localStorage.getItem(KEY)); } catch (e) {} return clamp(p && typeof p.x === "number" ? p : { x: W - SIZE - 24, y: H - SIZE - 24 - inset }, W, H, inset); });
  const [open, setOpen] = React.useState(false), [drag, setDrag] = React.useState(false);
  const st = React.useRef(null), moved = React.useRef(false), btn = React.useRef(null), menu = React.useRef(null);
  React.useEffect(() => { const r = () => { const [W, H] = vp(); setPos((p) => clamp(p, W, H, inset)); }; r(); window.addEventListener("resize", r); const ro = new ResizeObserver(r); ro.observe(document.documentElement); return () => { window.removeEventListener("resize", r); ro.disconnect(); }; }, [inset]);
  React.useEffect(() => { if (!open) return; const k = (e) => { if (e.key === "Escape") { setOpen(false); btn.current && btn.current.focus(); } }; const c = (e) => { if (!menu.current?.contains(e.target) && !btn.current?.contains(e.target)) setOpen(false); }; document.addEventListener("keydown", k); document.addEventListener("pointerdown", c); requestAnimationFrame(() => menu.current?.querySelector("button")?.focus()); return () => { document.removeEventListener("keydown", k); document.removeEventListener("pointerdown", c); }; }, [open]);
  const down = (e) => { if (e.button !== 0) return; st.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y, id: e.pointerId }; moved.current = false; e.currentTarget.setPointerCapture(e.pointerId); };
  const move = (e) => { const s = st.current; if (!s) return; const dx = e.clientX - s.sx, dy = e.clientY - s.sy; if (!moved.current && Math.hypot(dx, dy) < TAP) return; if (!moved.current) { moved.current = true; setDrag(true); setOpen(false); } const [W, H] = vp(); setPos(clamp({ x: s.ox + dx, y: s.oy + dy }, W, H, inset)); };
  const up = () => { if (!st.current) return; st.current = null; if (moved.current) { setDrag(false); setPos((p) => { localStorage.setItem(KEY, JSON.stringify(p)); return p; }); } };
  const click = () => { if (moved.current) { moved.current = false; return; } setOpen((o) => !o); };
  const [W, H] = vp(), mh = ACTS.length * 52 + 16;
  const right = pos.x + MENU_W > W - EDGE, above = pos.y + SIZE + 8 + mh > H - EDGE - inset;
  const mStyle = { position: "fixed", zIndex: 121, width: Math.min(MENU_W, W - EDGE * 2), boxSizing: "border-box", left: right ? Math.max(EDGE, pos.x + SIZE - MENU_W) : pos.x, top: above ? Math.max(EDGE, pos.y - 8 - mh) : pos.y + SIZE + 8, background: "var(--surface-card)", border: "1px solid var(--border-strong)", borderRadius: 8, boxShadow: "var(--shadow-modal)", padding: 8, display: "flex", flexDirection: "column", gap: 4 };
  return <>
    <button ref={btn} type="button" aria-label="Hurtighandlinger" aria-haspopup="menu" aria-expanded={open} data-fab={app} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onClick={click}
      style={{ position: "fixed", zIndex: 120, left: pos.x, top: pos.y, width: SIZE, height: SIZE, borderRadius: "var(--radius)", border: "none", background: "var(--primary)", color: "var(--text-on-primary)", display: "grid", placeItems: "center", cursor: drag ? "grabbing" : "pointer", touchAction: "none", boxShadow: drag ? "var(--shadow-modal)" : "var(--shadow-card)", transition: drag ? "none" : "box-shadow 160ms var(--ease-out)" }}>
      <span style={{ display: "inline-flex", transform: open ? "rotate(45deg)" : "none", transition: "transform 160ms var(--ease-out)" }}><Icon name="plus" size={24} /></span>
    </button>
    {open && <div ref={menu} role="menu" aria-label="Hurtighandlinger" style={mStyle}>
      {ACTS.map((a) => <button key={a.id} type="button" role="menuitem" onClick={() => { setOpen(false); onAction && onAction(a.id, a); }} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", minHeight: 48, padding: "0 12px", borderRadius: 4, display: "flex", alignItems: "center", gap: 12, font: "500 14px/1.2 var(--font-sans)", color: "var(--text-primary)" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")} onFocus={(e) => (e.currentTarget.style.boxShadow = "inset 0 0 0 2px var(--focus-ring)")} onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}>
        <Icon name={a.icon} size={18} />{a.label}</button>)}
    </div>}
  </>;
}

/* Bjelle — øverst i skallet i PlayerHQ og AgencyOS. Tallet = uleste saker, grafitt. Rust bare når innboksen har en sak som haster
   (Risiko, eller spørsmål fra spiller ubesvart over 24 t). Rust i bjella teller mot «høyst én rust» på skjermen (Anders 28.09, ingen unntak). */
function Bjelle({ count, onOpen, label = "Innboks", compact, urgent }) {
  const { Icon } = window.AKGolfPrecisionAthletics_7d7c29;
  const n = count == null || count === 0 ? null : count > 99 ? "99+" : String(count);
  return <button type="button" data-bell="" onClick={onOpen} aria-label={n ? label + ", " + count + " uleste" + (urgent ? ", noe haster" : "") : label + ", ingen uleste"}
    style={{ position: "relative", width: 44, height: 44, flex: "none", borderRadius: 8, border: "none", background: "transparent", color: "var(--text-primary)", display: "grid", placeItems: "center", cursor: "pointer" }}>
    <Icon name="bell" size={20} />
    {n && <span className={"pa-count " + (urgent ? "pa-count--signal" : "pa-count--inverse")} aria-hidden="true" style={{ position: "absolute", top: compact ? 2 : 4, right: compact ? 0 : 2, pointerEvents: "none" }}>{n}</span>}
  </button>;
}
/* Haster = Risiko under Oppfølging, eller spørsmål fra spiller ubesvart over 24 t. */
const harHaster = (items) => (items || []).some((x) => x.o === "Risiko" || (x.f === "Spillere" && x.kind === "Spørsmål" && x.age > 24));
window.AK_FAB = { Hurtigknapp, Bjelle, harHaster };
window.AOS_FAB = { Hurtigknapp, ACTIONS: ((window.AK_IA || {}).aos || {}).fab || [] };
})();
