"use client";

/**
 * AgencyOS Feillogg — v2 Presis. Viser de siste feilene fra ErrorLog-tabellen
 * med kontekst, melding og stack trace, så en prod-feil kan leses uten å grave
 * i Vercel-loggene.
 *
 * Ren visning: ingen mutasjoner herfra. Stack trace ligger bak et klikk fordi
 * den er lang og sjelden det første du trenger.
 */

import { useState } from "react";
import { Caps, Tittel, Kort, KpiFlis, StatusPill, TomTilstand, Icon, T } from "@/components/v2";

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
    <div style={{ borderBottom: last ? "none" : `1px solid ${T.border}`, padding: "14px 0" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            borderRadius: 10,
            background: `color-mix(in srgb, ${T.forest} 10%, transparent)`,
            color: T.forest,
            flexShrink: 0,
          }}
        >
          <Icon name="alert-triangle" size={15} />
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: T.ui, fontSize: 14, color: T.fg, fontWeight: 600 }}>
            {rad.kontekst}
          </div>
          <div
            style={{
              fontFamily: T.mono,
              fontSize: 12,
              color: T.fg2,
              marginTop: 4,
              wordBreak: "break-word",
            }}
          >
            {rad.melding}
          </div>
          <div style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, marginTop: 6 }}>
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
                fontFamily: T.ui,
                fontSize: 12,
                color: T.lime,
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
                border: `1px solid ${T.border}`,
                background: T.farge.svartA18,
                fontFamily: T.mono,
                fontSize: 11,
                color: T.fg2,
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
        <Caps>AgencyOS · Drift</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="i produksjon.">Feillogg — hva som ryker</Tittel>
        </div>
      </div>
      <StatusPill tone={rolig ? "up" : "down"}>{rolig ? "Rolig siste døgn" : "Feil siste døgn"}</StatusPill>
    </div>
  );

  const kpi = (
    <div className="grid grid-cols-2" style={{ gap: T.gap }}>
      <KpiFlis label="Feil vist" value={`${data.feil.length} av ${data.total}`} />
      <KpiFlis label="Kritisk · 24t" value={data.sisteDogn} varsle={data.sisteDogn > 0} />
    </div>
  );

  if (data.feil.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
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
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
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
