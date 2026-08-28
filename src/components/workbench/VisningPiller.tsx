"use client";

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { UI } from "@/lib/domain/workbench/labels";
import { workbenchUrl, type WbVisning } from "@/lib/workbench/visning-url";

const VALG: { id: WbVisning; label: string }[] = [
  { id: "aar", label: UI.visAar },
  { id: "maned", label: UI.visManed },
  { id: "uke", label: UI.visUke },
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
        height: 32,
        background: TL.dock,
        borderRadius: TL.radius.pill,
        display: "flex",
        alignItems: "center",
        padding: 3,
        gap: 2,
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
              height: 26,
              borderRadius: TL.radius.pill,
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              textDecoration: "none",
              color: on ? TL.onFill : TL.mute,
              background: on ? TL.fill : "transparent",
            }}
          >
            {v.label}
          </Link>
        );
      })}
    </div>
  );
}
