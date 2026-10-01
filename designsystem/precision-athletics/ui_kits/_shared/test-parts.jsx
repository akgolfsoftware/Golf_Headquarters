/* Testdetalj · delte deler for AG-15 og PH-A07. Test måler og legges aldri i økt. Øvelse i banken er gjenbrukbar. Øvelse i økt har mengde og AK-formel. */
(() => {
const ns = () => window.AKGolfPrecisionAthletics_7d7c29;
const Meta = ({ children, s }) => <span style={{ font: "var(--type-meta)", letterSpacing: ".04em", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere", ...s }}>{children}</span>;
const KIND = { test: "Test · måler", bank: "Øvelse i banken", okt: "Øvelse i økt · utkast" };
const Tag = ({ kind }) => <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 8px", borderRadius: 4, border: kind === "okt" ? "1px dashed var(--border-control)" : "1px solid var(--border-strong)", background: kind === "test" ? "var(--surface-sunken)" : "transparent", font: "600 10px/1.2 var(--font-mono)", letterSpacing: ".05em", color: "var(--text-primary)", textTransform: "uppercase", whiteSpace: "nowrap" }}>{KIND[kind]}</span>;
const valid = (t) => t.hist.filter((h) => !h.dev);

function TestHead({ t }) {
  const { AxisBadge } = ns(), v = valid(t), last = v[0];
  return <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><Tag kind="test" /><AxisBadge axis={t.axis} /><Meta>{t.src.toUpperCase()} · {t.area.toUpperCase()}</Meta></div>
    <div style={{ display: "flex", gap: 12, alignItems: "baseline", flexWrap: "wrap" }}><span style={{ font: "600 29px/1 var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{last ? last.v : "—"}</span><Meta>{t.unit.toUpperCase()} · SISTE GYLDIGE {last ? last.d : "—"} · {t.better === "hi" ? "HØYERE ER BEDRE" : "LAVERE ER BEDRE"}</Meta></div>
    <Meta>NIVÅREFERANSE — · REFERANSE IKKE SATT</Meta>
  </div>;
}
function TestSignal({ t }) {
  const { Sparkline } = ns(), v = valid(t), few = v.length < 3;
  return <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <span className="kicker">Testsignal over tid</span>
    {few ? <><span style={{ font: "600 15px/1.3 var(--font-sans)" }}>For lite grunnlag</span><span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>{v.length} gyldige {v.length === 1 ? "resultat" : "resultater"}. Signal vises fra 3 gyldige resultater.</span></> : <>
      <p style={{ margin: 0, font: "500 15px/1.4 var(--font-sans)", color: "var(--text-primary)", textWrap: "pretty" }}>{t.signal}</p>
      <Sparkline values={v.slice().reverse().map((h) => h.v)} height={40} label={"Gyldige resultater " + t.name + ": " + v.slice().reverse().map((h) => h.v).join(", ")} />
    </>}
    <Meta>PERIODE {t.period} · {v.length} GYLDIGE AV {t.hist.length} · {t.hist.some((h) => h.dev) ? "AVVIKENDE FORHOLD HOLDT UTENFOR · " : ""}OBSERVASJON, IKKE DIAGNOSE</Meta>
  </div>;
}
function TestHistory({ t }) {
  const { DataTable, StatusPill } = ns();
  return <DataTable caption="Resultathistorikk · samme test" rowKey="id" columns={[{ key: "d", label: "Dato", mono: true }, { key: "v", label: "Resultat", mono: true, align: "right", render: (r) => r.v == null ? null : r.v + " " + t.unit }, { key: "src", label: "Kilde" }, { key: "cond", label: "Testforhold" }, { key: "st", label: "Trend", render: (r) => r.dev ? <StatusPill tone="warn">Utenfor trenden</StatusPill> : <StatusPill>I trenden</StatusPill> }]} rows={t.hist} />;
}
window.TD = { Meta, Tag, TestHead, TestSignal, TestHistory, valid };
})();
