"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { FeilTilstand, KnappLenke, LasterTilstand } from "@/components/precision/pa";
import { AuthBoks, Fremdrift } from "@/components/precision/pa-auth";

/**
 * Gjenopptar Stripe Checkout etter signup + onboarding.
 * AU-02 steg 4 «Betaling» i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/konto/screens/AU-01-03.jsx): status først, én vei videre ved feil.
 * `forhandsvisning` brukes bare i målingen og hopper over Stripe-kallet.
 */
export function CheckoutResumeClient({ plan, forhandsvisning, tema }: { plan?: string; forhandsvisning?: "laster" | "feil"; tema?: "night" }) {
  const router = useRouter();
  const startet = useRef(false);
  const [feil, setFeil] = useState(forhandsvisning === "feil");

  useEffect(() => {
    if (forhandsvisning) return;
    if (startet.current) return;
    startet.current = true;

    if (!plan) {
      router.replace("/portal/meg/abonnement");
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ plan }),
        });
        const data = (await res.json()) as { url?: string };
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        setFeil(true);
      } catch {
        setFeil(true);
      }
    })();
  }, [plan, router, forhandsvisning]);

  return <AuthBoks maks={520} tema={tema}>
    <Fremdrift steg={3} />
    {feil
      ? <FeilTilstand icon={CircleAlert} title="Vi fikk ikke startet betalingen" text="Prøv igjen fra abonnement — du mister ikke kontoen." retry={<KnappLenke href="/portal/meg/abonnement" variant="secondary">Gå til abonnement</KnappLenke>} />
      : <LasterTilstand text="Sender deg til betaling …" />}
  </AuthBoks>;
}
