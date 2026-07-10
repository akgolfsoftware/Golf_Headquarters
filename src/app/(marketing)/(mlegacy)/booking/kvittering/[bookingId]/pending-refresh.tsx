"use client";

/**
 * Auto-refresher for PENDING-bookinger.
 *
 * Stripe webhook tar typisk 2-10 sek etter redirect. Denne komponenten
 * poller router.refresh() hvert 3. sek inntil status endres til CONFIRMED
 * (detektert ved at komponenten forsvinner fra DOM) eller etter maks 10
 * forsøk (~30 sek).
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function PendingRefresh() {
  const router = useRouter();

  useEffect(() => {
    let attempts = 0;
    const MAX_ATTEMPTS = 10;

    const id = setInterval(() => {
      attempts++;
      router.refresh();
      if (attempts >= MAX_ATTEMPTS) {
        clearInterval(id);
      }
    }, 3000);

    return () => clearInterval(id);
  }, [router]);

  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 size={14} className="animate-spin" aria-hidden />
      Oppdaterer automatisk…
    </span>
  );
}
