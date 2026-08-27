"use client";

/**
 * AgencyOS Feillogg — Train-lock (T13, 27.08.2026).
 *
 * Mønster-port av `AdminFeilloggV2` (Paper) — samme datakontrakt
 * (`AdminFeilloggV2Data`/`Rad`/`Severity`, reeksportert her for
 * bakoverkompatibilitet med ruten). Ren visning, ingen mutasjoner. Stack
 * trace bak et klikk, som før.
 *
 * Tokens: KUN TL — CLAUDE.md invariant 2.
 */

import { useState } from "react";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import { TlCaps, TlKort, TlTittel, TlTomTilstand } from "./tl-kit";

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

const SEVERITY_FARGE: Record<AdminFeilloggV2Severity, string> = {
  fatal: TL.danger,
  error: TL.danger,
  warn: TL.warn,
  info: TL.text,
};

const ETIKETT: Record<AdminFeilloggV2Severity, string> = {
  fatal: "Kritisk",
  error: "Feil",
  warn: "Varsel",
  info: "Info",
};

function StatusMerke({ severity }: { severity: AdminFeilloggV2Severity }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 22,
        padding: "0 9px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        color: SEVERITY_FARGE[severity],
        boxShadow: `inset 0 0 0 1px ${severity === "fatal" || severity === "error" ? TL.danger : TL.hair}`,
        flex: "none",
      }}
    >
      {ETIKETT[severity]}
    </span>
  );
}

function KpiBrikke({ label, value, varsle }: { label: string; value: string | number; varsle?: boolean }) {
  return (
    <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: "16px 18px" }}>
      <TlCaps size={10}>{label}</TlCaps>
      <div
        style={{
          marginTop: 8,
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          color: varsle ? TL.danger : TL.text,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function FeilRad({ rad, last }: { rad: AdminFeilloggV2Rad; last: boolean }) {
  const [apen, setApen] = useState(false);

  return (
    <div style={{ borderBottom: last ? "none" : `1px solid ${TL.hair}`, padding: "15px 0" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 34,
            height: 34,
            borderRadius: 10,
            background: TL.dock,
            color: TL.mute,
            flexShrink: 0,
          }}
        >
          <Icon name="alert-triangle" size={15} />
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: TL.text }}>{rad.kontekst}</div>
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
          <div style={{ fontSize: 12, color: TL.mute, marginTop: 6 }}>{rad.tid}</div>
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
                fontSize: 12,
                fontWeight: 600,
                color: TL.text,
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
                borderRadius: TL.radius.field,
                boxShadow: `inset 0 0 0 1px ${TL.hair}`,
                background: TL.dock,
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
        <StatusMerke severity={rad.severity} />
      </div>
    </div>
  );
}

export function AdminFeilloggTrainLock({ data }: { data: AdminFeilloggV2Data }) {
  const rolig = data.sisteDogn === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 960, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <TlTittel sub="System">Feillogg</TlTittel>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            height: 22,
            padding: "0 9px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            color: rolig ? TL.text : TL.danger,
            boxShadow: `inset 0 0 0 1px ${rolig ? TL.hair : TL.danger}`,
          }}
        >
          {rolig ? "Rolig siste døgn" : "Feil siste døgn"}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <KpiBrikke label="Feil vist" value={`${data.feil.length} av ${data.total}`} />
        <KpiBrikke label="Kritisk · 24t" value={data.sisteDogn} varsle={data.sisteDogn > 0} />
      </div>

      {data.feil.length === 0 ? (
        <TlKort>
          <TlTomTilstand
            icon="check-circle"
            title="Ingen feil logget"
            sub="Alvorlige feil havner her automatisk, og du får Telegram-melding samtidig. Loggen ryddes etter 90 dager."
          />
        </TlKort>
      ) : (
        <TlKort pad="4px 20px">
          {data.feil.map((rad, i) => (
            <FeilRad key={rad.id} rad={rad} last={i === data.feil.length - 1} />
          ))}
        </TlKort>
      )}
    </div>
  );
}
