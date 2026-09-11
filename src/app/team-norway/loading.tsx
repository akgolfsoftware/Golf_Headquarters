/**
 * TN-02 lastetilstand. Ren server-markup uten klientavhengighet, slik at
 * Next.js kan strømme skjelettet uten en egen klient-chunk.
 */
export default function TeamNorwayLoading() {
  return (
    <main
      aria-label="Laster Team Norway-oversikten"
      aria-busy="true"
      style={{
        minHeight: "100dvh",
        background: "var(--tn-surface-page)",
        padding: "clamp(20px, 4vw, 40px)",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div style={{ width: 132, height: 12, borderRadius: "var(--tn-radius-full)", background: "var(--tn-surface-sunken)" }} />
      <div style={{ width: "min(420px, 80%)", height: 38, borderRadius: "var(--tn-radius-sm)", background: "var(--tn-surface-sunken)" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 16, maxWidth: 960 }}>
        {[0, 1, 2].map((rad) => (
          <div key={rad} style={{ minHeight: 150, borderRadius: "var(--tn-radius-lg)", background: "var(--tn-surface-card)", boxShadow: "var(--tn-shadow-sm)", padding: 24 }}>
            <div style={{ width: "55%", height: 12, borderRadius: "var(--tn-radius-full)", background: "var(--tn-surface-sunken)" }} />
            <div style={{ width: "35%", height: 34, marginTop: 14, borderRadius: "var(--tn-radius-sm)", background: "var(--tn-surface-sunken)" }} />
          </div>
        ))}
      </div>
    </main>
  );
}
