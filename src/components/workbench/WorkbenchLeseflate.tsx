"use client";

import { useRouter } from "next/navigation";
import { Knapp } from "@/components/v2/core";
import { TL } from "@/lib/v2/train-lock";
import { formatHours, UI } from "@/lib/domain/workbench/labels";
import { addMonths } from "@/lib/domain/workbench/operations";
import type { MonthViewModel, YearViewModel } from "@/lib/domain/workbench/types";
import { workbenchUrl, type WbVisning } from "@/lib/workbench/visning-url";
import { MonthGrid } from "./MonthGrid";
import { VisningPiller } from "./VisningPiller";
import { YearGrid } from "./YearGrid";
import { osloIdag } from "./WeekGrid";
import { TL_SCOPE } from "./wb-tl-scope";

export function WorkbenchLeseflate({
  playerId,
  spillerNavn,
  visning,
  maned,
  aar,
}: {
  playerId: string;
  spillerNavn: string;
  visning: Extract<WbVisning, "maned" | "aar">;
  maned: MonthViewModel | null;
  aar: YearViewModel | null;
}) {
  const router = useRouter();
  const idag = osloIdag();
  const ukeRef = visning === "maned" ? maned?.weeks[0]?.weekStart : `${aar?.year}-01-01`;
  const manedRef = visning === "maned" ? maned?.monthStart.slice(0, 7) : `${aar?.year}-01`;
  const aarRef = visning === "maned" ? maned?.monthStart.slice(0, 4) : String(aar?.year ?? "");

  const tittel = visning === "maned" ? (maned?.label ?? UI.visManed) : UI.yearSeason(aar?.year ?? 0);
  const under =
    visning === "maned" && maned
      ? `${spillerNavn} · ${UI.yearHours(
          maned.weekSummaries.reduce((n, u) => n + u.sessionCount, 0),
          formatHours(maned.budget.plannedMinutes),
        )}`
      : `${spillerNavn} · ${UI.yearHours(
          aar?.months.reduce((n, m) => n + m.sessionCount, 0) ?? 0,
          formatHours(aar?.budget.plannedMinutes ?? 0),
        )}`;

  function naviger(delta: -1 | 1) {
    if (visning === "maned" && maned) {
      const neste = addMonths(maned.monthStart, delta).slice(0, 7);
      router.push(workbenchUrl(playerId, "maned", { maned: neste }));
      return;
    }
    if (visning === "aar" && aar) {
      router.push(workbenchUrl(playerId, "aar", { aar: String(aar.year + delta) }));
    }
  }

  function tilIdag() {
    if (visning === "maned") {
      router.push(workbenchUrl(playerId, "maned", { maned: idag.slice(0, 7) }));
      return;
    }
    router.push(workbenchUrl(playerId, "aar", { aar: idag.slice(0, 4) }));
  }

  return (
    <div
      style={{
        ...TL_SCOPE,
        display: "grid",
        gap: 16,
        minWidth: 0,
        background: "var(--tl-scene)",
        color: "var(--tl-text)",
        fontFamily: "var(--tl-font-sans)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 10,
          minWidth: 0,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: TL.font.sans, fontSize: 19, fontWeight: 600, color: TL.text }}>
            {UI.titleAgency}
          </div>
          <div style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute }}>
            {under}
          </div>
        </div>
        <VisningPiller
          playerId={playerId}
          visning={visning}
          uke={ukeRef}
          maned={manedRef}
          aar={aarRef}
        />
        <div style={{ display: "flex", gap: 6, marginLeft: "auto", flexWrap: "wrap" }}>
          <Knapp ghost icon="chevron-left" onClick={() => naviger(-1)}>
            {visning === "maned" ? UI.monthNavPrev : UI.yearNavPrev}
          </Knapp>
          <Knapp ghost onClick={tilIdag}>
            {UI.today}
          </Knapp>
          <Knapp ghost icon="chevron-right" onClick={() => naviger(1)}>
            {visning === "maned" ? UI.monthNavNext : UI.yearNavNext}
          </Knapp>
        </div>
      </div>
      <div style={{ fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600 }}>{tittel}</div>
      {visning === "maned" && maned && <MonthGrid playerId={playerId} maned={maned} />}
      {visning === "aar" && aar && <YearGrid playerId={playerId} aar={aar} idag={idag} />}
    </div>
  );
}
