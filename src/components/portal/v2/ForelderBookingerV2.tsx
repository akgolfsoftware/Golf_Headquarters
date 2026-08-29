"use client";

/**
 * Foreldreportal · Bookinger — pikselport PX-5.
 * Fasit: designsystem/train-lock/FO-03 Bookinger.dc.html
 * (+ FO-03L Bookinger lys.dc.html — lys/mørk gjøres av tokens).
 * Sticky filterlag (Alle/barn-piller, translucent per fasit), dag-grupperte
 * agenda-kort (tid | hairline | tittel+meta), «Venter»-caps i warn på
 * PENDING, «Tidligere» som samlet kort med opacity 0.5-rader. Radene har
 * ingen detalj-side ennå — chevronen er visuell (avvik notert i PR-en).
 */

import { useMemo, useState } from "react";
import { TL } from "@/lib/v2/train-lock";
import {
  FoSkjerm,
  FoHode,
  FoCaps,
  FoChevron,
  FoFotnote,
  FoTom,
} from "@/components/forelder/fo-kit";

/* ── Datakontrakt (serialisert fra loader) ─────────────────────────── */

export type ForelderBookingRad = {
  id: string;
  startAt: Date;
  serviceName: string;
  durationMin: number;
  locationName: string;
  coachName: string | null;
  /** Barnets fornavn. */
  childName: string;
  status: string;
};

export type ForelderBookingerData = {
  antallBarn: number;
  visBarn: boolean;
  ukenummer: number;
  denneUka: number;
  kommende: ForelderBookingRad[];
  tidligere: ForelderBookingRad[];
  /** Forelderens navn (caps-linjen «Forelder · …»). */
  parentName?: string;
};

/* ── Oslo-formatering (fasitens nb-NO-format) ──────────────────────── */

const OSLO_TID = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  hour: "2-digit",
  minute: "2-digit",
});
const OSLO_UKEDAG = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  weekday: "long",
});
const OSLO_UKEDAG_KORT = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  weekday: "short",
});
const OSLO_DATO = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  day: "2-digit",
  month: "2-digit",
});
const OSLO_DAGNOKKEL = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function tid(d: Date): string {
  return OSLO_TID.format(d).replace(":", ".");
}

function dato(d: Date): string {
  return OSLO_DATO.format(d).replace(/\.$/, "");
}

/** «I morgen · lør 29.08» / «Tirsdag 01.09» — fasitens gruppelabel. */
function gruppeLabel(d: Date, naa: Date): string {
  const iDag = OSLO_DAGNOKKEL.format(naa);
  const iMorgen = OSLO_DAGNOKKEL.format(new Date(naa.getTime() + 24 * 3600 * 1000));
  const nokkel = OSLO_DAGNOKKEL.format(d);
  if (nokkel === iDag) return `I dag · ${OSLO_UKEDAG_KORT.format(d).replace(".", "")} ${dato(d)}`;
  if (nokkel === iMorgen)
    return `I morgen · ${OSLO_UKEDAG_KORT.format(d).replace(".", "")} ${dato(d)}`;
  const ukedag = OSLO_UKEDAG.format(d);
  return `${ukedag.charAt(0).toUpperCase() + ukedag.slice(1)} ${dato(d)}`;
}

function varighet(min: number): string {
  if (min >= 120 && min % 60 === 0) return `${min / 60} timer`;
  return `${min} min`;
}

/* ── Agenda-kort — tid | hairline | tittel+meta | (Venter) chevron ── */

function BookingKort({ b }: { b: ForelderBookingRad }) {
  return (
    <div
      style={{
        marginTop: 10,
        background: TL.elev,
        borderRadius: 20,
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <span
        style={{
          fontFamily: TL.font.sans,
          fontSize: 15,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          width: 46,
          flexShrink: 0,
          color: TL.text,
        }}
      >
        {tid(b.startAt)}
      </span>
      <div style={{ width: 1, alignSelf: "stretch", background: TL.hair }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
          {b.serviceName} · {b.childName}
        </div>
        <div
          style={{
            marginTop: 2,
            fontFamily: TL.font.sans,
            fontSize: 13,
            color: TL.mute,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {b.locationName} · {varighet(b.durationMin)}
        </div>
      </div>
      {b.status === "PENDING" && (
        <span
          style={{
            fontFamily: TL.font.sans,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: TL.warn,
            flexShrink: 0,
          }}
        >
          Venter
        </span>
      )}
      <FoChevron />
    </div>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function ForelderBookingerV2({ data }: { data: ForelderBookingerData }) {
  const { antallBarn, kommende, tidligere, parentName } = data;
  const fornavn = (parentName ?? "").split(" ")[0] || "deg";
  const [filter, setFilter] = useState<string>("Alle");

  const barnNavn = useMemo(() => {
    const s = new Set<string>();
    for (const b of [...kommende, ...tidligere]) if (b.childName !== "—") s.add(b.childName);
    return [...s];
  }, [kommende, tidligere]);

  const venter = kommende.filter((b) => b.status === "PENDING").length;
  const naa = new Date();

  const filtrert = (rader: ForelderBookingRad[]) =>
    filter === "Alle" ? rader : rader.filter((b) => b.childName === filter);

  const kommendeVis = filtrert(kommende);
  const tidligereVis = filtrert(tidligere);

  /* Dag-grupper i innsendt (stigende) rekkefølge. */
  const grupper: { label: string; rader: ForelderBookingRad[] }[] = [];
  for (const b of kommendeVis) {
    const label = gruppeLabel(b.startAt, naa);
    const siste = grupper[grupper.length - 1];
    if (siste && siste.label === label) siste.rader.push(b);
    else grupper.push({ label, rader: [b] });
  }

  return (
    <FoSkjerm>
      <FoHode
        caps={`Forelder · ${fornavn}`}
        tittel="Bookinger"
        under={`${kommende.length} kommende${venter > 0 ? ` · ${venter} venter svar` : ""}`}
      />

      {/* Sticky filterlag — translucent per FO-03 (fasit-tegnet unntak) */}
      {barnNavn.length > 1 && (
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 3,
            margin: "12px -20px 0",
            padding: "10px 20px 12px",
            background: "color-mix(in srgb, var(--tl-scene) 72%, transparent)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            display: "flex",
            gap: 8,
          }}
        >
          {["Alle", ...barnNavn].map((navn) => {
            const aktiv = filter === navn;
            return (
              <button
                key={navn}
                type="button"
                onClick={() => setFilter(navn)}
                style={{
                  appearance: "none",
                  border: "none",
                  height: 34,
                  padding: "0 14px",
                  borderRadius: 999,
                  background: aktiv ? TL.fill : TL.dock,
                  color: aktiv ? TL.onFill : TL.mute,
                  display: "flex",
                  alignItems: "center",
                  fontFamily: TL.font.sans,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {navn}
              </button>
            );
          })}
        </div>
      )}

      {antallBarn === 0 ? (
        <FoTom
          tittel="Ingen barn er koblet ennå"
          sub="Coachen sender invitasjon når barnet er registrert i klubben."
        />
      ) : kommendeVis.length === 0 && tidligereVis.length === 0 ? (
        <FoTom
          tittel="Ingen bookinger ennå"
          sub="Kommende timer og turneringer dukker opp her."
        />
      ) : (
        <>
          {grupper.map((g, gi) => (
            <div key={g.label}>
              <div style={{ marginTop: gi === 0 ? 14 : 22 }}>
                <FoCaps>{g.label}</FoCaps>
              </div>
              {g.rader.map((b) => (
                <BookingKort key={b.id} b={b} />
              ))}
            </div>
          ))}

          {tidligereVis.length > 0 && (
            <>
              <div style={{ marginTop: 28 }}>
                <FoCaps>Tidligere</FoCaps>
              </div>
              <div
                style={{
                  marginTop: 10,
                  background: TL.elev,
                  borderRadius: 20,
                  padding: "4px 16px",
                }}
              >
                {tidligereVis.map((b, i) => (
                  <div
                    key={b.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "12px 0",
                      borderBottom:
                        i === tidligereVis.length - 1 ? "none" : `1px solid ${TL.hair}`,
                      opacity: 0.5,
                    }}
                  >
                    <span
                      style={{
                        width: 76,
                        flexShrink: 0,
                        fontFamily: TL.font.sans,
                        fontSize: 13,
                        fontWeight: 600,
                        color: TL.mute,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {dato(b.startAt)}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
                        {b.serviceName} · {b.childName}
                      </div>
                      <div style={{ marginTop: 2, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>
                        {b.status === "CANCELLED" ? "Avlyst av coach" : "Gjennomført"}
                      </div>
                    </div>
                    <FoChevron />
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <FoFotnote size={13} style={{ marginTop: 16, lineHeight: 1.5 }}>
        Venter betyr at coachen ikke har svart ennå. Du trenger ikke gjøre noe.
      </FoFotnote>
    </FoSkjerm>
  );
}
