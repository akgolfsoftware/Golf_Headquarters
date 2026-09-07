"use client";

import { useState } from "react";
import { TN } from "@/lib/v2/team-norway";
import { Icon } from "@/components/v2";
import type { TnMenyPunkt } from "./core";

/**
 * Mobil-erstatning for `TnRail` under Tailwind sitt default `lg`-brekkpunkt
 * (1024px, se `className="flex lg:hidden"` under - ingen
 * `tailwind.config.*` eller `@theme`-override i dette prosjektet endrer
 * det). Nær, men ikke identisk med Train-lock sin `TL_BREKK.macRail`
 * (1101px) - samme følelse på tvers av de to designsystemene selv om de
 * aldri deler kode. Ingen organisasjons-switcher her - se Task 1.4s
 * hode-kommentar i planen.
 */
export function TnRailMobil({ punkter, orgNavn }: { punkter: TnMenyPunkt[]; orgNavn: string }) {
  const [apen, setApen] = useState(false);
  const lenker = punkter.filter((p): p is Extract<TnMenyPunkt, { type: "lenke" }> => p.type === "lenke");

  return (
    <div className="flex lg:hidden" style={{ flexDirection: "column", width: "100%" }}>
      <div
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          borderBottom: `1px solid ${TN.borderSubtle}`,
          background: TN.surfaceCard,
        }}
      >
        <span style={{ fontFamily: TN.font.body, fontSize: TN.text.sm, fontWeight: TN.weight.bold, color: TN.navy900 }}>
          {orgNavn}
        </span>
        <button
          type="button"
          onClick={() => setApen((v) => !v)}
          aria-expanded={apen}
          aria-label={apen ? "Lukk meny" : "Åpne meny"}
          style={{ background: "none", border: "none", padding: 8, cursor: "pointer" }}
        >
          <Icon name={apen ? "x" : "menu"} size={20} style={{ color: TN.navy900 }} />
        </button>
      </div>
      {apen && (
        <nav
          aria-label="Team Norway"
          style={{ display: "flex", flexDirection: "column", padding: "6px 10px", gap: 2, background: TN.surfaceCard, borderBottom: `1px solid ${TN.borderSubtle}` }}
        >
          {lenker.map((p) => (
            <a
              key={p.href}
              href={p.href}
              onClick={() => setApen(false)}
              style={{
                height: 44,
                borderRadius: TN.radius.xs,
                padding: "0 10px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                textDecoration: "none",
                background: p.aktiv ? TN.navy100 : "transparent",
                color: p.aktiv ? TN.navy900 : TN.textSecondary,
                fontFamily: TN.font.body,
                fontSize: TN.text.sm,
                fontWeight: TN.weight.medium,
              }}
            >
              {p.label}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
