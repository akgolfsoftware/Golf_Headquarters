"use client";

/**
 * Åtte Workbench-pills. Fasit: radius 2, treff 44, setningsform, aktiv grafitt.
 * Rust brukes ikke her.
 */

import Link from "next/link";
import { useEffect, useRef } from "react";
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
  okt,
  surface = "light",
}: {
  playerId: string;
  visning: WbVisning;
  uke?: string;
  maned?: string;
  aar?: string;
  okt?: string;
  surface?: "light" | "live";
}) {
  const aktiv = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    aktiv.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [visning]);

  return (
    <div
      role="tablist"
      aria-label="Visning"
      style={{
        minHeight: 44,
        display: "flex",
        alignItems: "center",
        flexWrap: "nowrap",
        overflowX: "auto",
        scrollbarWidth: "none",
        gap: 4,
      }}
    >
      {VALG.map((v) => {
        const on = visning === v.id;
        const live = surface === "live";
        return (
          <Link
            key={v.id}
            ref={on ? aktiv : undefined}
            role="tab"
            aria-selected={on}
            href={workbenchUrl(playerId, v.id, { uke, maned, aar, okt })}
            style={{
              minHeight: 44,
              borderRadius: 2,
              display: "inline-flex",
              alignItems: "center",
              padding: "0 clamp(10px, 2.8vw, 14px)",
              flexShrink: 0,
              whiteSpace: "nowrap",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: 0,
              textTransform: "none",
              textDecoration: "none",
              color: live ? (on ? "var(--wb-live-page)" : "var(--wb-live-text)") : (on ? TL.onFill : TL.text),
              background: live ? (on ? "var(--wb-live-text)" : "var(--wb-live-raised)") : (on ? TL.fill : TL.elev),
              border: `1px solid ${live ? (on ? "var(--wb-live-text)" : "var(--wb-live-raised)") : (on ? TL.fill : TL.hair)}`,
            }}
          >
            {v.label}
          </Link>
        );
      })}
    </div>
  );
}
