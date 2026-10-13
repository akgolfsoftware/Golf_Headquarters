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
      <div style={{ width: "min(100%, 460px)", background: "var(--tn-status-red-bg)", border: 0, borderRadius: "var(--tn-radius-lg)", padding: 24 }}>
        <h1 style={{ margin: 0, fontFamily: "var(--tn-font-display)", fontSize: 26, color: "var(--tn-status-red-text)" }}>
          Kunne ikke hente Team Norway
        </h1>
        <p style={{ margin: "12px 0 18px", color: "var(--tn-text-primary)", lineHeight: "var(--tn-leading-normal)" }}>
          Tilgangen kunne ikke kontrolleres akkurat nå. Ingen gruppeopplysninger vises.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{ minHeight: 44, padding: "0 18px", border: 0, borderRadius: "var(--tn-radius-sm)", background: "var(--tn-navy-900)", color: "var(--tn-white)", fontFamily: "var(--tn-font-body)", fontWeight: 600, cursor: "pointer" }}
        >
          Forsøk på nytt
        </button>
      </div>
    </main>
  );
}
