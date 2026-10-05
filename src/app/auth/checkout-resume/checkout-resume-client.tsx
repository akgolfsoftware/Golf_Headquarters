"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "@/styles/precision-athletics.css";

/**
 * Gjenopptar Stripe Checkout etter signup + onboarding.
 * Samme kall til /api/stripe/checkout. Ingen ny betalingsregel.
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
    <main className="pa-root au-ramme" data-design="precision-athletics">
      <div className="au-boks">
        <Link href="/" className="au-logo">AK Golf HQ</Link>
        {feil ? (
          <>
            <header>
              <p className="au-kicker">Betaling</p>
              <h1>Vi fikk ikke startet betalingen</h1>
              <p>Prøv igjen fra abonnement. Du mister ikke kontoen.</p>
            </header>
            <Link href="/portal/meg/abonnement" className="pa-btn pa-btn--primary pa-btn--full">
              Gå til abonnement
            </Link>
          </>
        ) : (
          <header>
            <p className="au-kicker">Nesten ferdig</p>
            <h1>Sender deg til betaling</h1>
            <p>Et øyeblikk …</p>
          </header>
        )}
      </div>
    </main>
  );
}
