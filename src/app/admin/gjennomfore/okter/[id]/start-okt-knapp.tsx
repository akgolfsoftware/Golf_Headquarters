"use client";

// Start økt / Åpne live-konsoll (client-leaf) for økt-detalj.
// Kaller server-action startOkt → kobler Booking til en TrainingSessionV2 og
// navigerer til live-konsollens brief (/admin/live/[sessionId]/brief).

import { Knapp } from "@/components/v2";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { startOkt } from "./actions";

export function StartOktKnapp({
  bookingId,
  label,
  fullWidth = false,
}: {
  bookingId: string;
  label: string;
  fullWidth?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const res = await startOkt(bookingId);
      if (res.ok && res.sessionId) {
        router.push(`/admin/live/${res.sessionId}/brief`);
      } else {
        setError(res.error ?? "Kunne ikke starte økten. Prøv igjen.");
      }
    });
  }

  return (
    <div className={fullWidth ? "flex-1" : undefined}>
      <Knapp full={fullWidth} onClick={handleClick} disabled={pending}>
        {pending ? "Starter…" : label}
      </Knapp>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
