"use client";

import { Fragment } from "react";
import ItineraryRow, { buildDrillHref } from "./itinerary-row";
import NowLine from "./now-line";
import type { Session } from "@/lib/v2-fixtures";

export type ItineraryListProps = {
  sessions: Session[];
  /** Current time as decimal hours (e.g. 11.5 = 11:30) */
  nowDecimal: number;
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export default function ItineraryList({
  sessions,
  nowDecimal,
}: ItineraryListProps) {
  const activeIdx = sessions.findIndex(
    (s) => s.startH <= nowDecimal && s.endH > nowDecimal,
  );

  const hh = Math.floor(nowDecimal);
  const mm = Math.floor((nowDecimal % 1) * 60);
  const nowLabel = `${pad(hh)}:${pad(mm)}`;

  // Where to show the "NÅ" line when no active session:
  // before the first session that hasn't started yet.
  let nowLineIdx = -1;
  if (activeIdx === -1) {
    nowLineIdx = sessions.findIndex((s) => s.startH > nowDecimal);
  }

  return (
    <div className="flex flex-col gap-[18px]">
      {sessions.map((s, i) => (
        <Fragment key={s.id}>
          {nowLineIdx === i && <NowLine label={nowLabel} />}
          <ItineraryRow
            session={s}
            isActiveNow={i === activeIdx}
            isPast={s.endH < nowDecimal}
            isLast={i === sessions.length - 1}
            detailHref={buildDrillHref(s.id)}
          />
          {activeIdx === i && <NowLine label={nowLabel} sub="(pågår nå)" />}
        </Fragment>
      ))}
    </div>
  );
}
