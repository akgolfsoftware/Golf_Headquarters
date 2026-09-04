"use client";

/**
 * YearGrid — årsplan-tabellen (Måned/Timer/Volum/Turnering·test) + periode-
 * bånd og valgt-periode-panel.
 *
 * Fasit (kanon, D2 02.09.2026): designsystem/train-lock/WB-06 Arsplan 3
 * skall.dc.html. Periodedata leses fra SeasonPlan/PeriodBlock (samme modell
 * som spillerens eget årsplan-canvas, WorkbenchAarsplan.tsx) — koblet inn av
 * `loadYear` (wb-actions.ts, STEG 1B Ø17). Ren leseflate (C1): ingen
 * redigering av perioder her, se YearPeriodePanel.tsx sin filhode-kommentar.
 *
 * Under 720px (iPhone-skallet) flyttes «Turnering · test» ned som egen,
 * brytende linje under måneds-navnet i stedet for en fast 180px-kolonne —
 * en fast fjerde kolonne sprengte raden på 390px (samme feilklasse som
 * gotchas.md §Rutenett-kolonne uten min-width: 0).
 */

import { useState } from "react";
import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { formatHours, PYRAMID_LABEL, UI } from "@/lib/domain/workbench/labels";
import type { YearViewModel } from "@/lib/domain/workbench/types";
import { workbenchUrl } from "@/lib/workbench/visning-url";
import { useErMobil } from "@/components/portal/v2/chat/ArtefaktPanel";
import { YearPeriodeBaand, YearPeriodePanel } from "./YearPeriodePanel";

export function YearGrid({
  playerId,
  aar,
  idag,
}: {
  playerId: string;
  aar: YearViewModel;
  /** Oslo-dato i dag (YYYY-MM-DD) — styrer hvilken måned som er fremhevet (WB-06). */
  idag?: string;
}) {
  const inneverendeManed = idag?.slice(0, 7);
  const [valgtPeriodeId, setValgtPeriodeId] = useState<string | null>(
    aar.periods.find((p) => p.aktiv)?.id ?? aar.periods[0]?.id ?? null,
  );
  const mobil = useErMobil(720);

  return (
    <div
      style={{
        borderRadius: TL.radius.card,
        border: `1px solid ${TL.hair}`,
        overflow: "hidden",
        minWidth: 0,
        display: "flex",
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: "1 1 480px", minWidth: 0 }}>
        {aar.periods.length > 0 && (
          <div style={{ padding: "16px 16px 0" }}>
            <YearPeriodeBaand
              periods={aar.periods}
              valgtId={valgtPeriodeId}
              onVelg={setValgtPeriodeId}
              fastBredde={mobil}
            />
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 16px",
            marginTop: aar.periods.length > 0 ? 14 : 0,
            borderTop: aar.periods.length > 0 ? `1px solid ${TL.hair}` : undefined,
            borderBottom: `1px solid ${TL.hair}`,
            gap: 12,
          }}
        >
          <span
            style={{
              width: 96,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: TL.mute,
            }}
          >
            {UI.visManed}
          </span>
          <span
            style={{
              width: 78,
              textAlign: "right",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: TL.mute,
            }}
          >
            Timer
          </span>
          <span
            style={{
              flex: 1,
              paddingLeft: 18,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: TL.mute,
            }}
          >
            Volum og dominant pyramide
          </span>
          {!mobil && (
            <span
              style={{
                width: 220,
                flexShrink: 0,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: TL.mute,
              }}
            >
              {UI.eventColumnTitle}
            </span>
          )}
        </div>
        {aar.months.map((m) => {
          const maned = m.monthStart.slice(0, 7);
          const erInneverende = maned === inneverendeManed;
          const eventTekst = m.eventLabels.join(" · ");
          return (
            <Link
              key={m.monthStart}
              href={workbenchUrl(playerId, "maned", { maned })}
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                padding: mobil ? "10px 16px" : "0 16px",
                minHeight: 48,
                borderBottom: `1px solid ${TL.hair}`,
                textDecoration: "none",
                color: TL.text,
                background: erInneverende ? `color-mix(in srgb, ${TL.text} 3%, transparent)` : "transparent",
              }}
            >
              <span style={{ width: 96, fontSize: 14, fontWeight: erInneverende ? 700 : 600, display: "flex", alignItems: "center", gap: 7 }}>
                {UI.monthNames[m.monthIndex - 1]}
                {erInneverende && (
                  <span aria-hidden style={{ width: 6, height: 6, borderRadius: "50%", background: TL.warm, flex: "none" }} />
                )}
              </span>
              <span
                style={{
                  width: 78,
                  textAlign: "right",
                  fontSize: 13,
                  color: TL.mute,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {formatHours(m.minutes)} t
              </span>
              <div
                style={{
                  flex: 1,
                  paddingLeft: 18,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  minWidth: mobil ? 90 : 0,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 8,
                    borderRadius: 4,
                    background: TL.dim,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      width: `${m.volumePct}%`,
                      height: 8,
                      borderRadius: 4,
                      background: TL.dock,
                    }}
                  />
                </div>
                <span
                  style={{
                    width: 52,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    color: TL.mute,
                  }}
                >
                  {m.dominantPyramid ? PYRAMID_LABEL[m.dominantPyramid] : "—"}
                </span>
              </div>
              {mobil ? (
                eventTekst && (
                  <span
                    style={{
                      flexBasis: "100%",
                      marginTop: 6,
                      paddingLeft: 96,
                      fontSize: 12,
                      color: TL.text,
                    }}
                  >
                    {eventTekst}
                  </span>
                )
              ) : (
                <span
                  style={{
                    width: 220,
                    flexShrink: 0,
                    fontSize: 12,
                    color: eventTekst ? TL.text : TL.mute,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={eventTekst || undefined}
                >
                  {eventTekst || "—"}
                </span>
              )}
            </Link>
          );
        })}
        <div style={{ padding: "12px 16px", fontSize: 11, color: TL.mute }}>{UI.yearHint}</div>
      </div>
      {aar.periods.length > 0 && (
        <YearPeriodePanel periods={aar.periods} valgtId={valgtPeriodeId} />
      )}
    </div>
  );
}
