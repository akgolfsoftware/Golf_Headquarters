"use client";

/** TN-02 feiltilstand. Feildetaljer vises ikke på den interne flaten. */
export default function TeamNorwayError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "var(--tn-surface-page)",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div style={{ width: "min(100%, 460px)", background: "var(--tn-surface-card)", border: "1px solid var(--tn-status-red)", borderRadius: "var(--tn-radius-lg)", padding: 24 }}>
        <p style={{ margin: 0, fontFamily: "var(--tn-font-mono)", fontSize: "var(--tn-text-micro)", letterSpacing: "var(--tn-tracking-eyebrow)", textTransform: "uppercase", color: "var(--tn-status-red-text)" }}>
          Kunne ikke hente oversikten
        </p>
        <p style={{ margin: "12px 0 18px", color: "var(--tn-text-primary)", lineHeight: "var(--tn-leading-normal)" }}>
          Tilgangen kunne ikke kontrolleres akkurat nå. Ingen gruppeopplysninger vises.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{ minHeight: 44, padding: "0 18px", border: 0, borderRadius: "var(--tn-radius-full)", background: "var(--tn-navy-900)", color: "var(--tn-white)", fontFamily: "var(--tn-font-body)", fontWeight: 600, cursor: "pointer" }}
        >
          Forsøk på nytt
        </button>
      </div>
    </main>
  );
}
