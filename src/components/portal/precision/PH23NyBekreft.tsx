"use client";

/**
 * PH-23 Bekreft booking (/portal/booking/ny/bekreft) — nytt design (pakke 11).
 * Fasit: docs/design-system/utkast-playerhq/kommunikasjon.html, malene «ny» (oppsummering) og «bekreftet».
 * Stil: src/styles/playerhq-ny.css og src/styles/playerhq-ny-kommunikasjon.css.
 *
 * Samme innsending som før: klipp går til createCreditBooking (atomisk trekk) og videre til
 * /portal/booking/bekreftet, kort går til opprettBookingMedKort og Stripe Checkout. Siden eier
 * spørringene og ledig-sjekken (isSlotStillAvailable).
 *
 * Avvik:
 *   - Utkastet har ikke eget bekreft-steg: Book time bekrefter i samme visning. Siden finnes fordi
 *     eldre lenker (booking-hub, e-post) går hit med valgt tid, og vises som oppsummeringen «Din booking».
 *   - Notat til coachen er med (som før). Utkastet har ikke feltet.
 */
import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createCreditBooking } from "@/lib/booking/credit-booking";
import { opprettBookingMedKort } from "@/app/portal/booking/actions";
import type { BookingBekreftData } from "@/lib/portal-booking/bekreft-typer";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-kommunikasjon.css";

export function PH23NyBekreft({ data, avbestillingTimer }: { data: BookingBekreftData; avbestillingTimer: number }) {
  const { bekreftetBase = "/portal/booking/bekreftet", modus, serviceTypeId, coachId, startIso, backHref, ledig, rader, creditsRemaining, saldoEtter } = data;
  const erBetaling = modus === "betaling";
  const router = useRouter();
  const [notat, setNotat] = useState("");
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  function send(e: FormEvent) {
    e.preventDefault();
    setFeil(null);
    startTransition(async () => {
      try {
        if (erBetaling) {
          const res = await opprettBookingMedKort({ serviceTypeId, coachId, startIso, notes: notat.trim() || undefined });
          if (!res.ok) { setFeil(res.grunn); return; }
          window.location.href = res.url;
          return;
        }
        const res = await createCreditBooking({ serviceTypeId, coachId, start: startIso, notes: notat.trim() || undefined });
        router.push(`${bekreftetBase}?bookingId=${res.bookingId}`);
      } catch (err) {
        setFeil(err instanceof Error ? err.message : "Prøv igjen.");
      }
    });
  }

  return <div className="phn">
    <div className="phn-k-smal">
      <div className="phn-k-topp">
        <Link href={backHref} className="phn-k-tilbake"><ChevronLeft className="phn-ikon" aria-hidden />Velg annen tid</Link>
        <div><div className="phn-dato">Booking · ny time</div><h1 className="phn-tittel">Bekreft booking</h1></div>
      </div>
      {!ledig && <p className="phn-k-feil" role="alert">Tiden er ikke ledig lenger. Gå tilbake og velg en annen tid.</p>}
      <div className="phn-kort">
        <b className="phn-k-undertittel">Din booking</b>
        <ul className="phn-k-oppsummering">
          {rader.map((r) => <li key={r.label}><span>{r.label}</span><b>{r.verdi || "—"}</b></li>)}
          {!erBetaling && <li><span>Klipp</span><b>{creditsRemaining} → {Math.max(0, saldoEtter)} igjen</b></li>}
        </ul>
        <div className="phn-k-vilkaar"><b>Gratis avbestilling inntil {avbestillingTimer} timer før</b>
          <span>{erBetaling ? "Du betaler med kort før timen, i en sikker betaling." : "Etter det trekkes klippet."}</span></div>
      </div>
      {ledig && <form className="phn-seksjon" onSubmit={send}>
        <label className="phn-felt"><span>Notat til coachen (valgfritt)</span>
          <textarea rows={3} value={notat} onChange={(e) => setNotat(e.target.value)} placeholder="Hva vil du jobbe med?" />
        </label>
        {feil && <p className="phn-k-feil" role="alert">Timen ble ikke booket: {feil}</p>}
        <div className="phn-k-festet">
          <button type="submit" className="phn-knapp pri phn-k-stor" disabled={pending}>
            {pending ? (erBetaling ? "Åpner betaling …" : "Booker …") : erBetaling ? "Gå til betaling" : "Bekreft booking"}
          </button>
        </div>
      </form>}
    </div>
  </div>;
}
