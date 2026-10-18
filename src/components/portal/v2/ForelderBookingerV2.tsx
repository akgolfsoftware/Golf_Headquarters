"use client";

/**
 * Avvik:
 *   - Kontrastretting fra tidligere arbeidsgren er avstemt 10.09.2026. Eldre
 *     visuelle referanser nedenfor er historikk; helskjermkontroll mot en ny
 *     valgt Claude Design-versjon gjenstår. Denne endringen justerer fargebruk,
 *     ikke skjermens funksjon eller oppsett. Se grener-og-main-2026-09-10.md
 *     under docs/beslutningsgrunnlag for faktisk kontrollomfang.
 */

/**
 * Foreldreportal · Bookinger — pikselport PX-5.
 * Fasit: designsystem/train-lock/FO-03 Bookinger.dc.html
 * (+ FO-03L Bookinger lys.dc.html — lys/mørk gjøres av tokens).
 * Sticky filterlag (Alle/barn-piller, translucent per fasit), dag-grupperte
 * agenda-kort (tid | hairline | tittel+meta), «Venter»-caps i warn på
 * PENDING, «Tidligere» som samlet kort med opacity 0.5-rader. Radene har
 * Beskyttet detalj-side bruker samme godkjente barnerelasjon.
 */

import Link from "next/link";
import {
  FoSkjerm,
  FoHode,
  FoCaps,
  FoChevron,
  FoFotnote,
  FoTom,
} from "@/components/forelder/fo-presisjon";

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
  fokusBarnId?: string | null;
};

/* Bookinger lagrer Oslo-veggklokke i UTC-feltene. Ikke konverter den én gang til. */

const OSLO_TID = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "UTC",
  hour: "2-digit",
  minute: "2-digit",
});
const OSLO_UKEDAG = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "UTC",
  weekday: "long",
});
const OSLO_UKEDAG_KORT = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "UTC",
  weekday: "short",
});
const OSLO_DATO = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "UTC",
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
    <Link href={`/forelder/bookinger/${encodeURIComponent(b.id)}`} className="fo-kort fo-agenda" style={{ textDecoration: "none", color: "inherit" }}>
      <span className="fo-tid">{tid(b.startAt)}</span>
      <div>
        <p className="fo-navn">{b.serviceName} · {b.childName}</p>
        <p className="fo-meta">{b.locationName} · {varighet(b.durationMin)}</p>
      </div>
      {b.status === "PENDING" && <span className="fo-kicker">Venter</span>}
      <FoChevron />
    </Link>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function ForelderBookingerV2({ data }: { data: ForelderBookingerData }) {
  const { antallBarn, kommende, tidligere, parentName } = data;
  const fornavn = (parentName ?? "").split(" ")[0] || "deg";
  const venter = kommende.filter((b) => b.status === "PENDING").length;
  const naa = new Date();

  // Barnevalg gjøres med godkjent ID i ForelderBarnValg og server-loaderen.
  // Felles fornavn er aldri en identitet eller et ekstra lokalt filter.
  const kommendeVis = kommende;
  const tidligereVis = tidligere;

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
        under={`${kommende.length} kommende${venter > 0 ? ` · ${venter} venter bekreftelse` : ""}`}
      />

      {/* Book ny time — CTA lagt til STEG 9.8 (foreldreportalen hadde ingen
          bookingsvei inn, kun lesevisning). FoCtaPrimar-stilen (samme som
          FO-04/06/08/10 allerede bruker), ikke en ny visuell komponent. */}
      {antallBarn > 0 && (
        <Link href={data.fokusBarnId ? `/forelder/bookinger/ny/${encodeURIComponent(data.fokusBarnId)}` : "/forelder/bookinger/ny"} className="pa-btn pa-btn--primary pa-btn--full">
          Book ny time
        </Link>
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
              <div className="fo-kort fo-tidligere">
                {tidligereVis.map((b, i) => (
                  <Link key={b.id} href={`/forelder/bookinger/${encodeURIComponent(b.id)}`} className="fo-rad" style={{ textDecoration: "none", color: "inherit" }} data-last={i === tidligereVis.length - 1 ? "true" : undefined}>
                    <span className="fo-dato">{dato(b.startAt)}</span>
                    <div>
                      <strong>{b.serviceName} · {b.childName}</strong>
                      <small>{b.status === "CANCELLED" ? "Avlyst" : b.status === "COMPLETED" ? "Gjennomført" : "Passert tidspunkt"}</small>
                    </div>
                    <FoChevron />
                  </Link>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <FoFotnote size={13} style={{ marginTop: 16, lineHeight: 1.5 }}>
        Venter betyr at timen ennå ikke er bekreftet. Kontakt coachen hvis du trenger hjelp med booking eller betaling.
      </FoFotnote>
    </FoSkjerm>
  );
}
