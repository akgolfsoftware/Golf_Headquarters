"use client";

/**
 * PlayerHQ · Booking · Økt-detalj — v2 (retning C «Presis»).
 * v2-port 17. juli 2026 (Team G-B): erstatter legacy-siden i (legacy)/booking/
 * [bookingId]. Ren presentasjon av EKTE booking-felter (tjeneste, status, dato,
 * tid, sted, coach, notat). De hardkodede TIMELINE/MÅL/UTSTYR-plassholderne fra
 * legacy-siden er SLETTET — de brøt ærlig-data-prinsippet (fabrikkerte
 * øktplaner). All formatering (Oslo-tid) skjer i page.tsx.
 */

import { T, Caps, Tittel, Kort, StatusPill, MikroMeta, type StatusTone } from "@/components/v2";

export type BookingDetaljV2Data = {
  tjeneste: string;
  statusLabel: string;
  statusTone: StatusTone;
  /** Formatert dato (Europe/Oslo), f.eks. «mandag 20. juli 2026». */
  dato: string;
  /** «HH:mm–HH:mm» (Europe/Oslo). */
  tid: string;
  varighetMin: number;
  sted: string;
  coachNavn: string | null;
  notat: string | null;
};

function DetaljRad({ label, verdi, last }: { label: string; verdi: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", alignItems: "baseline", gap: 12, padding: "10px 0", borderBottom: last ? "none" : `1px solid ${T.border}` }}>
      <Caps size={9}>{label}</Caps>
      <span style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>{verdi}</span>
    </div>
  );
}

export function BookingDetaljV2({ data }: { data: BookingDetaljV2Data }) {
  return (
    <div style={{ maxWidth: 560, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hero — ekte status + tjeneste */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <StatusPill tone={data.statusTone}>{data.statusLabel}</StatusPill>
        </div>
        <Tittel>{data.tjeneste}</Tittel>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px" }}>
          <MikroMeta icon="calendar">{data.dato}</MikroMeta>
          <MikroMeta icon="clock">{data.tid} · {data.varighetMin} min</MikroMeta>
          <MikroMeta icon="map-pin">{data.sted}</MikroMeta>
          {data.coachNavn && <MikroMeta icon="user">{data.coachNavn}</MikroMeta>}
        </div>
      </div>

      {/* Detaljer — kun ekte felter fra bookingen */}
      <Kort eyebrow="Detaljer">
        <div style={{ display: "flex", flexDirection: "column" }}>
          <DetaljRad label="Tjeneste" verdi={data.tjeneste} />
          <DetaljRad label="Dato" verdi={data.dato} />
          <DetaljRad
            label="Tid"
            verdi={
              <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: T.fg }}>
                {data.tid} <span style={{ color: T.mut, fontWeight: 400 }}>({data.varighetMin} min)</span>
              </span>
            }
          />
          <DetaljRad label="Sted" verdi={data.sted} />
          {data.coachNavn && <DetaljRad label="Coach" verdi={data.coachNavn} />}
          <DetaljRad label="Status" verdi={<StatusPill tone={data.statusTone}>{data.statusLabel}</StatusPill>} last />
        </div>
      </Kort>

      {/* Notat — kun hvis det faktisk finnes */}
      {data.notat && (
        <Kort eyebrow="Notat">
          <p style={{ borderLeft: `2px solid ${T.lime}`, padding: "2px 0 2px 12px", fontFamily: T.disp, fontStyle: "italic", fontSize: 13.5, lineHeight: 1.55, color: T.fg, margin: 0 }}>
            {data.notat}
          </p>
        </Kort>
      )}
    </div>
  );
}
