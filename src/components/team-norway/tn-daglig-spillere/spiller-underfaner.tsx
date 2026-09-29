import Link from "next/link";

import { TN } from "@/lib/v2/team-norway";
import { tnSpillerHref } from "../tn-ruter";

export type SpillerUnderside = "oversikt" | "post" | "tester" | "analyse" | "workbench" | "teknisk-plan" | "evaluering";

/**
 * Faner på spillerens undersider (Post, Tester, Analyse, Teknisk plan,
 * Evaluering). Erstatter TnSpillerFaner på disse sidene fordi profilen (TN-02)
 * nå ligger på /team-norway/spiller/[spillerId] og Post på /post.
 * Samme props som TnSpillerFaner, så sidene bytter bare komponent.
 */
export function SpillerUnderfaner({ spillerId, spillerNavn, aktiv, kanAdministrere }: { spillerId: string; spillerNavn: string; aktiv: SpillerUnderside; kanAdministrere: boolean }) {
  const base = tnSpillerHref(spillerId);
  const faner: { id: SpillerUnderside; label: string; href: string }[] = [
    { id: "oversikt", label: "Spillerprofil", href: base },
    { id: "post", label: "Post", href: `${base}/post` },
    { id: "tester", label: "Tester", href: `${base}/tester` },
    { id: "analyse", label: "Analyse", href: `${base}/analyse` },
    ...(kanAdministrere
      ? [
          { id: "workbench" as const, label: "Plan (Workbench)", href: `/team-norway/workbench?spiller=${encodeURIComponent(spillerId)}` },
          { id: "teknisk-plan" as const, label: "Teknisk plan", href: `${base}/teknisk-plan` },
          { id: "evaluering" as const, label: "Evaluering", href: `${base}/evaluering` },
        ]
      : []),
  ];
  return (
    <header style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontFamily: TN.font.mono, fontSize: 11, letterSpacing: "0.08em", color: TN.textSecondary, overflowWrap: "anywhere" }}>{base}</p>
        <h1 style={{ margin: "10px 0 0", fontFamily: TN.font.display, fontWeight: 300, fontSize: "clamp(24px, 3vw, 36px)", lineHeight: 1.1, letterSpacing: "0.1em", textTransform: "uppercase", color: TN.navy900, overflowWrap: "anywhere" }}>{spillerNavn}</h1>
      </div>
      <nav aria-label="Spillerfaner" style={{ display: "flex", flexWrap: "wrap", borderBottom: `1px solid ${TN.navy100}` }}>
        {faner.map((f) => {
          const erAktiv = aktiv === f.id;
          return (
            <Link
              key={f.id}
              href={f.href}
              aria-current={erAktiv ? "page" : undefined}
              style={{ minHeight: 48, display: "inline-flex", alignItems: "center", padding: "0 16px", marginBottom: -1, borderBottom: `3px solid ${erAktiv ? TN.red600 : "transparent"}`, color: erAktiv ? TN.navy900 : TN.textSecondary, fontFamily: TN.font.display, fontSize: 12.5, letterSpacing: "0.16em", textTransform: "uppercase", textDecoration: "none" }}
            >
              {f.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
