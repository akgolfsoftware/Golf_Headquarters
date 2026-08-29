"use client";

/**
 * Visnings-pillene i Workbench-topplinjen.
 *
 * Fasit: designsystem/train-lock/A-01 Mac Uke Pro.dc.html (Årsplan · Måned ·
 * Uke · Økt-segmentet): ytre pille 36 px #1C1C1E radius 999 padding 3/gap 2,
 * indre 30 px, caps 10/600/0.06em, aktiv = hvit pille med sort tekst.
 * Avvik (PX-2): «Økt» finnes ikke som egen rute ennå — kun tre piller.
 */

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
        height: 36,
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
              height: 30,
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
