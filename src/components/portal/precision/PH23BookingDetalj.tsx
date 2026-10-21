"use client";

/**
 * PH-23 Bookingen (/portal/booking/[bookingId]) — nytt design (pakke 11).
 * Fasit: docs/design-system/utkast-playerhq/kommunikasjon.html, mal «detalj» (godkjent 14.10.2026).
 *
 * Samme handlinger som før: «Flytt time» åpner flyttesiden (bare ledige tider innenfor coachens
 * tilgjengelighet, rescheduleBooking), «Avbestill» går til cancelBooking, og coachens forslag om ny
 * tid godtas eller avslås med godtaFlytteforslag / avslaaFlytteforslag. Siden eier eierskapssjekken.
 *
 * Avvik:
 *   - Raden «Tema» er ikke med: bookingen har ikke tema fra teknisk plan.
 *   - Raden «Betaling» viser klipp, kort eller «—» ut fra bookingen, ikke pakkenavnet.
 *   - Avbestillingsfristen står som regel («inntil 24 timer før»), ikke som dato.
 *   - «Flytt time» åpner egen side i stedet for et ark (samme flyt som lenkene fra e-post).
 *   - Alle bookinger har samme bilde (simulator). Bildet per sted er ikke avklart.
 */
import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { SkraFlyt, SkraKort, SkraTopp } from "@/components/precision/skra/Skra";
import { cancelBooking } from "@/app/portal/meg/bookinger/actions";
import { avslaaFlytteforslag, godtaFlytteforslag } from "@/app/portal/booking/[bookingId]/actions";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-kommunikasjon.css";
import "@/styles/playerhq-ny-lister-skra.css";

export type PH23BookingDetaljData = {
  bookingId: string;
  tjeneste: string;
  status: "Bekreftet" | "Venter på betaling" | "Avbestilt" | "Gjennomført" | "Uteblitt";
  /** «Fredag 9. oktober» (Oslo). */
  dag: string;
  /** «16:00» */
  klokkeslett: string;
  /** «16:00–17:30» */
  tid: string;
  varighetMin: number;
  sted: string | null;
  stedId: string | null;
  coachNavn: string | null;
  coachId: string | null;
  betaling: string | null;
  notat: string | null;
  kanAvbestille: boolean;
  kanFlytte: boolean;
  kanFaaRefusjon: boolean;
  avbestillingTimer: number;
  /** Coachens forslag om ny tid, «mandag 5. oktober kl. 17:00». */
  flytteforslag: string | null;
};

const pille = (s: PH23BookingDetaljData["status"]) => (s === "Bekreftet" || s === "Gjennomført" ? "ok" : s === "Avbestilt" || s === "Uteblitt" ? "noy" : "vent");

export function PH23BookingDetalj({ data }: { data: PH23BookingDetaljData }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [avbApen, setAvbApen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const coachFornavn = data.coachNavn?.split(" ")[0] ?? "coachen";

  useEffect(() => { if (avbApen) dialog.current?.showModal(); else dialog.current?.close(); }, [avbApen]);

  const avbestill = () => start(async () => {
    setFeil(null);
    try {
      await cancelBooking(data.bookingId);
      setAvbApen(false);
      setToast("Timen er avbestilt. Detaljer om klipp og refusjon kommer på e-post.");
      router.refresh();
    } catch (err) {
      setFeil(`Timen ble ikke avbestilt: ${err instanceof Error ? err.message : "prøv igjen senere"}.`);
      setAvbApen(false);
    }
  });

  const svarForslag = (fn: (id: string) => Promise<{ ok: true } | { ok: false; feil: string }>, kvittering: string) => start(async () => {
    setFeil(null);
    try {
      const res = await fn(data.bookingId);
      if (!res.ok) { setFeil(res.feil); return; }
      setToast(kvittering);
      router.refresh();
    } catch { setFeil("Svaret kunne ikke lagres. Prøv igjen."); }
  });

  return <div className="phn phn-skra">
    <SkraTopp
      lav
      etikett="Booking"
      bilde="/images/playerhq/slag-simulator.jpg" bildePosisjon="50% 50%"
      overlinje="Booking"
      tittel={`${data.tjeneste}${data.coachNavn ? ` med ${coachFornavn}` : ""}`}
      handling={<span className="skra-tilbake"><Link href="/portal/meg/bookinger" className="phn-k-tilbake"><ChevronLeft className="phn-ikon" aria-hidden />Bookinger</Link></span>}
    />
    <SkraFlyt lav>
    <div className="phn-k-skra-grid">
      <div>
      <div className="phn-k-booking-helt">
        <div className="phn-k-bt">
          <span className={`phn-pille ${pille(data.status)}`}>{data.status}</span>
          <span className="phn-k-bt-dag">{data.dag}</span>
          <span className="phn-k-bt-tid">{data.klokkeslett}<small>{data.varighetMin} min</small></span>
          <span className="phn-k-info"><span>{data.sted ?? "—"}</span><span>{data.betaling ?? "—"}</span></span>
        </div>
      </div>
      {data.flytteforslag && <section className="phn-k-forslagskort" aria-label="Coachen foreslår ny tid">
        <div className="phn-k-fk-topp"><b>{data.coachNavn ?? "Coachen"} foreslår ny tid</b><span className="phn-pille vent">Venter på deg</span></div>
        <div className="phn-k-fra-til">
          <div className="phn-okt phn-k-mini gml" style={{ background: "var(--phn-g800)" }}><div className="phn-okt-tekst"><span className="phn-k-okt-tid">{data.klokkeslett}</span><span className="phn-navn">{data.dag}</span></div></div>
          <ArrowRight className="phn-ikon phn-k-pil" aria-label="blir" />
          <div className="phn-okt phn-k-mini" style={{ background: "var(--phn-g900)" }}><div className="phn-okt-tekst"><span className="phn-navn">{data.flytteforslag}</span></div></div>
        </div>
        <p className="phn-k-kildetekst">Timen står på den gamle tiden til du svarer.</p>
        <div className="phn-knapper">
          <button type="button" className="phn-knapp pri" disabled={pending} onClick={() => svarForslag(godtaFlytteforslag, "Timen er flyttet til den nye tiden.")}>Godta ny tid</button>
          <button type="button" className="phn-knapp sek" disabled={pending} onClick={() => svarForslag(avslaaFlytteforslag, `Forslaget er avslått. ${coachFornavn} får beskjed.`)}>Avslå</button>
        </div>
      </section>}

      </div>
      <div>
      <SkraKort etikett="Oppsummering" tittel="Om timen">
      <ul className="phn-k-oppsummering">
        <li><span>Coach</span><b>{data.coachNavn && data.coachId ? <Link href={`/portal/booking/coach/${data.coachId}`} style={{ color: "inherit" }}>{data.coachNavn}</Link> : data.coachNavn ?? "—"}</b></li>
        <li><span>Sted</span><b>{data.sted && data.stedId ? <Link href={`/portal/booking/anlegg/${data.stedId}`} style={{ color: "inherit" }}>{data.sted}</Link> : data.sted ?? "—"}</b></li>
        <li><span>Tid</span><b>{data.tid}</b></li>
        <li><span>Betaling</span><b>{data.betaling ?? "—"}</b></li>
        <li><span>Avbestilling</span><b>Gratis inntil {data.avbestillingTimer} timer før</b></li>
        {data.notat && <li><span>Notat</span><b style={{ fontWeight: 400, whiteSpace: "pre-line" }}>{data.notat}</b></li>}
      </ul>
      </SkraKort>

      {feil && <p className="phn-k-feil" role="alert">{feil}</p>}

      {(data.kanFlytte || data.kanAvbestille) && <div className="phn-knapper">
        {data.kanFlytte && <Link href={`/portal/meg/bookinger/reschedule/${data.bookingId}`} className="phn-knapp pri">Flytt time</Link>}
        {data.kanAvbestille && <button type="button" className="phn-knapp sek" onClick={() => setAvbApen(true)}>Avbestill</button>}
        <Link href="/portal/coach/melding" className="phn-knapp sek">Skriv til {coachFornavn}</Link>
      </div>}
      </div>
    </div>
    </SkraFlyt>

    <dialog ref={dialog} className="phn-k-dialog" role="alertdialog" aria-labelledby="ph23d-avb" aria-describedby="ph23d-avb-tekst" onClose={() => setAvbApen(false)}>
      {avbApen && <div className="phn-k-dialog-kropp">
        <h2 id="ph23d-avb">Avbestille timen {data.dag.toLowerCase()} kl. {data.klokkeslett}?</h2>
        <p className="phn-forklar" id="ph23d-avb-tekst">
          {data.kanFaaRefusjon
            ? `Du avbestiller mer enn ${data.avbestillingTimer} timer før, så klippet eller betalingen kommer tilbake. ${coachFornavn} får beskjed.`
            : `Det er mindre enn ${data.avbestillingTimer} timer til timen. Klipp eller betaling kommer ikke tilbake.`}
        </p>
        <div className="phn-k-vilkaar"><b>{data.tjeneste}</b><span>{data.sted ?? "—"} · {data.betaling ?? "—"}</span></div>
        <div className="phn-k-knapper-stablet">
          <button type="button" className="phn-knapp rust phn-k-stor" disabled={pending} onClick={avbestill}>{pending ? "Avbestiller …" : "Avbestill timen"}</button>
          <button type="button" className="phn-knapp sek phn-k-stor" onClick={() => setAvbApen(false)}>Behold timen</button>
        </div>
      </div>}
    </dialog>
    {toast && <div className="phn-k-toast" role="status">{toast}</div>}
  </div>;
}
