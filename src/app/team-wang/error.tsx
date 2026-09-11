"use client";

export default function TeamWangError({ reset }: { reset: () => void }) {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "var(--bg-app)",
        color: "var(--text-primary)",
      }}
    >
      <section
        style={{
          width: "min(100%, 520px)",
          padding: 28,
          borderRadius: 24,
          background: "var(--surface-card)",
          boxShadow: "var(--shadow-card-sm)",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: 0, fontFamily: "var(--font-brand)", fontSize: 24 }}>
          WANG-data er ikke tilgjengelig akkurat nå
        </h1>
        <p style={{ margin: "12px 0 22px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
          Vi fikk ikke kontrollert tilgangen eller hentet innholdet. Prøv igjen.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            minHeight: 48,
            padding: "12px 22px",
            border: 0,
            borderRadius: 999,
            background: "var(--wang-navy)",
            color: "var(--white)",
            fontFamily: "var(--font-brand)",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Prøv igjen
        </button>
      </section>
    </main>
  );
}
