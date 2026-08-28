"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * PlayerHQ · Booking bekreftet (kvittering etter credit-booking) — v2
 * (retning C «Presis»). v2-port 17. juli 2026 (Team G-B): erstatter
 * legacy-siden i (legacy)/booking/bekreftet. COPY-FIKS i porten: legacy sa
 * «Forespørsel sendt!», men credit-bookingen opprettes CONFIRMED — ny ærlig
 * tittel «Booking bekreftet». Eierskaps-sjekk og googleKalenderUrl()
 * genereres uendret i page.tsx.
 */

import Link from "next/link";
import { Caps, Tittel, Kort, AvatarInit } from "@/components/v2";
import { Icon } from "@/components/v2/icon";

export type BookingBekreftetV2Data = {
  /** «Tjeneste · dato · klokkeslett» (Europe/Oslo, formatert i page.tsx). */
  linje: string;
  coachNavn: string | null;
  sted: string;
  varighetMin: number;
  /** Google Kalender-URL generert i page.tsx (uendret logikk). */
  kalenderUrl: string;
};

export function BookingBekreftetV2({ data }: { data: BookingBekreftetV2Data }) {
  return (
    <div data-paper-portal-booking-bekreftet style={{ maxWidth: 440, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Hero */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center", paddingTop: 8 }}>
        <span
          style={{
            width: 68,
            height: 68,
            borderRadius: 9999,
            background: `color-mix(in srgb, ${TL.fill} 14%, transparent)`,
            border: `1px solid color-mix(in srgb, ${TL.fill} 35%, transparent)`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="check-circle" size={28} style={{ color: TL.fill }} />
        </span>
        <Caps>PlayerHQ · Booking</Caps>
        <Tittel em="bekreftet">Booking</Tittel>
        <p style={{ fontFamily: TL.font.sans, fontSize: 13.5, lineHeight: 1.55, color: TL.mute, maxWidth: 320, margin: 0 }}>
          {data.linje}
        </p>
      </div>

      {/* Coach/økt-kort — kun ekte felter */}
      <Kort>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <AvatarInit navn={data.coachNavn ?? "AK Golf Academy"} size={38} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: TL.font.sans, fontSize: 14, fontWeight: 700, color: TL.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {data.coachNavn ?? "AK Golf Academy"}
            </div>
            <div style={{ fontFamily: TL.font.mono, fontSize: 10, color: TL.mute, marginTop: 2 }}>
              {data.sted} · {data.varighetMin} min
            </div>
          </div>
        </div>
      </Kort>

      {/* Handlinger */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <a href={data.kalenderUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 48, width: "100%", padding: "10px 16px",
            borderRadius: 10, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600,
          }}>Legg i kalender</span>
        </a>
        <Link href="/portal/meg/bookinger" style={{ textDecoration: "none", display: "block" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 48, width: "100%", padding: "10px 16px",
            borderRadius: 10, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600,
          }}>Se alle bookinger</span>
        </Link>
      </div>
    </div>
  );
}
