"use client";

/**
 * MonthGrid — måned-leseflaten (C1, PX-2).
 *
 * Fasit: designsystem/train-lock/A-05 Mac Maned.dc.html:
 * rutenett `40px repeat(7, 1fr)` (ukenummer-kolonne 40 px, 10/600 mute),
 * dagcelle min-height 92 med padding 6/8, datotall høyrestilt 12/600 mute
 * tabular (i dag = ring), utenfor måneden = opacity 0.35. Per økt: 2 px
 * hair-strek (aldri fargestrek) + tittel 12/600; TURN/TEST som caps
 * 9/600/0.06em mute. Maks 3 rader per dag, resten som «+N mer».
 */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { formatHours, UI } from "@/lib/domain/workbench/labels";
import type { MonthViewModel, MonthWeekRow } from "@/lib/domain/workbench/types";
import { workbenchUrl } from "@/lib/workbench/visning-url";
import { osloIdag } from "./WeekGrid";

/** Fasit A-05: hair-streken over hver økt-linje (#FFFFFF22-ekvivalent). */
const OKT_HAIR = `color-mix(in srgb, ${TL.text} 13%, transparent)`;

/** Én ukerad i A-05-rutenettet: ukenr-celle + sju dagceller (min-height 92). */
function MonthUkeRad({
  playerId,
  uke,
  idag,
}: {
  playerId: string;
  uke: MonthWeekRow;
  idag: string;
}) {
  return (
    <>
      <Link
        href={workbenchUrl(playerId, "uke", { uke: uke.weekStart })}
        aria-label={`Uke ${uke.weekNumber}`}
        style={{
          borderTop: `1px solid ${TL.hair}`,
          padding: "6px 4px",
          fontSize: 10,
          fontWeight: 600,
          color: TL.mute,
          fontVariantNumeric: "tabular-nums",
          textDecoration: "none",
        }}
      >
        {uke.weekNumber}
      </Link>
      {uke.days.map((dag) => (
        <Link
          key={dag.date}
          href={workbenchUrl(playerId, "uke", { uke: uke.weekStart })}
          style={{
            minWidth: 0,
            minHeight: 92,
            padding: "6px 8px",
            borderLeft: `1px solid ${TL.hair}`,
            borderTop: `1px solid ${TL.hair}`,
            textDecoration: "none",
            color: TL.text,
            opacity: dag.inMonth ? 1 : 0.35,
          }}
        >
          {/* A-05: datotall høyrestilt, i dag = ring (inset 1.5 px sirkel). */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: dag.date === idag ? TL.text : TL.mute,
                fontVariantNumeric: "tabular-nums",
                ...(dag.date === idag
                  ? {
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      boxShadow: `inset 0 0 0 1.5px ${TL.text}`,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }
                  : null),
              }}
            >
              {dag.dayOfMonth}
            </span>
          </div>
          {dag.lines.map((linje, i) => (
            <div key={`${dag.date}-${i}`} style={{ marginTop: 5, minWidth: 0 }}>
              {/* A-05: 2 px hair-strek per økt — aldri fargestrek. */}
              <div style={{ height: 2, background: OKT_HAIR, borderRadius: 1 }} />
              {linje.hairline ? (
                <div
                  style={{
                    marginTop: 3,
                    fontSize: 9,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: TL.mute,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {linje.title}
                </div>
              ) : (
                <div
                  style={{
                    marginTop: 3,
                    fontSize: 12,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {linje.title}
                </div>
              )}
            </div>
          ))}
          {dag.restCount > 0 && (
            <div style={{ marginTop: 4, fontSize: 10, color: TL.mute }}>
              {UI.moreCount(dag.restCount)}
            </div>
          )}
        </Link>
      ))}
    </>
  );
}

export function MonthGrid({
  playerId,
  maned,
}: {
  playerId: string;
  maned: MonthViewModel;
}) {
  const idag = osloIdag();
  if (maned.empty) {
    return (
      <div
        style={{
          padding: "26px 20px",
          borderRadius: TL.radius.card,
          border: `1px solid ${TL.hair}`,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={{ fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>
          {UI.emptyMonthTitle}
        </div>
        <div style={{ fontFamily: TL.font.sans, fontSize: 14, color: TL.mute, lineHeight: 1.6 }}>
          {UI.emptyMonthBody}
        </div>
        <Link
          href={workbenchUrl(playerId, "uke", { uke: maned.weeks[0]?.weekStart })}
          style={{
            alignSelf: "flex-start",
            height: 40,
            padding: "0 16px",
            borderRadius: TL.radius.pill,
            background: TL.fill,
            color: TL.onFill,
            display: "inline-flex",
            alignItems: "center",
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          {UI.openWeek}
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gap: 16,
        minWidth: 0,
        gridTemplateColumns: "minmax(0,1fr)",
        ["--wb-artefakt" as string]: TL.skall.artefakt,
      }}
      className="lg:grid-cols-[minmax(0,1fr)_var(--wb-artefakt)]"
    >
      <div style={{ minWidth: 0 }}>
        {/* A-05: header-rad med ukenr-kolonne 40 px + dagnavn caps. */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "40px repeat(7, 1fr)",
          }}
        >
          <div />
          {UI.weekdayShort.map((d) => (
            <div
              key={d}
              style={{
                padding: "8px 8px 7px",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: TL.mute,
              }}
            >
              {d}
            </div>
          ))}
          {maned.weeks.map((uke) => (
            <MonthUkeRad key={uke.weekStart} playerId={playerId} uke={uke} idag={idag} />
          ))}
        </div>
      </div>

      <div className="hidden lg:block" style={{ minWidth: 0 }}>
        <div
          style={{
            borderRadius: TL.radius.card,
            border: `1px solid ${TL.hair}`,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: TL.mute,
            }}
          >
            {UI.visManed}
          </div>
          <div style={{ fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600 }}>
            {maned.label}
          </div>
          <div style={{ fontSize: 12, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
            {UI.yearHours(
              maned.weekSummaries.reduce((n, u) => n + u.sessionCount, 0),
              formatHours(maned.budget.plannedMinutes),
            )}
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: TL.mute,
            }}
          >
            {UI.visUke}
          </div>
          {maned.weekSummaries.map((u) => (
            <Link
              key={u.weekStart}
              href={workbenchUrl(playerId, "uke", { uke: u.weekStart })}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                padding: "9px 0",
                borderTop: `1px solid ${TL.hair}`,
                textDecoration: "none",
                color: TL.text,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                Uke {u.weekNumber}
              </span>
              <span style={{ fontSize: 12, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
                {u.sessionCount} økter · {formatHours(u.minutes)} t
              </span>
            </Link>
          ))}
          <div style={{ fontSize: 11, color: TL.mute, lineHeight: 1.65 }}>{UI.monthHint}</div>
        </div>
      </div>
    </div>
  );
}
