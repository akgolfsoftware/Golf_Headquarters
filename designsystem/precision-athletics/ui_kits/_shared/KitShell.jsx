(() => {
const { Avatar, NavRail, MenuBar, NavDrawer } = window.AKGolfPrecisionAthletics_7d7c29;
const nf = (v, d = 0) => { const [i, f] = Math.abs(v).toFixed(d).split("."); return (v < 0 ? "−" : "") + i.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + (f ? "," + f : ""); };
const kr = (v) => nf(v) + " kr";
const WCtx = React.createContext(1280);
const useW = () => React.useContext(WCtx);
function useWidth(init = 1280) {
  const ref = React.useRef(null), [w, setW] = React.useState(init);
  React.useLayoutEffect(() => { if (!ref.current) return; setW(ref.current.getBoundingClientRect().width); const ro = new ResizeObserver(([e]) => setW(e.contentRect.width)); ro.observe(ref.current); return () => ro.disconnect(); }, []);
  return [ref, w];
}
function Panel({ kicker, title, action, children, pad = "var(--card-pad)", style, inverse }) {
  return (
    <section style={{ background: inverse ? "var(--surface-inverse)" : "var(--surface-card)", color: inverse ? "var(--text-inverse)" : "inherit", border: inverse ? "none" : "1px solid var(--border-hairline)", boxShadow: "var(--shadow-card)", borderRadius: 8, padding: pad, display: "flex", flexDirection: "column", gap: 16, minWidth: 0, ...style }}>
      {(kicker || title || action) && <header style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 200px", minWidth: 0 }}>
          {kicker && <div className="kicker" style={inverse ? { color: "var(--sand-400)" } : null}>{kicker}</div>}
          {title && <div style={{ font: "var(--type-title-s)", color: inverse ? "var(--text-inverse)" : "var(--text-primary)", marginTop: kicker ? 4 : 0, textWrap: "pretty" }}>{title}</div>}
        </div>
        {action}
      </header>}
      {children}
    </section>
  );
}
function PageHead({ kicker, title, sub, actions }) {
  return (
    <header style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
      <div style={{ flex: "1 1 320px", minWidth: 0 }}>
        {kicker && <div className="kicker" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{kicker}</div>}
        <h1 style={{ font: "600 clamp(22px, 1.2vw + 16px, 28px)/1.15 var(--font-sans)", letterSpacing: "var(--tracking-display)", color: "var(--text-primary)", margin: "8px 0 0", textWrap: "balance" }}>{title}</h1>
        {sub && <p style={{ font: "var(--type-body)", color: "var(--text-secondary)", margin: "8px 0 0", maxWidth: 680, textWrap: "pretty" }}>{sub}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: 8, flexWrap: "wrap", maxWidth: "100%" }}>{actions}</div>}
    </header>
  );
}
const Grid = ({ min = 280, gap = 16, children, style }) => <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill,minmax(min(100%,${min}px),1fr))`, gap, minWidth: 0, ...style }}>{children}</div>;
const Mono = ({ children, s }) => <span style={{ font: "var(--type-num-s)", fontVariantNumeric: "tabular-nums", ...s }}>{children}</span>;
function Kv({ k, v, mono = true, last }) {
  return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, padding: "12px 0", borderBottom: last ? "none" : "1px solid var(--border-hairline)", minWidth: 0 }}>
    <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", flexShrink: 0 }}>{k}</span>
    <span style={{ font: mono ? "var(--type-num)" : "500 14px/1.35 var(--font-sans)", fontVariantNumeric: "tabular-nums", color: "var(--text-primary)", textAlign: "right", minWidth: 0, overflowWrap: "anywhere" }}>{v}</span>
  </div>;
}
const pageWrap = { padding: "var(--page-y) var(--page-x) 48px", display: "flex", flexDirection: "column", gap: 24, maxWidth: 1360, width: "100%", boxSizing: "border-box", minWidth: 0 };
const G = (id, label, icon, items) => ({ id, label, icon, items: items.map(([i, l, ic, href]) => ({ id: i, label: l, icon: ic, href })) });
const logoFull = <img src="../../assets/logo-ak-golf-hq.svg" alt="AK Golf HQ" style={{ height: 20, display: "block" }} />;
const logoMark = <img src="../../assets/ak-golf-logo-ink.svg" alt="AK Golf HQ" style={{ width: 28, height: 28, objectFit: "contain" }} />;
const Who = ({ name, role }) => <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}><Avatar name={name} size={32} /><div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}><span style={{ font: "500 14px/1.2 var(--font-sans)", color: "var(--text-primary)" }}>{name}</span><span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>{role}</span></div></div>;
function download(name, text, type = "text/plain") { const b = new Blob([text], { type }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }
const shellVars = (w) => ({ "--page-x": w < 600 ? "16px" : w <= 1024 ? "24px" : "32px", "--page-y": w < 600 ? "20px" : "32px", "--card-pad": w < 600 ? "16px" : "24px", "--tap": w <= 1024 ? "44px" : "36px" });

function KitShell({ nav, screens, store, fallback, who, bare = [] }) {
  const pages = [...nav.flatMap((g) => g.items.map((i) => i.id)), ...bare];
  const [page, setPage] = React.useState(() => { const h = location.hash.slice(1); if (pages.includes(h)) return h; const s = localStorage.getItem(store); return pages.includes(s) ? s : fallback; });
  const [open, setOpen] = React.useState(false);
  const [ref, w] = useWidth(1280);
  React.useEffect(() => { localStorage.setItem(store, page); document.querySelector("main")?.scrollTo(0, 0); setOpen(false); }, [page]);
  React.useEffect(() => { window.__kitSetPage = setPage; }, []);
  const rail = w > 1024, isBare = bare.includes(page);
  const S = screens[page] || screens[fallback];
  return (
    <WCtx.Provider value={w}>
      <div ref={ref} style={{ ...shellVars(w), position: "relative", display: "flex", flexDirection: rail && !isBare ? "row" : "column", height: "100vh", width: "100%", overflow: "hidden", background: "var(--surface-page)" }}>
        {!isBare && (rail ? <NavRail brand={logoMark} groups={nav} active={page} onSelect={setPage} footer={<Avatar name={who.name} size={32} />} /> : <MenuBar brand={logoFull} onMenu={() => setOpen(true)} open={open} />)}
        <main style={{ flex: 1, minWidth: 0, minHeight: 0, overflowY: "auto", overflowX: "hidden" }} data-screen-label={page}><S go={setPage} /></main>
        {!isBare && !rail && <NavDrawer open={open} onClose={() => setOpen(false)} brand={logoFull} groups={nav} active={page} onSelect={setPage} footer={<Who {...who} />} />}
      </div>
    </WCtx.Provider>
  );
}
window.KIT = { nf, kr, Panel, PageHead, Grid, Mono, Kv, pageWrap, G, logoFull, logoMark, Who, download, useW, useWidth, WCtx, shellVars, KitShell };
})();
