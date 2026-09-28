"use client";

/**
 * TN-18 feil — uventet unntak (PORTING.md §5: error.tsx er for det
 * uventede; «siste trener»-sperren er en gyldig serverrespons og
 * håndteres inline i TnTilgangSkjema, ikke her).
 */
export default function TilgangFeil({ reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--tn-surface-page)", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div
        style={{
          maxWidth: 420,
          background: "var(--tn-surface-card)",
          border: "1px solid var(--tn-status-red)",
          borderRadius: "var(--tn-radius-lg)",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <span
          style={{
            fontFamily: "var(--tn-font-mono)",
            fontSize: "var(--tn-text-micro)",
            letterSpacing: "var(--tn-tracking-eyebrow)",
            textTransform: "uppercase",
            color: "var(--tn-status-red-text)",
            fontWeight: 600,
          }}
        >
          Kunne ikke hente tilganger
        </span>
        <span style={{ fontSize: "var(--tn-text-base)", color: "var(--tn-text-primary)", lineHeight: "var(--tn-leading-normal)" }}>
          Noe gikk uventet feil ved lasting av trenerlisten. Ingen tilganger er endret.
        </span>
        <button
          type="button"
          onClick={reset}
          style={{
            minHeight: 44,
            padding: "0 18px",
            borderRadius: "var(--tn-radius-full)",
            background: "var(--tn-navy-900)",
            color: "var(--tn-white)",
            border: "none",
            fontFamily: "var(--tn-font-body)",
            fontSize: "var(--tn-text-sm)",
            fontWeight: 600,
            cursor: "pointer",
            alignSelf: "flex-start",
          }}
        >
          Forsøk på nytt
        </button>
      </div>
    </div>
  );
}
