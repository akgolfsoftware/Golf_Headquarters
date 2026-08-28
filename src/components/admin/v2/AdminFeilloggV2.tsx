"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * AgencyOS Feillogg — v2 Presis. Viser de siste feilene fra ErrorLog-tabellen
 * med kontekst, melding og stack trace, så en prod-feil kan leses uten å grave
 * i Vercel-loggene.
 *
 * Ren visning: ingen mutasjoner herfra. Stack trace ligger bak et klikk fordi
 * den er lang og sjelden det første du trenger.
 */

import { useState } from "react";
import { Kort, KpiFlis, StatusPill, TomTilstand, Icon } from "@/components/v2";
// ── Datakontrakt (mappes fra ErrorLog i ruten) ──────────────────
export type AdminFeilloggV2Severity = "fatal" | "error" | "warn" | "info";

export interface AdminFeilloggV2Rad {
  id: string;
  /** Formatert «24. jun · 14:05». */
  tid: string;
  kontekst: string;
  melding: string;
  stack: string | null;
  severity: AdminFeilloggV2Severity;
}

export interface AdminFeilloggV2Data {
  /** De viste feilene (nyeste 50). */
  feil: AdminFeilloggV2Rad[];
  /** Totalt antall feil i basen. */
  total: number;
  /** Antall fatal/error siste døgn. */
  sisteDogn: number;
  /** Antall ulike kontekster blant de viste. */
  kontekster: number;
}

const TONE: Record<AdminFeilloggV2Severity, "up" | "warn" | "down"> = {
  fatal: "down",
  error: "down",
  warn: "warn",
  info: "up",
};

const ETIKETT: Record<AdminFeilloggV2Severity, string> = {
  fatal: "Kritisk",
  error: "Feil",
  warn: "Varsel",
  info: "Info",
};

function FeilRad({ rad, last }: { rad: AdminFeilloggV2Rad; last: boolean }) {
  const [apen, setApen] = useState(false);

  return (
    <div style={{ borderBottom: last ? "none" : `1px solid ${TL.hair}`, padding: "14px 0" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            borderRadius: 10,
            background: `color-mix(in srgb, ${TL.fill} 10%, transparent)`,
            color: TL.fill,
            flexShrink: 0,
          }}
        >
          <Icon name="alert-triangle" size={15} />
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: TL.font.sans, fontSize: 14, color: TL.text, fontWeight: 600 }}>
            {rad.kontekst}
          </div>
          <div
            style={{
              fontFamily: TL.font.mono,
              fontSize: 12,
              color: TL.mute,
              marginTop: 4,
              wordBreak: "break-word",
            }}
          >
            {rad.melding}
          </div>
          <div style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, marginTop: 6 }}>
            {rad.tid}
          </div>
          {rad.stack && (
            <button
              type="button"
              onClick={() => setApen((v) => !v)}
              style={{
                marginTop: 8,
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontFamily: TL.font.sans,
                fontSize: 12,
                color: TL.fill,
              }}
            >
              {apen ? "Skjul stack trace" : "Vis stack trace"}
            </button>
          )}
          {apen && rad.stack && (
            <pre
              style={{
                marginTop: 8,
                padding: 12,
                borderRadius: 10,
                border: `1px solid ${TL.hair}`,
                background: TL.scrim,
                fontFamily: TL.font.mono,
                fontSize: 11,
                color: TL.mute,
                lineHeight: 1.5,
                overflowX: "auto",
                whiteSpace: "pre-wrap",
              }}
            >
              {rad.stack}
            </pre>
          )}
        </div>
        <StatusPill tone={TONE[rad.severity]}>{ETIKETT[rad.severity]}</StatusPill>
      </div>
    </div>
  );
}

export function AdminFeilloggV2({ data }: { data: AdminFeilloggV2Data }) {
  const rolig = data.sisteDogn === 0;

  const hode = (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 14,
        flexWrap: "wrap",
      }}
    >
      <div>
        <div data-paper-pattern-topp>
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>Feillogg</h1>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>System</span>
        </div>
      </div>
      <StatusPill tone={rolig ? "up" : "down"}>{rolig ? "Rolig siste døgn" : "Feil siste døgn"}</StatusPill>
    </div>
  );

  const kpi = (
    <div className="grid grid-cols-2" style={{ gap: 16 }}>
      <KpiFlis label="Feil vist" value={`${data.feil.length} av ${data.total}`} />
      <KpiFlis label="Kritisk · 24t" value={data.sisteDogn} varsle={data.sisteDogn > 0} />
    </div>
  );

  if (data.feil.length === 0) {
    return (
      <div data-paper-wave-h="feillogg" data-paper-pattern style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 960, margin: "0 auto", width: "100%" }}>
        {hode}
        {kpi}
        <Kort>
          <TomTilstand
            icon="check-circle"
            title="Ingen feil logget"
            sub="Alvorlige feil havner her automatisk, og du får Telegram-melding samtidig. Loggen ryddes etter 90 dager."
          />
        </Kort>
      </div>
    );
  }

  return (
    <div data-paper-slug="agencyos-oppsett" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {hode}
      {kpi}
      <Kort pad="4px 18px">
        {data.feil.map((rad, i) => (
          <FeilRad key={rad.id} rad={rad} last={i === data.feil.length - 1} />
        ))}
      </Kort>
    </div>
  );
}
