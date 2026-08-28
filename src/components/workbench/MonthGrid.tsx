"use client";

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { formatHours, UI } from "@/lib/domain/workbench/labels";
import type { MonthViewModel } from "@/lib/domain/workbench/types";
import { workbenchUrl } from "@/lib/workbench/visning-url";

export function MonthGrid({
  playerId,
  maned,
}: {
  playerId: string;
  maned: MonthViewModel;
}) {
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
      <div
        style={{
          minWidth: 0,
          borderRadius: TL.radius.card,
          border: `1px solid ${TL.hair}`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            borderBottom: `1px solid ${TL.hair}`,
            paddingLeft: 40,
          }}
        >
          {UI.weekdayShort.map((d) => (
            <div
              key={d}
              style={{
                flex: 1,
                padding: "8px 8px 7px",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: TL.mute,
              }}
            >
              {d}
            </div>
          ))}
        </div>
        {maned.weeks.map((uke) => (
          <div
            key={uke.weekStart}
            style={{ display: "flex", borderBottom: `1px solid ${TL.hair}`, minHeight: 72 }}
          >
            <Link
              href={workbenchUrl(playerId, "uke", { uke: uke.weekStart })}
              aria-label={`Uke ${uke.weekNumber}`}
              style={{
                width: 40,
                flexShrink: 0,
                paddingTop: 8,
                textAlign: "center",
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
                  flex: 1,
                  minWidth: 0,
                  padding: "7px 8px",
                  borderLeft: `1px solid ${TL.hair}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  textDecoration: "none",
                  color: dag.inMonth ? TL.text : TL.mute,
                  opacity: dag.inMonth ? 1 : 0.45,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {dag.dayOfMonth}
                </span>
                {dag.lines.map((linje, i) => (
                  <span
                    key={`${dag.date}-${i}`}
                    style={{
                      height: 18,
                      borderRadius: 5,
                      background: linje.hairline ? "transparent" : TL.dock,
                      boxShadow: linje.hairline ? `inset 0 0 0 1px ${TL.hair}` : undefined,
                      display: "flex",
                      alignItems: "center",
                      padding: "0 6px",
                      fontSize: 10,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      color: linje.hairline ? TL.mute : TL.text,
                    }}
                  >
                    {linje.title} {formatHours(linje.durationMinutes)} t
                  </span>
                ))}
                {dag.restCount > 0 && (
                  <span style={{ fontSize: 10, color: TL.mute, paddingLeft: 2 }}>
                    {UI.moreCount(dag.restCount)}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ))}
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
