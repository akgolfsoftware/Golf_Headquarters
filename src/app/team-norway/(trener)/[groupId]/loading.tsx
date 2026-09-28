/**
 * TN-09 laster — skjelett som følger postkortenes rytme.
 * Ingen import fra "use client" (gotchas.md: loading.tsx uten klient-JS).
 */
export default function GruppepostLaster() {
  const kort = (bredde: string) => (
    <div
      style={{
        background: "var(--tn-surface-card)",
        borderRadius: "var(--tn-radius-md)",
        boxShadow: "var(--tn-shadow-sm)",
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 9,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 120, height: 14, borderRadius: "var(--tn-radius-xs)", background: "var(--tn-ink-100)" }} />
        <div style={{ flex: 1 }} />
        <div
          style={{
            width: 54,
            height: 18,
            borderRadius: "var(--tn-radius-xs)",
            background: "var(--tn-ink-100)",
            flexShrink: 0,
          }}
        />
      </div>
      <div style={{ height: 12, width: bredde, borderRadius: "var(--tn-radius-xs)", background: "var(--tn-ink-100)" }} />
      <div style={{ width: "68%", height: 12, borderRadius: "var(--tn-radius-xs)", background: "var(--tn-ink-100)" }} />
      <div style={{ height: 1, background: "var(--tn-border-subtle)" }} />
      <div style={{ width: 150, height: 12, borderRadius: "var(--tn-radius-xs)", background: "var(--tn-ink-100)" }} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--tn-surface-page)", padding: "18px 32px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ width: 140, height: 11, borderRadius: "var(--tn-radius-xs)", background: "var(--tn-ink-100)" }} />
      <div style={{ width: 200, height: 26, borderRadius: "var(--tn-radius-xs)", background: "var(--tn-ink-100)", marginBottom: 8 }} />
      {kort("92%")}
      {kort("80%")}
      {kort("70%")}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 2 }}>
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: "var(--tn-radius-full)",
            border: "2px solid var(--tn-ink-200)",
            borderTopColor: "var(--tn-navy-600)",
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: "var(--tn-text-xs)", color: "var(--tn-text-secondary)" }}>Henter gruppens poster</span>
      </div>
    </div>
  );
}
