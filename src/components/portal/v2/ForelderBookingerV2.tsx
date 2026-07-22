"use client";

/**
 * Foreldreportal · Bookinger — v2 Presis + B-pakke (status + innsyn).
 * Lese-først. Kun v2 + T.*. Enklere foreldre-språk.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { BookingStatus } from "@/generated/prisma/client";
import {
  T,
  Caps,
  Tittel,
  Kort,
  KpiFlis,
  StatusPill,
  Rad,
  TomTilstand,
  Icon,
  Knapp,
  type StatusTone,
} from "@/components/v2";

/* ── Datakontrakt (serialiserbar server→klient) ────────────────────── */

export interface ForelderBookingRad {
  id: string;
  startAt: Date;
  serviceName: string;
  durationMin: number;
  locationName: string;
  coachName: string | null;
  childName: string;
  status: BookingStatus;
}

export interface ForelderBookingerData {
  /** Antall koblede barn — 0 gir tom-tilstand. */
  antallBarn: number;
  /** Vis barnenavn i radene (kun når mer enn ett barn er koblet). */
  visBarn: boolean;
  ukenummer: number;
  /** Antall kommende bookinger som faller innenfor inneværende uke. */
  denneUka: number;
  kommende: ForelderBookingRad[];
  tidligere: ForelderBookingRad[];
}

/* ── Rene hjelpere ─────────────────────────────────────────────────── */

const NB_MND_KORT = new Intl.DateTimeFormat("nb-NO", { month: "short" });
const NB_TID = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit" });

/** Status → klarspråk-pille (aldri sperre-språk, kun innsyn). */
function statusPille(s: BookingStatus): { l: string; tone: StatusTone } {
  if (s === "CONFIRMED") return { l: "Bekreftet", tone: "up" };
  if (s === "CANCELLED") return { l: "Avlyst", tone: "down" };
  if (s === "COMPLETED") return { l: "Fullført", tone: "info" };
  return { l: "Planlagt", tone: "info" };
}

/** Varighet i minutter → «1,5 t» (≥60) eller «45 min». */
function varighet(min: number): string {
  if (min >= 60) return `${(min / 60).toFixed(1).replace(".", ",")} t`;
  return `${min} min`;
}

/** true på klient etter mount når viewport < 768px (styrer kun tallstørrelser). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

/* ── Datoboks (leading i hver rad) ─────────────────────────────────── */

function DatoBoks({ dato, aktiv }: { dato: Date; aktiv?: boolean }) {
  const dag = dato.getDate();
  const mnd = NB_MND_KORT.format(dato).replace(".", "").toUpperCase();
  return (
    <span
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        flex: "none",
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: aktiv ? T.lime : T.panel3,
        border: `1px solid ${aktiv ? "transparent" : T.border}`,
      }}
    >
      <span
        style={{
          fontFamily: T.mono,
          fontSize: 15,
          fontWeight: 700,
          lineHeight: 1,
          color: aktiv ? T.onLime : T.fg,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {dag}
      </span>
      <span
        style={{
          fontFamily: T.mono,
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: "0.06em",
          marginTop: 2,
          color: aktiv ? T.onLime : T.mut,
        }}
      >
        {mnd}
      </span>
    </span>
  );
}

/* ── Én booking-rad ────────────────────────────────────────────────── */

function BookingRad({
  b,
  visBarn,
  last,
  dempet,
}: {
  b: ForelderBookingRad;
  visBarn: boolean;
  last?: boolean;
  dempet?: boolean;
}) {
  const p = statusPille(b.status);
  const aktiv = b.status === "CONFIRMED" && !dempet;
  const meta = [
    b.locationName,
    NB_TID.format(b.startAt),
    varighet(b.durationMin),
    visBarn ? b.childName : null,
    b.coachName ? b.coachName.split(" ")[0] : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div style={{ opacity: dempet ? 0.62 : 1 }}>
      <Rad
        leading={<DatoBoks dato={b.startAt} aktiv={aktiv} />}
        title={b.serviceName}
        sub={meta}
        trailing={<StatusPill tone={p.tone}>{p.l}</StatusPill>}
        last={last}
      />
    </div>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function ForelderBookingerV2({ data }: { data: ForelderBookingerData }) {
  const mobile = useMobile();
  const router = useRouter();
  const { antallBarn, visBarn, ukenummer, denneUka, kommende, tidligere } = data;

  // Ingen barn koblet → ærlig tom-tilstand (lese-først portal).
  if (antallBarn === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        <div>
          <Caps>Bookinger</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em="timer">
              Kommende
            </Tittel>
          </div>
        </div>
        <Kort>
          <TomTilstand
            icon="users"
            title="Ingen barn er koblet ennå"
            sub="Be spilleren sende en invitasjon, eller spør coachen — så dukker timer opp her."
          />
        </Kort>
      </div>
    );
  }

  const statusTone = denneUka > 0 ? "up" : kommende.length > 0 ? "info" : "warn";
  const statusTekst =
    denneUka > 0
      ? `${denneUka} denne uka`
      : kommende.length > 0
        ? `${kommende.length} kommende`
        : "Ingen timer snart";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode + status */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Caps>{`Uke ${ukenummer}`}</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel mobile={mobile} em="timer">
              Kommende
            </Tittel>
          </div>
        </div>
        <StatusPill tone={statusTone}>{statusTekst}</StatusPill>
      </div>

      {/* KPI-stripe — status først */}
      <div className="grid grid-cols-2 md:grid-cols-3" style={{ gap: T.gap }}>
        <KpiFlis label="Kommende" value={kommende.length} />
        <KpiFlis label="Denne uka" value={denneUka} />
        <KpiFlis label="Tidligere" value={tidligere.length} />
      </div>

      {/* Én vei videre (B) — lesemodus, se coach/barn */}
      <div>
        <Knapp icon="users" full={mobile} onClick={() => router.push("/forelder/barn")}>
          Se barnets oversikt
        </Knapp>
      </div>

      {/* Kommende bookinger */}
      <Kort eyebrow="Kommende timer">
        {kommende.length > 0 ? (
          kommende.map((b, i) => (
            <BookingRad
              key={b.id}
              b={b}
              visBarn={visBarn}
              last={i === kommende.length - 1}
            />
          ))
        ) : (
          <TomTilstand
            icon="calendar"
            title="Ingen kommende timer"
            sub="Spilleren booker selv fra sin profil. Du ser dem her når de er booket."
          />
        )}
      </Kort>

      {/* Tidligere bookinger */}
      {tidligere.length > 0 && (
        <Kort eyebrow="Tidligere timer">
          {tidligere.map((b, i) => (
            <BookingRad
              key={b.id}
              b={b}
              visBarn={visBarn}
              last={i === tidligere.length - 1}
              dempet
            />
          ))}
        </Kort>
      )}

      {/* Lesemodus-notis */}
      <Kort>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Icon name="eye" size={16} style={{ color: T.fg2, flex: "none", marginTop: 2 }} />
          <p
            style={{
              fontFamily: T.ui,
              fontSize: 12.5,
              color: T.fg2,
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            Du kan se timer her, men ikke endre dem. Booking og avbestilling
            gjøres av spilleren selv.
          </p>
        </div>
      </Kort>
    </div>
  );
}
