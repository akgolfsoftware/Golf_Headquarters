"use client";

/**
 * AgencyOS · Live-tavle — Train-lock (T9, 27.08.2026).
 *
 * Fasit: `AG-09 Live-tavle.dc.html` (iPhone stack / Mac 3-kort-grid) +
 * `AG-09b Live-tavle full.dc.html` (b1 iPhone stack / b2 iPad grid /
 * b3 Mac 3-kort-grid, samme kortspråk utvidet med iPad). Mono-caption i
 * fasiten: «Tavla er artefakt, aldri fane. Ingen kart, ingen fake video,
 * ingen sim-booking.» — denne siden er derfor et rent status-overblikk
 * (timer/fremdrift), ingen video/kart.
 *
 * Ekte data (`live-tavle-data.ts`, trainingSessionV2 status=IN_PROGRESS) —
 * erstatter tidligere seed-data «Mission Control» på denne ruten.
 * «Rundt tavla» er forenklet til «Kommer i dag» (planlagte økter senere i
 * dag) — fasitens Stille/I kø-kategorisering krever signaler appen ikke
 * logger ennå (sist coach-aktivitet per økt); dokumentert i T9-DONE.md.
 */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import type { LiveTavleData } from "@/lib/agencyos/live-tavle-data";

function CapsLabel({ children, color = TL.mute }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{ fontFamily: TL.font.mono, fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: TL.track.capsSm, color }}>
      {children}
    </span>
  );
}

function Avatar({ navn }: { navn: string | null }) {
  const initialer = (navn ?? "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
  return (
    <div style={{ width: 40, height: 40, borderRadius: "50%", background: TL.avatar, color: TL.onAvatar, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: TL.font.sans }}>
      {initialer || "?"}
    </div>
  );
}

function OktKort({ okt }: { okt: LiveTavleData["liveOkter"][number] }) {
  return (
    <Link
      href={`/admin/agencyos/live/${okt.id}`}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        background: TL.elev,
        border: `1px solid ${TL.hair}`,
        borderRadius: TL.radius.card,
        padding: "14px 16px",
        textDecoration: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar navn={okt.spillerNavn} />
          <div>
            <div style={{ fontFamily: TL.font.sans, fontSize: 14, fontWeight: 700, color: TL.text }}>{okt.spillerNavn ?? "Gruppe"}</div>
            <div style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute }}>{okt.tittel}</div>
          </div>
        </div>
        <CapsLabel color={TL.warm}>I økt</CapsLabel>
      </div>

      <div style={{ fontFamily: TL.font.mono, fontSize: 26, fontWeight: 700, color: TL.text, fontVariantNumeric: "tabular-nums" }}>
        {okt.minIgjen} <span style={{ fontSize: 13, color: TL.mute, fontWeight: 400 }}>min igjen</span>
      </div>

      <div style={{ height: 6, borderRadius: 9999, background: TL.dim, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${okt.fremdriftPct}%`, background: TL.fill, borderRadius: 9999 }} />
      </div>
    </Link>
  );
}

export function LiveTavleTrainLock({ data }: { data: LiveTavleData }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div>
          <CapsLabel>
            Live · {data.liveOkter.length} {data.liveOkter.length === 1 ? "i økt" : "i økt"}
          </CapsLabel>
          <h1 style={{ margin: "6px 0 0", fontFamily: TL.font.sans, fontSize: TL.storrelse.tittel, fontWeight: 700, color: TL.text }}>Tavle</h1>
        </div>
      </div>

      {data.liveOkter.length === 0 ? (
        <div style={{ background: TL.elev, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.card, padding: "28px 20px", textAlign: "center" }}>
          <Icon name="activity" size={20} style={{ color: TL.mute }} />
          <p style={{ margin: "10px 0 0", fontFamily: TL.font.sans, fontSize: 13.5, color: TL.text }}>Ingen økter i gang nå</p>
          <p style={{ margin: "4px 0 0", fontFamily: TL.font.sans, fontSize: 12, color: TL.mute }}>Tavla fylles automatisk når en økt settes i gang.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 12 }}>
          {data.liveOkter.map((okt) => (
            <OktKort key={okt.id} okt={okt} />
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <CapsLabel color={TL.text}>Kommer i dag</CapsLabel>
        {data.kommerIDag.length === 0 ? (
          <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>Ingen flere planlagte økter i dag.</p>
        ) : (
          <div style={{ background: TL.elev, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.card, overflow: "hidden" }}>
            {data.kommerIDag.map((k, i) => (
              <Link
                key={k.id}
                href={`/admin/agencyos/live/${k.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "12px 16px",
                  borderBottom: i === data.kommerIDag.length - 1 ? "none" : `1px solid ${TL.hair}`,
                  textDecoration: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar navn={k.spillerNavn} />
                  <div>
                    <div style={{ fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 600, color: TL.text }}>{k.spillerNavn ?? "Gruppe"}</div>
                    <div style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute }}>{k.tittel}</div>
                  </div>
                </div>
                <span style={{ fontFamily: TL.font.mono, fontSize: 12, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
                  {new Date(k.startTime).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <p style={{ margin: 0, fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, textAlign: "center" }}>
        Tavla er artefakt, aldri fane. Ingen kart, ingen video, ingen sim-booking.
      </p>
    </div>
  );
}
