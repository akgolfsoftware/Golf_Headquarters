"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { T } from "@/lib/v2/tokens";
import { LogoAK, Caps } from "@/components/v2";

/**
 * Gjenopptar Stripe Checkout etter signup + onboarding.
 * V2/B: status først, én grønn vei videre ved feil.
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
    <main
      className="light"
      style={{
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: `radial-gradient(900px 380px at 50% -10%, var(--v2-vignett), transparent 62%), ${T.bg}`,
        color: T.fg,
        fontFamily: T.ui,
        colorScheme: "light",
      }}
    >
      <div style={{ width: "100%", maxWidth: 360, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <LogoAK size={28} />
        </div>
        {feil ? (
          <>
            <Caps size={10} style={{ marginBottom: 10, color: T.mut }}>
              Betaling
            </Caps>
            <p
              style={{
                fontFamily: T.disp,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                margin: "0 0 10px",
                color: T.fg,
              }}
            >
              Vi fikk ikke startet betalingen
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.5, color: T.mut, margin: "0 0 22px" }}>
              Prøv igjen fra abonnement — du mister ikke kontoen.
            </p>
            <Link
              href="/portal/meg/abonnement"
              className="v2-press"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: 48,
                padding: "0 22px",
                borderRadius: 9999,
                background: T.lime,
                color: T.onLime,
                fontWeight: 700,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              Gå til abonnement
            </Link>
          </>
        ) : (
          <>
            <Caps size={10} style={{ marginBottom: 10, color: T.mut }}>
              Nesten ferdig
            </Caps>
            <p
              style={{
                fontFamily: T.disp,
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                margin: "0 0 10px",
                color: T.fg,
              }}
            >
              Sender deg til betaling
            </p>
            <p style={{ fontSize: 14, color: T.mut, margin: 0 }}>
              Et øyeblikk …
            </p>
          </>
        )}
      </div>
    </main>
  );
}
