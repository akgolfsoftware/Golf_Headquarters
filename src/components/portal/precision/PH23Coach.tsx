"use client";

/**
 * PH-23 Coach: én coach med «Dere sammen» og tjenestene — nytt design (pakke 11 og 12, godkjent 16.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/booking-meldinger.html, mal «coach».
 *
 * Avvik:
 *   - Undertittelen er «Coach», ikke «Coach · AK Golf Academy»: brukeren har ingen tilknytning til virksomhet i basen.
 *   - «Dere sammen» teller timer (bookinger med coachen som er bekreftet eller gjennomført og har startet),
 *     ikke «økter». Coachingsamtaler i appen (CoachingSession) står i kildelinja, ikke som hovedtall.
 *     «Siden januar» er måneden for den første timen. Mangler et tall, vises «—».
 *   - «Velg tid» går til /portal/booking/ny?service=<id>&coachId=<id>, som forhåndsvelger tjenesten.
 *   - Vilkårsteksten sier «coachens tilgjengelighet» med coachens fornavn; avbestillingsfristen kommer fra policy.ts.
 *   - Spilleren på nivået Gratis får en merknad om at booking krever nivået Full, med lenke til Abonnement.
 */
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Lock, MessageSquare } from "lucide-react";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-kommunikasjon.css";
import "@/styles/playerhq-ny-booking-meldinger.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke4-skra.css";

export type PH23CoachTjeneste = { id: string; navn: string; varighetMin: number; beskrivelse: string | null; pris: string };

export type PH23CoachData = {
  coachId: string;
  navn: string;
  initialer: string;
  /** Timer med coachen som har startet (bekreftet eller gjennomført). */
  timerSammen: number;
  /** «januar 2026» for første time, null uten timer. */
  siden: string | null;
  maanedNavn: string;
  timerIMaaned: number;
  /** null = ingen coaching-pakke. */
  klippIgjen: number | null;
  /** «07.10» eller null. */
  nesteTime: string | null;
  samtaler: number;
  tjenester: PH23CoachTjeneste[];
  avbestillingTimer: number;
  kreverFull: boolean;
};

const BOOK = "/portal/booking/ny";
const MELDING = "/portal/coach/melding";

export function PH23Coach({ data }: { data: PH23CoachData }) {
  const [valgt, setValgt] = useState<string | null>(data.tjenester[0]?.id ?? null);
  const fornavn = data.navn.split(" ")[0] || "coachen";
  const bookHref = valgt
    ? `${BOOK}?service=${encodeURIComponent(valgt)}&coachId=${encodeURIComponent(data.coachId)}`
    : `${BOOK}?coachId=${encodeURIComponent(data.coachId)}`;

  return <div className="phn phn-skra">
    <SkraTopp
      lav
      etikett="Coach"
      bilde="/images/playerhq/tek-video.jpg" bildePosisjon="50% 50%"
      overlinje="Coach"
      tittel={data.navn}
      handling={<span className="skra-topp-rad"><span className="skra-tilbake"><Link href="/portal/booking" className="phn-k-tilbake"><ChevronLeft className="phn-ikon" aria-hidden />Bookinger</Link></span></span>}
    />
    <SkraFlyt lav>
    <div className="phn-bm-grid">
      <div>
        <section className="phn-kort" aria-label="Dere sammen">
          <div className="phn-hoved"><strong>{data.timerSammen > 0 ? data.timerSammen : "—"}</strong>
            <span className="phn-forklar">{data.timerSammen > 0 ? `timer sammen${data.siden ? ` siden ${data.siden}` : ""}` : "Ingen timer sammen ennå"}</span></div>
          <div className="phn-bm-tre-tall">
            <span><b>{data.timerIMaaned}</b>i {data.maanedNavn}</span>
            <span><b>{data.klippIgjen ?? "—"}</b>klipp igjen</span>
            <span><b>{data.nesteTime ?? "—"}</b>neste time</span>
          </div>
          <p className="phn-bm-kildetekst">Fra bookingene dine · {data.samtaler} {data.samtaler === 1 ? "samtale" : "samtaler"} med {fornavn} i appen</p>
        </section>
        {data.kreverFull && <div className="phn-k-vilkaar">
          <b><Lock className="phn-ikon" aria-hidden style={{ width: 16, height: 16, verticalAlign: "-3px", marginRight: 6 }} />Booking krever nivået Full</b>
          <span>Med Full kan du bruke klippene dine og booke timer hos {fornavn}. <Link href="/portal/meg/abonnement">Se abonnement</Link></span>
        </div>}
        {data.tjenester.length > 0
          ? <section className="phn-seksjon">
              <div className="phn-sek-topp"><h2>Velg type økt</h2></div>
              <div className="phn-bm-tjenester" role="group" aria-label="Type økt">
                {data.tjenester.map((t) => <button key={t.id} type="button" className="phn-bm-tjeneste" aria-pressed={valgt === t.id} onClick={() => setValgt(t.id)}>
                  <b>{t.navn}</b><span className="phn-bm-pris">{t.pris}</span>
                  <span className="phn-kilde">{t.varighetMin} min{t.beskrivelse ? ` · ${t.beskrivelse}` : ""}</span>
                </button>)}
              </div>
            </section>
          : <section className="phn-kort" style={{ background: "var(--phn-sand-100)" }}>
              <b className="phn-bm-undertittel">{fornavn} har ingen bookbare tjenester nå</b>
              <p className="phn-forklar">Skriv til {fornavn} for å avtale en time.</p>
            </section>}
      </div>
      <aside>
        <div className="phn-k-vilkaar"><b>Gratis avbestilling inntil {data.avbestillingTimer} timer før</b><span>Du kan flytte timen selv til en ledig tid innenfor {/[sxz]$/i.test(fornavn) ? `${fornavn}'` : `${fornavn}s`} tilgjengelighet.</span></div>
        <div className="phn-bm-festet phn-bm-knapper">
          {data.tjenester.length > 0 && <Link href={bookHref} className="phn-knapp pri phn-k-stor">Velg tid</Link>}
          <Link href={MELDING} className={`phn-knapp ${data.tjenester.length > 0 ? "sek" : "pri phn-k-stor"}`}><MessageSquare className="phn-ikon" aria-hidden />{data.tjenester.length > 0 ? "Send melding i stedet" : "Send melding"}</Link>
        </div>
      </aside>
    </div>
  </SkraFlyt></div>;
}
