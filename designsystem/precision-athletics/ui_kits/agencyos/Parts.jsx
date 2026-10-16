(() => {
const { Toast, IconButton } = window.AKGolfPrecisionAthletics_7d7c29;
const toast = (t, m) => window.dispatchEvent(new CustomEvent("aoa-toast", { detail: { t, m } }));
const clock = () => new Date().toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
function Toaster() {
  const [x, setX] = React.useState(null);
  React.useEffect(() => { const h = (e) => setX({ ...e.detail, k: Date.now() }); window.addEventListener("aoa-toast", h); return () => window.removeEventListener("aoa-toast", h); }, []);
  React.useEffect(() => { if (!x) return; const t = setTimeout(() => setX(null), 3000); return () => clearTimeout(t); }, [x]);
  if (!x) return null;
  return <div style={{ position: "fixed", bottom: 24, left: 16, right: 16, display: "flex", justifyContent: "center", zIndex: 90, pointerEvents: "none" }}><div key={x.k} style={{ pointerEvents: "auto", maxWidth: "100%" }}><Toast meta={x.m}>{x.t}</Toast></div></div>;
}
function useCW() { const w = window.KIT.useW(); return { w, cw: w > 1024 ? w - 56 : w, mob: w < 600, tab: w <= 1024 }; }
const Meta = ({ children, s }) => <span style={{ font: "var(--type-meta)", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums", letterSpacing: ".04em", ...s }}>{children}</span>;
const Lbl = ({ children, aside }) => <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}><span className="kicker">{children}</span>{aside && <Meta>{aside}</Meta>}</div>;
const Pills = ({ children }) => <div style={{ display: "flex", flexWrap: "wrap", gap: 8, minWidth: 0 }}>{children}</div>;
const ell = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
function Row({ lead, title, sub, trail, onClick, last, selected }) {
  return <div onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined} style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 56, padding: "8px 0", borderBottom: last ? "none" : "1px solid var(--border-hairline)", minWidth: 0, cursor: onClick ? "pointer" : "default", boxShadow: selected ? "inset 2px 0 0 var(--border-ink)" : "none", paddingLeft: selected ? 10 : 0, transition: "padding 200ms var(--ease-out)" }}>
    {lead}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)", ...ell }}>{title}</div>
      {sub && <div style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", marginTop: 2, ...ell }}>{sub}</div>}
    </div>
    {trail && <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 8 }}>{trail}</div>}
  </div>;
}
function Inspector({ open, onClose, side, kicker, title, children, footer }) {
  if (!open) return null;
  const head = <header style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "20px 20px 16px", borderBottom: "1px solid var(--border-hairline)" }}>
    <div style={{ flex: 1, minWidth: 0 }}>{kicker && <div className="kicker">{kicker}</div>}<div style={{ font: "var(--type-title-s)", color: "var(--text-primary)", marginTop: 4 }}>{title}</div></div>
    <IconButton icon="x" label="Lukk" onClick={onClose} />
  </header>;
  const body = <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>{children}</div>;
  const foot = footer && <div style={{ padding: "16px 20px 20px", borderTop: "1px solid var(--border-hairline)", display: "flex", flexDirection: "column", gap: 8 }}>{footer}</div>;
  if (side) return <aside style={{ width: 340, flex: "none", borderLeft: "1px solid var(--border-hairline)", background: "var(--surface-card)", position: "sticky", top: 0, alignSelf: "flex-start", height: "100vh", overflowY: "auto", display: "flex", flexDirection: "column" }}>{head}<div style={{ flex: 1 }}>{body}</div>{foot}</aside>;
  return <div style={{ position: "fixed", inset: 0, zIndex: 70 }}>
    <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "var(--scrim-modal)" }}></div>
    <div role="dialog" style={{ position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: "86vh", overflowY: "auto", background: "var(--surface-card)", borderRadius: "12px 12px 0 0", boxShadow: "var(--shadow-modal)" }}>{head}{body}{foot}</div>
  </div>;
}
function Bar({ value, total, tone = "var(--text-primary)" }) {
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(${total},1fr)`, gap: 3 }}>{Array.from({ length: total }, (_, i) => <span key={i} style={{ height: 8, background: i < value ? tone : "var(--surface-sunken)", border: i < value ? "none" : "1px solid var(--border-hairline)" }}></span>)}</div>;
}
window.AOA = { toast, clock, Toaster, useCW, Meta, Lbl, Pills, Row, Inspector, Bar, ell };
})();
