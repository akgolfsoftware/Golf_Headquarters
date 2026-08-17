"use client";

/**
 * «Én ting nå»-kortet — hjem-skjermens kjerne. Fasit: jarvis/meg-hjem.html
 * (.nowwrap/.nowhead/.nowacts/.nowfot/.nowempty). Viser saken enTingNa()
 * valgte; primærhandlingen åpner sak-artefaktet der selve
 * godkjenn/rediger/avvis-flyten bor (SakArtefakt) — ett sted for
 * gullregelen, ikke to.
 */
import { T } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";
import type { Sak } from "@/generated/prisma/client";
import { tidIgjenMs } from "@/lib/jarvis/en-ting-na";

function sladTid(sak: Sak, na: Date): { tekst: string; overFrist: boolean } {
  const ms = tidIgjenMs(sak, na);
  if (ms === null) return { tekst: "Ingen frist", overFrist: false };
  const min = Math.round(Math.abs(ms) / 60000);
  const t = min >= 60 ? `${Math.floor(min / 60)}t ${min % 60}min` : `${min}min`;
  return { tekst: ms < 0 ? `${t} over frist` : `${t} igjen`, overFrist: ms < 0 };
}

export function EnTingNaKort({ sak, na, onApne }: { sak: Sak | null; na: Date; onApne: (id: string) => void }) {
  if (!sak) {
    return (
      <div
        data-od-id="state-empty"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          padding: "32px 24px",
          borderRadius: T.rCard,
          border: `1px dashed ${T.border}`,
          background: T.panel2,
          textAlign: "center",
        }}
      >
        <Icon name="check-circle" size={20} strokeWidth={1.6} style={{ color: T.up }} />
        <h3 style={{ margin: 0, fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
          Ingenting venter på deg nå
        </h3>
        <p style={{ margin: 0, maxWidth: "36ch", fontFamily: T.bodyFont, fontSize: 13, color: T.mut, lineHeight: 1.55 }}>
          Køen er tom. Nye saker fra e-post, SMS, iMessage, Telegram og anrop dukker opp her.
        </p>
      </div>
    );
  }

  const { tekst, overFrist } = sladTid(sak, na);

  return (
    <section
      data-od-id="turn-now"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 20,
        borderRadius: T.rCard,
        border: `1px solid ${T.handling}`,
        background: T.handlingSoft,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span
          style={{
            fontFamily: T.mono,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: T.handling,
          }}
        >
          Én ting nå
        </span>
        <span style={{ fontFamily: T.mono, fontSize: 11, color: overFrist ? T.down : T.mut }}>{tekst}</span>
      </div>

      <div>
        <div style={{ fontFamily: T.disp, fontSize: 14.5, fontWeight: 600, color: T.fg }}>
          {sak.avsender ?? "Ukjent avsender"}
        </div>
        <p
          style={{
            margin: "6px 0 0",
            fontFamily: T.bodyFont,
            fontSize: 13.5,
            lineHeight: 1.6,
            color: T.fg2,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {sak.innhold}
        </p>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => onApne(sak.id)}
          data-od-id="en-ting-na"
          className="v2-press v2-focus"
          style={{
            flex: 1,
            minHeight: 40,
            borderRadius: T.rTag,
            border: `1px solid ${T.handling}`,
            background: T.handling,
            color: T.onHandling,
            fontFamily: T.ui,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Se og svar
        </button>
      </div>

      <p style={{ margin: 0, fontFamily: T.mono, fontSize: 9.5, letterSpacing: "0.04em", color: T.mut }}>
        VALGT: OVER FRIST VINNER → ELLERS MINST TID IGJEN → LIKT: ANROP FØRST
      </p>
    </section>
  );
}
