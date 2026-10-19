"use client";

/**
 * FO-03 Bekreft booking for barnet (/forelder/bookinger/ny/[barnId]/bekreft) — Precision Athletics.
 * Fasit: docs/design-system/utkast-flater/forelder.html, mal «booking», steg 4 «Bekreft».
 * Stil: src/styles/flater-ny-forelder-booking.css.
 *
 * Samme innsending som BookingNyBekreftV2: klipp går til createCreditBooking med barnId (trekker
 * barnets klipp atomisk) og videre til bekreftetBase. Kort går til opprettBookingMedKort med barnId
 * og retur til /forelder/bookinger, og videre til Stripe Checkout (kort eller Apple Pay).
 * Begge handlingene sjekker forelder–barn-koblingen på nytt før noe lagres.
 *
 * Avvik:
 *   - Bekreft er egen side (sjekker at tiden fortsatt er ledig). Utkastet har steget på samme flate.
 *   - Notat til coachen er med (som før). Utkastet har ikke feltet.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs FO-03.
 */
import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createCreditBooking } from "@/lib/booking/credit-booking";
import { opprettBookingMedKort } from "@/app/portal/booking/actions";
import type { BookingBekreftData } from "@/lib/portal-booking/bekreft-typer";
import { Knapp, KnappLenke } from "@/components/precision/pa";
import "@/styles/flater-ny-forelder-booking.css";

export function FO03BookingBekreft({ data, barnNavn, avbestillingTimer }: { data: BookingBekreftData; barnNavn: string; avbestillingTimer: number }) {
  const { barnId, bekreftetBase = "/forelder/bookinger/bekreftet", modus, serviceTypeId, coachId, startIso, backHref, ledig, rader, creditsRemaining, saldoEtter } = data;
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
          const res = await opprettBookingMedKort({
            serviceTypeId,
            coachId,
            startIso,
            notes: notat.trim() || undefined,
            barnId,
            retururlBase: barnId ? "/forelder/bookinger" : undefined,
          });
          if (!res.ok) { setFeil(res.grunn); return; }
          window.location.href = res.url;
          return;
        }
        const res = await createCreditBooking({ serviceTypeId, coachId, start: startIso, notes: notat.trim() || undefined, barnId });
        router.push(`${bekreftetBase}?bookingId=${res.bookingId}`);
      } catch (err) {
        setFeil(err instanceof Error ? err.message : "Prøv igjen.");
      }
    });
  }

  // «Betaling»-raden fra loaderen sier «Kort · pris». Skjermen sier hva forelderen kan bruke.
  const visteRader = rader.map((r) =>
    r.label === "Betaling" && erBetaling ? { ...r, verdi: r.verdi.replace(/^Kort/, "Kort eller Apple Pay") } : r,
  );

  return (
    <div className="fob">
      <Link href={backHref} className="fob-tilbake"><ChevronLeft aria-hidden />Velg annen tid</Link>
      <header className="fob-hode">
        <p className="fob-kicker">Forelder · booking</p>
        <h1>Bekreft timen</h1>
        <div className="fob-steglinje" aria-label="Steg 3 av 3"><i data-ja="true" /><i data-ja="true" /><i data-ja="true" /></div>
      </header>

      {!ledig && <p className="fob-feil" role="alert">Tiden er ikke ledig lenger. Gå tilbake og velg en annen tid.</p>}

      <section className="fob-seksjon">
        <div className="fob-oppsummering">
          <dl className="fob-dl">
            <div><dt>Spiller</dt><dd>{barnNavn}</dd></div>
            {visteRader.map((r) => <div key={r.label}><dt>{r.label}</dt><dd>{r.verdi || "—"}</dd></div>)}
            {!erBetaling && <div><dt>Klipp</dt><dd data-mono="true">{creditsRemaining} → {Math.max(0, saldoEtter)} igjen</dd></div>}
          </dl>
          <p className="fob-note">
            Gratis avbestilling inntil {avbestillingTimer} timer før.{" "}
            {erBetaling ? "Du betaler med kort eller Apple Pay i en sikker betaling hos Stripe." : "Etter det trekkes klippet."}
          </p>
        </div>
      </section>

      {ledig ? (
        <form className="fob-seksjon" onSubmit={send}>
          <label className="fob-felt">
            <span>Notat til coachen (valgfritt)</span>
            <textarea rows={3} value={notat} onChange={(e) => setNotat(e.target.value)} placeholder="Hva vil dere jobbe med?" />
          </label>
          {feil && <p className="fob-feil" role="alert">Timen ble ikke booket: {feil}</p>}
          <Knapp type="submit" size="lg" fullWidth loading={pending} loadingText={erBetaling ? "Åpner betaling …" : "Booker …"}>
            {erBetaling ? "Gå til betaling" : "Book time"}
          </Knapp>
        </form>
      ) : (
        <KnappLenke href={backHref} variant="secondary" size="lg" fullWidth>Velg annen tid</KnappLenke>
      )}
    </div>
  );
}
