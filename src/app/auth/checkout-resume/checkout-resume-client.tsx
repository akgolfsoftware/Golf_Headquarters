"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Gjenopptar Stripe Checkout etter at en ny besøkende har registrert seg og
 * fullført onboarding. Bruker det eksisterende /api/stripe/checkout-endepunktet
 * (nå med session). Rører ikke priser/produkter — kun flyt-gjenopptak.
 */
export function CheckoutResumeClient({ plan }: { plan?: string }) {
  const router = useRouter();
  const startet = useRef(false);
  const [feil, setFeil] = useState(false);

  useEffect(() => {
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
  }, [plan, router]);

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6 text-center">
      <div className="max-w-sm">
        {feil ? (
          <>
            <p className="text-sm text-muted-foreground">
              Vi fikk ikke startet betalingen automatisk.
            </p>
            <a
              href="/portal/meg/abonnement"
              className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
            >
              Gå til abonnement
            </a>
          </>
        ) : (
          <p className="font-mono text-sm text-muted-foreground">Sender deg til betaling …</p>
        )}
      </div>
    </main>
  );
}
