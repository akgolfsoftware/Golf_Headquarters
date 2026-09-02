"use client";

/**
 * YearGrid — årsplan-tabellen (Måned/Timer/Volum og dominant pyramide).
 *
 * Fasit (kanon, D2 02.09.2026): designsystem/train-lock/WB-06 Arsplan 3
 * skall.dc.html — måned-tabellen her matcher fasitens kolonner og
 * volumstolpe/pyramide-mønster. Fasiten tegner i tillegg periode-bånd øverst
 * (Grunn/Spesialisering/Turnering/Evaluering, klikkbare), en fjerde kolonne
 * «Turnering · test» per måned, og et 360 px høyresidepanel med valgt
 * periodes balanse + turneringer i perioden. Ingen av delene finnes i koden
 * — det krever en periode-datamodell (start/slutt-dato per periode) som ikke
 * finnes i `YearViewModel` i dag. Ikke bygget (Ø17, 02.09.2026) — reell,
 * ikke-triviell funksjonsutvidelse, ikke en portefeil.
 */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { formatHours, PYRAMID_LABEL, UI } from "@/lib/domain/workbench/labels";
import type { YearViewModel } from "@/lib/domain/workbench/types";
import { workbenchUrl } from "@/lib/workbench/visning-url";

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
  return (
    <div
      style={{
        borderRadius: TL.radius.card,
        border: `1px solid ${TL.hair}`,
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 16px",
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
      </div>
      {aar.months.map((m) => {
        const maned = m.monthStart.slice(0, 7);
        const erInneverende = maned === inneverendeManed;
        return (
          <Link
            key={m.monthStart}
            href={workbenchUrl(playerId, "maned", { maned })}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
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
                minWidth: 0,
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
          </Link>
        );
      })}
      <div style={{ padding: "12px 16px", fontSize: 11, color: TL.mute }}>{UI.yearHint}</div>
    </div>
  );
}
