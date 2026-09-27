"use client";

import { useId, useRef, useState } from "react";
import { TN } from "@/lib/v2/team-norway";
import { Icon } from "@/components/v2/icon";
import { TnLogo, type TnMenyPunkt } from "./core";

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
  const menyId = useId();
  const knappRef = useRef<HTMLButtonElement>(null);
  // Gruppeoverskriftene vises også på mobil. Desktop og mobil skal ha samme
  // meny — ikke to ulike inndelinger av de samme punktene.

  return (
    <div className="flex lg:hidden" style={{ flexDirection: "column", width: "100%" }}>
      <div
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          background: TN.rail.bg,
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", minWidth: 0 }}>
          <TnLogo hoyde={24} prioritet paaMork />
          <span className="sr-only">{orgNavn}</span>
        </span>
        <button
          ref={knappRef}
          type="button"
          onClick={() => setApen((v) => !v)}
          aria-expanded={apen}
          aria-controls={menyId}
          aria-label={apen ? "Lukk meny" : "Åpne meny"}
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 44, minHeight: 44, background: "none", border: "none", padding: 8, cursor: "pointer" }}
        >
          <Icon name={apen ? "x" : "menu"} size={20} style={{ color: TN.rail.on }} />
        </button>
      </div>
      {apen && (
        <nav
          id={menyId}
          aria-label="Team Norway"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setApen(false);
              knappRef.current?.focus();
            }
          }}
          style={{ display: "flex", flexDirection: "column", padding: "6px 10px 12px", gap: 2, background: TN.rail.bg }}
        >
          {punkter.map((p, i) =>
            p.type === "overskrift" ? (
              <div
                key={`h-${i}`}
                style={{
                  fontFamily: TN.font.mono,
                  fontSize: TN.text.micro,
                  letterSpacing: TN.tracking.eyebrow,
                  textTransform: "uppercase",
                  color: TN.rail.muted,
                  padding: "16px 10px 6px",
                }}
              >
                {p.label}
              </div>
            ) : (
              <a
                key={`${p.href}-${p.label}`}
                href={p.href}
                aria-current={p.aktiv ? "page" : undefined}
                onClick={() => setApen(false)}
                style={{
                  minHeight: 44,
                  borderRadius: TN.radius.xs,
                  padding: "4px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  textDecoration: "none",
                  background: p.aktiv ? TN.rail.active : "transparent",
                  color: p.aktiv ? TN.rail.on : TN.rail.text,
                  fontFamily: TN.font.body,
                  fontSize: TN.text.sm,
                  fontWeight: p.aktiv ? TN.weight.bold : TN.weight.regular,
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 3,
                    height: 18,
                    borderRadius: TN.radius.full,
                    background: p.aktiv ? TN.rail.marker : "transparent",
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1, minWidth: 0 }}>{p.label}</span>
                {p.badge && (
                  <span style={{ fontFamily: TN.font.mono, fontSize: TN.text.micro, color: p.aktiv ? TN.rail.on : TN.rail.muted }}>{p.badge}</span>
                )}
              </a>
            ),
          )}
        </nav>
      )}
    </div>
  );
}
