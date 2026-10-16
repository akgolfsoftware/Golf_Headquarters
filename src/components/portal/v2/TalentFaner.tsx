/**
 * PlayerHQ Talent-faner — Precision Athletics.
 */

import Link from "next/link";

// «Min plan» og «Roadmap» utgår (28.09); adressene sender videre til Målsetninger og Plan.
export type TalentFaneId = "mitt-niva" | "sammenligning";

const FANER: { id: TalentFaneId; l: string; href: string }[] = [
  { id: "mitt-niva", l: "Mitt nivå", href: "/portal/talent/mitt-niva" },
  { id: "sammenligning", l: "Sammenligning", href: "/portal/talent/sammenligning" },
];

export function TalentFaner({ aktiv }: { aktiv: TalentFaneId }) {
  return (
    <div role="tablist" aria-label="Talent" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
      {FANER.map((f) => {
        const on = f.id === aktiv;
        return (
          <Link
            key={f.id}
            href={f.href}
            role="tab"
            aria-selected={on}
            className={`pa-btn ${on ? "pa-btn--primary" : "pa-btn--secondary"}`}
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              height: 32,
              padding: "0 14px",
              borderRadius: 999,
              fontSize: 12.5,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {f.l}
          </Link>
        );
      })}
    </div>
  );
}
