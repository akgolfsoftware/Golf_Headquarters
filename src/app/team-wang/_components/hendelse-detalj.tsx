"use client";

// Hendelsedetalj — generisk direktevisning for alt som IKKE er en treningsøkt
// (samling, heldagssamling, test, foreldremøte, påmeldingsfrist). Speiler
// OktDetalj sitt tilbake-mønster: åpnes direkte (ett trykk, ingen fane-bytte),
// samme prinsipp som «Se full økt →» — Anders' regel: minst mulig klikk inn.

import { ArrowLeft } from "lucide-react";
import { IconChip } from "./primitiver";
import type { WangFarge } from "../_data/wang-plan";

export interface HendelseDetaljData {
  tittel: string;
  kategori: string;
  ikon: string;
  farge: WangFarge;
  datoLabel: string;
  tid?: string | null;
  sted?: string | null;
  beskrivelse?: string | null;
}

function InfoPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 34,
        padding: "0 14px",
        borderRadius: 999,
        background: "var(--neutral-50)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-body)",
        fontWeight: 600,
        fontSize: 13,
      }}
    >
      {children}
    </span>
  );
}

export function HendelseDetalj({
  data,
  onBack,
}: {
  data: HendelseDetaljData;
  onBack: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <button
        onClick={onBack}
        className="wang-pressable"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          height: 38,
          padding: "0 16px",
          borderRadius: 999,
          border: "none",
          cursor: "pointer",
          background: "var(--surface-card)",
          boxShadow: "var(--shadow-card-sm)",
          fontFamily: "var(--font-brand)",
          fontWeight: 600,
          fontSize: 13,
          color: "var(--text-primary)",
          alignSelf: "flex-start",
        }}
      >
        <ArrowLeft size={16} strokeWidth={2.2} aria-hidden /> Tilbake
      </button>

      <div
        className="wang-card"
        style={{
          padding: "clamp(20px,4vw,28px)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <IconChip icon={data.ikon} color={data.farge} size={52} />
          <div style={{ minWidth: 0 }}>
            <div className="t-label" style={{ color: "var(--text-secondary)" }}>
              {data.kategori}
            </div>
            <div
              style={{
                fontFamily: "var(--font-brand)",
                fontWeight: 800,
                fontSize: 19,
                color: "var(--text-primary)",
                marginTop: 2,
              }}
            >
              {data.tittel}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <InfoPill>{data.datoLabel}</InfoPill>
          {data.tid ? <InfoPill>{data.tid}</InfoPill> : null}
          {data.sted ? <InfoPill>{data.sted}</InfoPill> : null}
        </div>

        {data.beskrivelse ? (
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-body)",
              fontSize: 14.5,
              lineHeight: 1.6,
              color: "var(--text-secondary)",
            }}
          >
            {data.beskrivelse}
          </p>
        ) : null}
      </div>
    </div>
  );
}
