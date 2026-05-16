"use client";

// SessionCard — øktblokk i kalender-vyer.
//
// Viser:
//   - Pyramide-farge som venstre-border
//   - Tittel + tid + varighet
//   - PraksistypeBadge
//   - LIVE-indikator (puls + "NÅ"-badge) hvis økten er pågående

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { PraksistypeBadge } from "./PraksistypeBadge";
import type { PyramidArea, PracticeType } from "@/generated/prisma/client";

type Props = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  pyramide: PyramidArea;
  practiceType: PracticeType;
  notes?: string | null;
  onClick?: (id: string) => void;
  /** Kompakt visning — kun tittel + farge-stripe. */
  kompakt?: boolean;
  className?: string;
};

const PYRAMIDE_BORDER: Record<PyramidArea, string> = {
  FYS: "border-l-pyr-fys",
  TEK: "border-l-pyr-tek",
  SLAG: "border-l-pyr-slag",
  SPILL: "border-l-pyr-spill",
  TURN: "border-l-pyr-turn",
};

function erLive(start: Date, slutt: Date): boolean {
  const naa = new Date();
  return naa >= start && naa <= slutt;
}

function formaterTid(d: Date): string {
  return d.toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" });
}

function varighet(start: Date, slutt: Date): number {
  return Math.round((slutt.getTime() - start.getTime()) / 60000);
}

export function SessionCard({
  id,
  title,
  startTime,
  endTime,
  pyramide,
  practiceType,
  notes,
  onClick,
  kompakt = false,
  className,
}: Props) {
  const [live, setLive] = useState(() => erLive(startTime, endTime));

  // Sjekk live-status hvert minutt så indikatoren oppdaterer seg.
  useEffect(() => {
    const i = setInterval(() => setLive(erLive(startTime, endTime)), 60_000);
    return () => clearInterval(i);
  }, [startTime, endTime]);

  if (kompakt) {
    return (
      <button
        type="button"
        onClick={() => onClick?.(id)}
        className={cn(
          "group flex w-full items-center gap-2 border-l-4 bg-card px-2 py-1 text-left text-xs transition-colors hover:bg-secondary",
          PYRAMIDE_BORDER[pyramide],
          className,
        )}
      >
        <span className="font-mono tabular-nums text-muted-foreground">
          {formaterTid(startTime)}
        </span>
        <span className="flex-1 truncate font-medium text-foreground">{title}</span>
        {live && <LiveIndikator />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onClick?.(id)}
      className={cn(
        "group relative flex w-full flex-col gap-1.5 rounded-md border border-border border-l-4 bg-card p-2 text-left transition-colors hover:bg-secondary",
        PYRAMIDE_BORDER[pyramide],
        live && "ring-2 ring-accent",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
          {title}
        </h4>
        <PraksistypeBadge type={practiceType} />
      </div>

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1 font-mono tabular-nums">
          <Clock size={11} strokeWidth={1.5} />
          {formaterTid(startTime)}–{formaterTid(endTime)}
        </span>
        <span className="tabular-nums">{varighet(startTime, endTime)} min</span>
        {live && <LiveIndikator />}
      </div>

      {notes && (
        <p className="line-clamp-1 text-[11px] text-muted-foreground">{notes}</p>
      )}
    </button>
  );
}

function LiveIndikator() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-foreground" />
      NÅ
    </span>
  );
}
