"use client";

/**
 * BOOKING-DETALJ — v2 (retning C «Presis»). Lesevisning av én booking for
 * AgencyOS: tjeneste + status øverst, deretter nøkkelfelter som rader
 * (spiller/gjest, coach, tid, sted, pris, notat). Kalender, ukeliste og
 * admin-søk har alltid lenket hit (/admin/bookinger/[id]) — denne skjermen
 * gjør lenkene levende.
 *
 * Kun v2-komponenter fra "@/components/v2" (prosjekt-regel); ingen
 * mutasjonsknapper her — bekreft/avvis bor i booking-lista.
 */

import Link from "next/link";
import { Caps, Kort, Rad, StatusPill, Icon, CTAPill } from "@/components/v2";
import { T } from "@/lib/v2/tokens";

export type BookingDetaljStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

const STATUS: Record<BookingDetaljStatus, { label: string; tone: "warn" | "up" | "info" | "down" }> = {
  PENDING: { label: "Forespørsel", tone: "warn" },
  CONFIRMED: { label: "Bekreftet", tone: "up" },
  COMPLETED: { label: "Fullført", tone: "info" },
  CANCELLED: { label: "Avlyst", tone: "down" },
};

export interface AdminBookingDetaljV2Data {
  tjeneste: string;
  status: BookingDetaljStatus;
  spiller: { id: string; navn: string } | null;
  gjest: { navn: string | null; epost: string | null; telefon: string | null } | null;
  coachNavn: string | null;
  dato: string;
  tid: string;
  sted: string;
  pris: string;
  notat: string | null;
  opprettet: string;
}

function DetaljRad({
  icon,
  label,
  value,
  last,
}: {
  icon: string;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <Rad
      leading={<Icon name={icon} size={15} style={{ color: T.mut }} />}
      title={value}
      sub={label}
      trailing={null}
      last={last}
    />
  );
}

export function AdminBookingDetaljV2({ data }: { data: AdminBookingDetaljV2Data }) {
  const st = STATUS[data.status];
  const kontakt = [data.gjest?.epost, data.gjest?.telefon].filter(Boolean).join(" · ");
  // B: én primær handling — åpne spiller om finnes, ellers tilbake til lista
  const primaerHref = data.spiller ? `/admin/spillere/${data.spiller.id}` : "/admin/bookinger";
  const primaerTekst = data.spiller ? `Åpne ${data.spiller.navn}` : "Tilbake til bookinger";
  const primaerIkon = data.spiller ? "user" : "arrow-left";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 640 }}>
      <Link
        href="/admin/bookinger"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontFamily: T.ui,
          fontSize: 12,
          fontWeight: 600,
          color: T.mut,
          textDecoration: "none",
          width: "fit-content",
        }}
      >
        <Icon name="chevron-left" size={14} />
        Bookinger &amp; kapasitet
      </Link>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div>
          <Caps>Booking · {data.dato}</Caps>
          <div
            style={{
              fontFamily: T.disp,
              fontSize: 22,
              fontWeight: 700,
              color: T.fg,
              marginTop: 8,
            }}
          >
            {data.tjeneste}
          </div>
          <p style={{ margin: "6px 0 0", fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
            {data.dato} · {data.tid} · {data.sted}
          </p>
        </div>
        <StatusPill tone={st.tone}>{st.label}</StatusPill>
      </div>

      <Link href={primaerHref} style={{ textDecoration: "none", display: "block" }}>
        <CTAPill icon={primaerIkon} full>
          {primaerTekst}
        </CTAPill>
      </Link>

      <Kort pad="6px 20px">
        {data.spiller ? (
          <Link href={`/admin/spillere/${data.spiller.id}`} style={{ textDecoration: "none", display: "block" }}>
            <Rad
              leading={<Icon name="user" size={15} style={{ color: T.mut }} />}
              title={data.spiller.navn}
              sub="Spiller"
              trailing={<Icon name="chevron-right" size={14} style={{ color: T.mut }} />}
            />
          </Link>
        ) : (
          <DetaljRad icon="user" label="Gjest" value={data.gjest?.navn ?? "Gjest"} />
        )}
        {kontakt ? <DetaljRad icon="mail" label="Kontakt" value={kontakt} /> : null}
        <DetaljRad icon="users" label="Coach" value={data.coachNavn ?? "—"} />
        <DetaljRad icon="clock" label="Tid" value={`${data.dato} · ${data.tid}`} />
        <DetaljRad icon="map-pin" label="Sted" value={data.sted} />
        <DetaljRad icon="credit-card" label="Pris" value={data.pris} />
        {data.notat ? <DetaljRad icon="file-text" label="Notat" value={data.notat} /> : null}
        <DetaljRad icon="calendar" label="Opprettet" value={data.opprettet} last />
      </Kort>
    </div>
  );
}
