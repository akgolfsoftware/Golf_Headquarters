"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Oppdaterer server-komponenten automatisk mens en turnering er live, slik at
 * en åpen fane henter ferske resultater uten manuell reload.
 *
 * Intervallet bør ligge på linje med ISR-revalidate (120s) — hyppigere
 * refresh serverer bare cachet payload.
 */
export function LiveRefresher({ intervalMs = 120_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      // Hopp over når fanen er skjult — ingen grunn til å refreshe i bakgrunnen.
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
