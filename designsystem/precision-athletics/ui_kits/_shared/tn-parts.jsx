/* Poengskala for Team Norway-tester — felles seksjon for PH-14 og AG-15. */
(() => {
function TnSkala({ Meta }) {
  const T = window.TN_SCORE, M = Meta || (({ children }) => <span style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)" }}>{children}</span>);
  const [open, setOpen] = React.useState(null);
  return <section aria-label="Poengskala Team Norway-tester" className="pa-card" style={{ padding: 16, gap: 8, minWidth: 0 }}>
    <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}><span className="kicker" style={{ flex: "1 1 auto" }}>Poengskala · Team Norway-tester</span><M>{T.src}</M></div>
    <div role="list">{T.tests.map((t, i) => <div role="listitem" key={t.id} style={{ borderTop: i ? "1px solid var(--border-hairline)" : "none" }}>
      <button type="button" aria-expanded={open === t.id} onClick={() => setOpen(open === t.id ? null : t.id)} style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", width: "100%", display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 12, alignItems: "center", minHeight: 52, padding: "6px 0" }}>
        <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}><span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{t.name}</span><M>{t.rule.toUpperCase()}</M></span>
        <span style={{ font: "600 13px/1 var(--font-mono)", color: "var(--text-primary)" }}>{t.mode === "hit" ? "X / " + t.n + " treff" : t.max ? "maks " + t.max : "—"}</span>
      </button>
      {open === t.id && t.scale && <div role="table" aria-label={"Skala " + t.name} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: "4px 12px", padding: "0 0 12px" }}>{t.scale.map(([k, v]) => <React.Fragment key={k}><span style={{ font: "400 13px/1.4 var(--font-sans)", color: "var(--text-secondary)" }}>{k}</span><span style={{ font: "600 13px/1.4 var(--font-mono)", color: "var(--text-primary)", textAlign: "right" }}>{typeof v === "number" ? T.fmt(v) + " p" : v}</span></React.Fragment>)}</div>}
    </div>)}</div>
  </section>;
}
window.TN_SKALA = TnSkala;
})();
