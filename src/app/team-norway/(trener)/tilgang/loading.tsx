/**
 * TN-18 laster — hele skjermen (Suspense-grensen Next.js gir gratis).
 * Ingen import fra en "use client"-modul her, heller ikke `TN` (PORTING.md
 * §5 kjent gotcha) — CSS-variablene skrives rått som strenger.
 */
export default function TilgangLaster() {
  const skjelettRad = (bredde: string) => (
    <div
      style={{
        background: "var(--tn-surface-card)",
        borderRadius: "var(--tn-radius-md)",
        boxShadow: "var(--tn-shadow-sm)",
        padding: 14,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div style={{ width: 34, height: 34, borderRadius: "var(--tn-radius-full)", background: "var(--tn-surface-sunken)", flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ height: 12, width: bredde, borderRadius: "var(--tn-radius-full)", background: "var(--tn-surface-sunken)" }} />
        <div style={{ height: 9, width: 110, borderRadius: "var(--tn-radius-full)", background: "var(--tn-surface-sunken)" }} />
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--tn-surface-page)" }}>
      <div style={{ flex: 1, minWidth: 0, padding: "28px 32px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            fontFamily: "var(--tn-font-mono)",
            fontSize: "var(--tn-text-micro)",
            letterSpacing: "var(--tn-tracking-eyebrow)",
            textTransform: "uppercase",
            color: "var(--tn-text-secondary)",
          }}
        >
          Henter tilganger per gruppe
        </div>
        {["76%", "88%", "64%", "92%", "70%"].map((bredde) => (
          <div key={bredde}>{skjelettRad(bredde)}</div>
        ))}
      </div>
    </div>
  );
}
