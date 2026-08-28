"use client";

/**
 * TM-01 TrackMan-liste. Fasit: TM-01 TrackMan liste.dc.html
 * Én hvit primær: Last opp. Tom tilstand uten fabrikkerte tall.
 */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { TrackmanImportModal } from "@/components/shared/trackman-import-modal";
import type { TrackManListeData } from "@/lib/trackman/liste-data";

function Caps({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: TL.storrelse.caps,
        fontWeight: TL.vekt.caps,
        letterSpacing: TL.track.caps,
        textTransform: "uppercase",
        color: TL.mute,
      }}
    >
      {children}
    </span>
  );
}

const PIL = (
  <svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke={TL.mute} strokeWidth="2" strokeLinecap="round">
    <path d="M1.5 1.5 L6.5 7 L1.5 12.5" />
  </svg>
);

export function TrackManListeTrainLock({ data }: { data: TrackManListeData }) {
  const n = data.rader.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <Caps>Analyse</Caps>
      <h1
        style={{
          margin: "6px 0 0",
          fontSize: TL.storrelse.tittel,
          fontWeight: TL.vekt.tittel,
          letterSpacing: TL.track.tittel,
          color: TL.text,
        }}
      >
        TrackMan
      </h1>
      <div style={{ marginTop: 6, fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
        {n === 0 ? "Ingen økter ennå" : `${n} ${n === 1 ? "økt" : "økter"}`}
      </div>

      {n > 0 && (
        <div style={{ marginTop: 14, background: TL.elev, borderRadius: TL.radius.card, padding: "4px 20px" }}>
          {data.rader.map((r, i) => (
            <Link
              key={r.id}
              href={`/portal/analysere/trackman/${r.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 0",
                borderBottom: i < n - 1 ? `1px solid ${TL.hair}` : "none",
                textDecoration: "none",
                color: "inherit",
                minWidth: 0,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: TL.text }}>
                  {r.klubb} · {r.slag} slag
                </div>
                <div style={{ marginTop: 3, fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
                  {r.undertekst}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: TL.text }}>
                  {r.carryTekst}
                </div>
                <div style={{ marginTop: 3, fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
                  {r.smashTekst}
                </div>
              </div>
              {PIL}
            </Link>
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: 14,
          border: `1.5px dashed ${TL.hair}`,
          borderRadius: TL.radius.card,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, color: TL.text }}>
          CSV eller HTML-rapport. Analyseres med en gang.
        </div>
        <TrackmanImportModal
          label="Last opp CSV / HTML"
          triggerStyle={{
            height: 48,
            borderRadius: 999,
            background: TL.fill,
            color: TL.onFill,
            fontSize: 16,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            border: "none",
            cursor: "pointer",
          }}
        />
        {n === 0 && (
          <p style={{ margin: 0, fontSize: 13, color: TL.mute, lineHeight: 1.5 }}>
            Ingen TrackMan-økt ennå. Last opp en eksport — vi lager spredning og caddie-setning automatisk.
          </p>
        )}
      </div>
    </div>
  );
}
