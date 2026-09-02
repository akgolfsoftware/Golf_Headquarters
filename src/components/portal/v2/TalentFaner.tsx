/**
 * PlayerHQ Talent-faner — MASTERPLAN 15.13 (de 36 skjermene uten vei inn).
 *
 * Kartleggingen 30.08.2026 målte at «Mitt nivå» ikke hadde én eneste lenke
 * videre: Min plan, Roadmap og Sammenligning var ferdig bygget mot ekte data
 * og usynlige. Fire egne ruter, én fane-rad — samme mønster som
 * `admin/v2/GruppeFaner.tsx` (T8): lenker, ikke client-tabs, og aktiv fane er
 * tilstand (fill), ikke CTA.
 */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";

export type TalentFaneId = "mitt-niva" | "min-plan" | "roadmap" | "sammenligning";

const FANER: { id: TalentFaneId; l: string; href: string }[] = [
  { id: "mitt-niva", l: "Mitt nivå", href: "/portal/talent/mitt-niva" },
  { id: "min-plan", l: "Min plan", href: "/portal/talent/min-plan" },
  { id: "roadmap", l: "Roadmap", href: "/portal/talent/roadmap" },
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
            className="v2-press v2-focus"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              height: 30,
              padding: "0 12px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.02em",
              color: on ? TL.onFill : TL.mute,
              background: on ? TL.fill : "transparent",
              boxShadow: on ? "none" : `inset 0 0 0 1px ${TL.hair}`,
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
