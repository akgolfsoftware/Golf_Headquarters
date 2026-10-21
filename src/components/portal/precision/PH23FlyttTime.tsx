"use client";

/**
 * PH-23 Flytt time (/portal/meg/bookinger/reschedule/[bookingId]) — nytt design (pakke 11).
 * Fasit: docs/design-system/utkast-playerhq/kommunikasjon.html, arket «Flytt time» i malen «detalj».
 *
 * Samme handling som før: rescheduleBooking (24-timersregelen, ledighetssjekk, kalender og e-post
 * på serveren). Spilleren ser bare ledige tider innenfor coachens tilgjengelighet (vedtak 14.10).
 *
 * Avvik:
 *   - Flyttingen er en egen side, ikke et ark: lenkene fra e-post og «Mine bookinger» går hit.
 *   - Avbestill ligger på bookingen (/portal/booking/[id]), ikke her.
 */
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import { rescheduleBooking } from "@/app/portal/meg/bookinger/actions";
import { slotNokkel, type PH23SlotDetalj } from "@/lib/portal-booking/ph23-booking-data";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-kommunikasjon.css";
import "@/styles/playerhq-ny-lister-skra.css";

export type PH23FlyttTimeData = {
  bookingId: string;
  tjeneste: string;
  varighetMin: number;
  sted: string | null;
  /** «Fredag 9. oktober» */
  naaDag: string;
  naaKl: string;
  coachNavn: string | null;
  avbestillingTimer: number;
  days: [string, string][];
  slots: Record<number, string[]>;
  slotDetails: Record<string, PH23SlotDetalj>;
};

export function PH23FlyttTime({ data, tilbakeHref }: { data: PH23FlyttTimeData; tilbakeHref: string }) {
  const router = useRouter();
  const [dag, setDag] = useState(() => Math.max(0, data.days.findIndex((_, i) => (data.slots[i] ?? []).length > 0)));
  const [kl, setKl] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const coachFornavn = data.coachNavn?.split(" ")[0] ?? "coachen";
  const tider = data.slots[dag] ?? [];
  const valgt = kl ? data.slotDetails[slotNokkel(dag, kl)] : undefined;

  const flytt = () => {
    if (!valgt) return;
    setFeil(null);
    start(async () => {
      try {
        await rescheduleBooking({ bookingId: data.bookingId, newStartIso: valgt.startIso, newCoachId: valgt.coachId });
        router.push("/portal/meg/bookinger?ny=1");
      } catch (err) {
        setFeil(err instanceof Error ? err.message : "Prøv igjen senere.");
      }
    });
  };

  return <div className="phn phn-skra">
    <SkraTopp
      lav
      etikett="Flytt time"
      bilde="/images/playerhq/slag-simulator.jpg" bildePosisjon="50% 50%"
      overlinje="Booking · flytt time"
      tittel={`Flytt ${data.tjeneste}`}
      handling={<span className="skra-tilbake"><Link href={tilbakeHref} className="phn-k-tilbake"><ChevronLeft className="phn-ikon" aria-hidden />Bookingen</Link></span>}
    />
    <SkraFlyt lav>
    <div className="phn-k-skra-grid">
      <div>
      <p className="phn-forklar">Ledige tider hos {coachFornavn}. Du ser bare tider {coachFornavn} har åpnet for booking, og kan flytte fram til {data.avbestillingTimer} timer før timen.</p>

      <section className="phn-seksjon">
        <div className="phn-sek-topp"><h2>Dag</h2><span className="phn-kilde">Prikk = ledig tid</span></div>
        {data.days.length === 0 ? <p className="phn-forklar">Ingen ledige tider de neste to ukene. Skriv til {coachFornavn} for å finne en tid.</p>
          : <div className="phn-k-dager" role="group" aria-label="Ny dag">
            {data.days.map(([d, dt], i) => {
              const ant = (data.slots[i] ?? []).length;
              return <button key={dt} type="button" aria-pressed={i === dag} disabled={!ant} aria-label={`${d} ${dt}${ant ? `, ${ant} ledige` : ", ingen ledige tider"}`}
                onClick={() => { setDag(i); setKl(null); }}>{d}<b>{dt.slice(0, 2)}</b><i /></button>;
            })}
          </div>}
      </section>

      {data.days.length > 0 && <section className="phn-seksjon">
        <div className="phn-sek-topp"><h2>Tid</h2><span className="phn-kilde">{tider.length} ledige · {data.varighetMin} min</span></div>
        {tider.length ? <div className="phn-k-tider" role="group" aria-label="Ny tid">
          {tider.map((t) => <button key={t} type="button" aria-pressed={kl === t} onClick={() => setKl(t)}>{t}</button>)}
        </div> : <p className="phn-forklar">Ingen ledige tider denne dagen. Velg en annen dag.</p>}
      </section>}
      </div>
      <div>
      <div className="phn-k-fra-til">
        <div className="phn-okt phn-k-mini gml" style={{ background: "var(--phn-g800)" }}><div className="phn-okt-tekst"><span className="phn-k-okt-tid">{data.naaKl}</span><span className="phn-navn">{data.naaDag}</span></div></div>
        <ArrowRight className="phn-ikon phn-k-pil" aria-label="blir" />
        <div className="phn-okt phn-k-mini" style={{ background: "var(--phn-g900)" }}><div className="phn-okt-tekst"><span className="phn-k-okt-tid">{kl ?? "—"}</span><span className="phn-navn">{kl ? data.days[dag]?.join(" ") : "Velg ny tid"}</span></div></div>
      </div>
      <p className="phn-k-kildetekst">{coachFornavn.charAt(0).toUpperCase() + coachFornavn.slice(1)} får beskjed om den nye tiden. Ingen klipp trekkes for flyttingen.</p>
      {feil && <p className="phn-k-feil" role="alert">Timen ble ikke flyttet: {feil}</p>}
      <div className="phn-k-festet">
        <button type="button" className="phn-knapp pri phn-k-stor" disabled={!valgt || pending} onClick={flytt}>{pending ? "Flytter …" : "Flytt til ny tid"}</button>
      </div>
      </div>
    </div>
    </SkraFlyt>
  </div>;
}
