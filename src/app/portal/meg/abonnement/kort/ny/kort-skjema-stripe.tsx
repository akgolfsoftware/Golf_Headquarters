"use client";

/**
 * Innebygd kortoppdatering med Stripe Elements — PORTPLAN A1.7 (avgjort av
 * Anders 02.09.2026: ny avhengighet godkjent, erstatter Billing Portal for
 * denne ene handlingen). Andre billing-oppgaver (fakturaer, oppsigelse)
 * rører vi ikke — de har egne, allerede fungerende flyter.
 *
 * To API-kall: /api/stripe/setup-intent oppretter en SetupIntent for
 * kunden, /api/stripe/setup-intent/bekreft setter det ferdig bekreftede
 * kortet som standard betalingsmåte (kunde + alle aktive abonnement) —
 * samme effekt som portalen ga.
 */

import { type FormEvent, useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Knapp, Icon } from "@/components/v2";
import { TL } from "@/lib/v2/train-lock";

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = PUBLISHABLE_KEY ? loadStripe(PUBLISHABLE_KEY) : null;

function FeilBoks({ feil }: { feil: string }) {
  return (
    <div
      role="alert"
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        borderRadius: TL.radius.row,
        border: `1px solid color-mix(in srgb, ${TL.danger} 30%, transparent)`,
        background: `color-mix(in srgb, ${TL.danger} 10%, ${TL.elev})`,
        padding: 12,
      }}
    >
      <Icon name="triangle-alert" size={14} style={{ color: TL.danger, marginTop: 2, flex: "none" }} />
      <span style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.text, lineHeight: 1.45 }}>{feil}</span>
    </div>
  );
}

function KortSkjemaInnhold() {
  const stripe = useStripe();
  const elements = useElements();
  const [pending, setPending] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [lagret, setLagret] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPending(true);
    setFeil(null);

    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setFeil(error.message ?? "Kunne ikke lagre kortet.");
      setPending(false);
      return;
    }
    if (setupIntent?.status !== "succeeded") {
      setFeil("Kortet ble ikke bekreftet. Prøv igjen.");
      setPending(false);
      return;
    }

    try {
      const res = await fetch("/api/stripe/setup-intent/bekreft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setupIntentId: setupIntent.id }),
      });
      if (!res.ok) {
        throw new Error("Kortet ble lagret hos Stripe, men kunne ikke settes som standard. Prøv igjen.");
      }
      setLagret(true);
    } catch (err) {
      setFeil(err instanceof Error ? err.message : "Ukjent feil ved lagring.");
    } finally {
      setPending(false);
    }
  }

  if (lagret) {
    return (
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          borderRadius: TL.radius.row,
          border: `1px solid ${TL.hair}`,
          background: TL.dock,
          padding: 12,
        }}
      >
        <Icon name="check" size={14} style={{ color: TL.ok, marginTop: 2, flex: "none" }} />
        <span style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.text, lineHeight: 1.45 }}>
          Kortet er lagret og satt som standard.
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <PaymentElement options={{ layout: "tabs" }} />
      {feil && <FeilBoks feil={feil} />}
      <Knapp full icon="check" type="submit" disabled={!stripe || pending}>
        {pending ? "Lagrer …" : "Lagre kort"}
      </Knapp>
    </form>
  );
}

export function KortSkjemaStripe() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);

  useEffect(() => {
    let avbrutt = false;
    fetch("/api/stripe/setup-intent", { method: "POST" })
      .then(async (res) => {
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error ?? `HTTP ${res.status}`);
        }
        const data = (await res.json()) as { clientSecret?: string };
        if (!data.clientSecret) throw new Error("Mangler client secret fra Stripe.");
        if (!avbrutt) setClientSecret(data.clientSecret);
      })
      .catch((err) => {
        if (!avbrutt) setFeil(err instanceof Error ? err.message : "Kunne ikke starte kortoppdatering.");
      });
    return () => {
      avbrutt = true;
    };
  }, []);

  if (!PUBLISHABLE_KEY || !stripePromise) {
    return <FeilBoks feil="Kortskjemaet er ikke satt opp riktig (mangler Stripe-nøkkel). Kontakt Anders." />;
  }
  if (feil) return <FeilBoks feil={feil} />;
  if (!clientSecret) {
    return (
      <span style={{ fontFamily: TL.font.mono, fontSize: 12, color: TL.mute }}>Laster kortskjema …</span>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, locale: "nb" }}>
      <KortSkjemaInnhold />
    </Elements>
  );
}
