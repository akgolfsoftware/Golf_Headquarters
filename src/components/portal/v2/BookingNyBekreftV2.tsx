"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * BookingNyBekreftV2 — v2-port (retning C) av /portal/booking/ny/bekreft.
 * RESTYLING ONLY: samme innsending som legacy bekreft-form.tsx — kaller
 * `createCreditBooking` (atomisk credit-dekrement + kollisjonsvern i
 * src/lib/booking/credit-booking.ts) via useTransition med NØYAKTIG samme
 * argumenter, og redirecter til /portal/booking/bekreftet?bookingId= som før.
 * Server-pagen eier alle queries/guards og ledig-sjekken (isSlotStillAvailable).
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Caps, Tittel, Kort, Knapp, TekstOmraade, Icon } from "@/components/v2";
import { createCreditBooking } from "@/lib/booking/credit-booking";
import { opprettBookingMedKort } from "@/app/portal/booking/actions";
import { PolicyBanner } from "@/components/booking/PolicyBanner";

/* ── Datakontrakt (alt serialiserbart — server-pagen eier queries/format) ── */

export type BekreftRad = { label: string; verdi: string };

export type BookingNyBekreftV2Data = {
  /** «credits» = trekk fra forhåndsbetalte timer. «betaling» = kort via Stripe Checkout. */
  modus: "credits" | "betaling";
  /** Pris i øre — vises kun i betaling-modus. */
  prisOre: number;
  serviceTypeId: string;
  coachId: string;
  /** startAt.toISOString() — sendes UENDRET til createCreditBooking. */
  startIso: string;
  /** Tilbake til wizarden med samme service/dato (samme href som legacy). */
  backHref: string;
  /** Slot fortsatt ledig (isSlotStillAvailable — sjekket på serveren). */
  ledig: boolean;
  rader: BekreftRad[];
  creditsRemaining: number;
  saldoEtter: number;
};

function FeilBoks({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "10px 12px", borderRadius: 12, background: `color-mix(in srgb, ${TL.danger} 10%, transparent)`, border: `1px solid ${TL.danger}` }}>
      <Icon name="alert-triangle" size={13} style={{ color: TL.danger, flex: "none", marginTop: 1 }} />
      <span style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, lineHeight: 1.5 }}>{children}</span>
    </div>
  );
}

export function BookingNyBekreftV2({ data }: { data: BookingNyBekreftV2Data }) {
  const { modus, prisOre, serviceTypeId, coachId, startIso, backHref, ledig, rader, creditsRemaining, saldoEtter } = data;
  const erBetaling = modus === "betaling";
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
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
        });
        router.push(`/portal/booking/bekreftet?bookingId=${result.bookingId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Noe gikk galt.");
      }
    });
  }

  return (
    <div data-paper-portal-booking-ny-bekreft style={{ width: "100%", maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Hode */}
      <div>
        <Caps>PlayerHQ · Book ny time</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="booking.">Bekreft</Tittel>
        </div>
      </div>

      {!ledig && (
        <FeilBoks>Tiden ble dessverre booket av noen andre. Gå tilbake og velg en annen tid.</FeilBoks>
      )}

      {/* Oppsummering */}
      <Kort eyebrow="Oppsummering">
        <div style={{ display: "flex", flexDirection: "column" }}>
          {rader.map((rad, i) => (
            <div key={rad.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i === rader.length - 1 ? "none" : `1px solid ${TL.hair}` }}>
              <span style={{ width: 84, flex: "none", fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, color: TL.mute }}>
                {rad.label}
              </span>
              <span style={{ fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 600, color: TL.text }}>{rad.verdi}</span>
            </div>
          ))}
        </div>
      </Kort>

      {/* Betaling — credits: saldo før → etter. Kort: pris + Stripe-info. */}
      <Kort tint eyebrow="Betaling">
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: TL.radius.row, background: TL.dock, border: `1px solid ${TL.hair}` }}>
          <span style={{ width: 32, height: 32, flex: "none", borderRadius: 9999, background: TL.fill, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="credit-card" size={15} style={{ color: TL.onFill }} />
          </span>
          <span style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.text }}>
            {erBetaling ? "Betales med kort (Stripe)" : "Trekkes fra forhåndsbetalte timer"}
          </span>
          <span style={{ marginLeft: "auto", fontFamily: TL.font.mono, fontSize: 11.5, fontWeight: 700, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>
            {erBetaling ? `${prisOre / 100} kr` : `${creditsRemaining} → ${saldoEtter}`}
          </span>
        </div>
      </Kort>

      {/* Notater + bekreft-knapper */}
      {ledig && (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Kort>
            <TekstOmraade
              label="Notater til coachen (valgfritt)"
              value={notes}
              onChange={setNotes}
              rows={3}
              placeholder="Hva vil du jobbe med? Spesielle ønsker?"
            />
          </Kort>

          {error && <FeilBoks>{error}</FeilBoks>}

          <Knapp type="submit" icon={erBetaling ? "credit-card" : "check"} full disabled={pending} style={{ minHeight: 46 }}>
            {pending
              ? erBetaling ? "Åpner betaling …" : "Bekrefter …"
              : erBetaling ? "Til betaling" : "Bekreft booking"}
          </Knapp>

          <Link href={backHref} style={{ textDecoration: "none" }}>
            <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 48, width: "100%", padding: "10px 16px",
            borderRadius: 10, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600,
          }}>Endre valg</span>
          </Link>
        </form>
      )}

      <PolicyBanner variant="cancel" />
      <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: TL.font.mono, fontSize: 10, color: TL.mute, margin: 0 }}>
        <Icon name="shield" size={12} style={{ color: TL.mute }} />
        Gratis avbestilling inntil 24 timer før
      </p>
    </div>
  );
}
