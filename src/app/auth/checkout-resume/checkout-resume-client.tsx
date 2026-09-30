"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { KnappLenke, LasterTilstand, FeilTilstand } from "@/components/precision/pa";
import { AuthRamme, AuthHode, Stegrad } from "@/components/auth/precision/AuthPa";

/**
 * Gjenopptar Stripe Checkout etter signup + onboarding (steg 4, «Betaling»,
 * i AU-02 i Precision Athletics, Claude Design 7d7c2994). Status først, én vei
 * videre ved feil.
 */
export function CheckoutResumeClient({ plan, forhandFeil, natt }: { plan?: string; forhandFeil?: boolean; natt?: boolean }) {
  const router = useRouter();
  const startet = useRef(false);
  const [feil, setFeil] = useState(forhandFeil ?? false);

  useEffect(() => {
    if (forhandFeil !== undefined || startet.current) return;
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
  }, [plan, router]);

  return (
    <AuthRamme max={520} natt={natt}>
      <Stegrad aktiv={3} />
      {feil ? (
        <FeilTilstand
          icon={CircleAlert}
          title="Vi fikk ikke startet betalingen"
          text="Prøv igjen fra abonnement. Du mister ikke kontoen."
          retry={<KnappLenke href="/portal/meg/abonnement">Gå til abonnement</KnappLenke>}
        />
      ) : (
        <>
          <AuthHode tittel="Fortsett til betaling" under="Du sendes til Stripe for sikker betaling." />
          <LasterTilstand text="Sender deg til betaling …" />
        </>
      )}
    </AuthRamme>
  );
}
