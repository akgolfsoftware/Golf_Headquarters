"use client";

/**
 * Bekreft-skjema for spillerens booking.
 * Samme innsending: createCreditBooking eller opprettBookingMedKort.
 */

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Knapp } from "@/components/precision/pa";
import { createCreditBooking } from "@/lib/booking/credit-booking";
import { opprettBookingMedKort } from "@/app/portal/booking/actions";
import { policyBannerTexts } from "@/lib/booking/policy";
import type { BookingNyBekreftV2Data } from "@/components/portal/v2/BookingNyBekreftV2";

export function BookingNyBekreftInnhold({ data }: { data: BookingNyBekreftV2Data }) {
  const {
    barnId,
    bekreftetBase = "/portal/booking/bekreftet",
    merkelapp = "PlayerHQ",
    modus,
    prisOre,
    serviceTypeId,
    coachId,
    startIso,
    backHref,
    ledig,
    rader,
    creditsRemaining,
    saldoEtter,
  } = data;
  const erBetaling = modus === "betaling";
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const policy = policyBannerTexts();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        if (erBetaling) {
          // Kortbetaling: PENDING-booking + Stripe Checkout (webhooken
          // bekrefter). Eneste hopp ut er selve betalingssiden hos Stripe —
          // success/cancel lander tilbake på /portal/booking.
          const res = await opprettBookingMedKort({
            serviceTypeId,
            coachId,
            startIso,
            notes: notes.trim() || undefined,
            barnId,
            retururlBase: barnId ? "/forelder/bookinger" : undefined,
          });
          if (!res.ok) {
            setError(res.grunn);
            return;
          }
          window.location.href = res.url;
          return;
        }
        const result = await createCreditBooking({
          serviceTypeId,
          coachId,
          start: startIso,
          notes: notes.trim() || undefined,
          barnId,
        });
        router.push(`${bekreftetBase}?bookingId=${result.bookingId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Noe gikk galt.");
      }
    });
  }

  return (
    <div className="ph-flate">
      <Link href={backHref} className="ph-tilbake">Velg annen tid</Link>
      <header>
        <p>{merkelapp} · Book ny time</p>
        <h1>Bekreft booking</h1>
      </header>

      {!ledig && (
        <p role="alert">Tiden ble dessverre booket av noen andre. Gå tilbake og velg en annen tid.</p>
      )}

      <div className="ph-kpi">
        <p className="pa-card">
          <span>{erBetaling ? "Pris" : "Timer nå"}</span>
          <strong>{erBetaling ? `${prisOre / 100} kr` : creditsRemaining}</strong>
        </p>
        <p className="pa-card">
          <span>{erBetaling ? "Betaling" : "Etter booking"}</span>
          <strong>{erBetaling ? `${prisOre / 100} kr` : saldoEtter}</strong>
        </p>
      </div>

      <section className="pa-card ph-kort">
        <p>Oppsummering</p>
        <dl>
          {rader.map((rad) => (
            <div key={rad.label}>
              <dt>{rad.label}</dt>
              <dd>{rad.verdi}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="pa-card ph-kort">
        <p>Betaling</p>
        <dl>
          <div>
            <dt>{erBetaling ? "Betales med kort (Stripe)" : "Trekkes fra forhåndsbetalte timer"}</dt>
            <dd>{erBetaling ? `${prisOre / 100} kr` : `${creditsRemaining} → ${saldoEtter}`}</dd>
          </div>
        </dl>
      </section>

      {ledig && (
        <form className="ph-skjema" onSubmit={handleSubmit}>
          <label>
            Notater til coachen (valgfritt)
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Hva vil du jobbe med? Spesielle ønsker?"
            />
          </label>

          {error && <p role="alert">{error}</p>}

          <Knapp
            type="submit"
            variant="primary"
            fullWidth
            disabled={pending}
            loading={pending}
            loadingText={erBetaling ? "Åpner betaling …" : "Bekrefter …"}
          >
            {erBetaling ? "Til betaling" : "Bekreft booking"}
          </Knapp>

          <Link href={backHref} className="pa-btn pa-btn--secondary pa-btn--full">
            Endre valg
          </Link>
        </form>
      )}

      <section className="pa-card ph-kort">
        <p>Avbestilling</p>
        <p>{policy.cancel}</p>
        <p>Under 24 timer: avbestilling tillatt uten kredit/refusjon (unntak coach/admin).</p>
        <p>Gratis avbestilling inntil 24 timer før</p>
      </section>
    </div>
  );
}
