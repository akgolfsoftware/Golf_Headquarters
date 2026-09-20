"use client";

/**
 * Åtte Workbench-pills. Fasit: radius 2, treff 44, setningsform, aktiv grafitt.
 * Rust brukes ikke her.
 */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { UI } from "@/lib/domain/workbench/labels";
import { workbenchUrl, type WbVisning } from "@/lib/workbench/visning-url";

const VALG: { id: WbVisning; label: string }[] = [
  { id: "aar", label: UI.visAar },
  { id: "periode", label: UI.visPeriode },
  { id: "maned", label: UI.visManed },
  { id: "uke", label: UI.visUke },
  { id: "okt", label: UI.visOkt },
  { id: "stall", label: UI.visStall },
  { id: "live", label: UI.visLive },
  { id: "min", label: UI.visMin },
];

export function VisningPiller({
  playerId,
  visning,
  uke,
  maned,
  aar,
}: {
  playerId: string;
  visning: WbVisning;
  uke?: string;
  maned?: string;
  aar?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Visning"
      style={{
        minHeight: 44,
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 4,
      }}
    >
      {VALG.map((v) => {
        const on = visning === v.id;
        return (
          <Link
            key={v.id}
            role="tab"
            aria-selected={on}
            href={workbenchUrl(playerId, v.id, { uke, maned, aar })}
            style={{
              minHeight: 44,
              borderRadius: 2,
              display: "inline-flex",
              alignItems: "center",
              padding: "0 12px",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: 0,
              textTransform: "none",
              textDecoration: "none",
              color: on ? TL.onFill : TL.text,
              background: on ? TL.fill : "transparent",
              border: on ? "none" : `1px solid ${TL.hair}`,
            }}
          >
            {v.label}
          </Link>
        );
      })}
    </div>
  );
}
