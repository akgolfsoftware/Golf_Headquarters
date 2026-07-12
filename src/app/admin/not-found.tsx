/**
 * Mørk 404 for AgencyOS (design-audit-funn 8): den globale 404-siden er
 * lys og ga «hvit blits» midt i mørk admin-chrome. Denne matcher v2-tema
 * (CSS-variablene fra DS2) og peker tilbake til cockpit.
 */

import Link from "next/link";

export default function AdminNotFound() {
  return (
    <main
      style={{
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--v2-bg)",
        padding: "64px 24px",
      }}
    >
      <div
        style={{
          background: "var(--v2-panel)",
          border: "1px solid var(--v2-border)",
          borderRadius: 14,
          padding: "40px 44px",
          maxWidth: 440,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 44,
            fontWeight: 700,
            color: "var(--v2-lime)",
            letterSpacing: "-0.03em",
          }}
        >
          404
        </div>
        <p style={{ color: "var(--v2-fg)", fontSize: 16, fontWeight: 600, marginTop: 14 }}>
          Denne siden finnes ikke
        </p>
        <p style={{ color: "var(--v2-mut)", fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>
          Adressen kan være flyttet eller feilskrevet.
        </p>
        <Link
          href="/admin/agencyos"
          style={{
            display: "inline-block",
            marginTop: 22,
            background: "var(--v2-lime)",
            color: "var(--v2-on-lime)",
            borderRadius: 999,
            padding: "10px 22px",
            fontSize: 13,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Til cockpit
        </Link>
      </div>
    </main>
  );
}
