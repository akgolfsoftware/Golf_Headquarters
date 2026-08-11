"use client";

/**
 * Avbestill-knapp for /portal/booking/[bookingId] — matcher fasitens
 * dobbeltbekreftelse (samme mønster som turneringspåmelding): første trykk
 * viser en advarselsrute med «Ja, avbestill» / «Behold timen», andre trykk
 * utfører. 24-timersgrensen (AVBESTILLING_FRIST_TIMER) avgjør kun TEKSTEN
 * her — selve regelen håndheves server-side i cancelBooking (policy.ts).
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { T, Knapp } from "@/components/v2";
import { cancelBooking } from "@/app/portal/meg/bookinger/actions";

export function BookingAvbestillKnapp({ bookingId, canRefund }: { bookingId: string; canRefund: boolean }) {
  const [bekreft, setBekreft] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function utfor() {
    setFeil(null);
    startTransition(async () => {
      try {
        await cancelBooking(bookingId);
        router.refresh();
      } catch (err) {
        setFeil(err instanceof Error ? err.message : "Kunne ikke avbestille.");
        setBekreft(false);
      }
    });
  }

  if (!bekreft) {
    return (
      <Knapp ghost full icon="x-circle" onClick={() => setBekreft(true)}>
        Avbestill
      </Knapp>
    );
  }

  return (
    <div
      style={{
        border: `1px dashed ${T.borderS}`,
        borderRadius: T.rCard,
        background: T.panel2,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <p style={{ margin: 0, fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.55 }}>
        {canRefund
          ? "Sikker? Timen frigis og krediten din betales tilbake."
          : "Sikker? Mindre enn 24 timer til timen — krediten refunderes ikke."}
      </p>
      {feil && <p style={{ margin: 0, fontFamily: T.ui, fontSize: 12, color: T.down }}>{feil}</p>}
      <div style={{ display: "flex", gap: 8 }}>
        <Knapp ghost onClick={() => setBekreft(false)} disabled={pending} style={{ flex: 1 }}>
          Behold timen
        </Knapp>
        <Knapp onClick={utfor} disabled={pending} style={{ flex: 1, background: T.down, color: T.onForest }}>
          {pending ? "Avbestiller…" : "Ja, avbestill"}
        </Knapp>
      </div>
    </div>
  );
}
