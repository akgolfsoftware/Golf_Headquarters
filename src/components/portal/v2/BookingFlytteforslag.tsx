"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * Coachens forslag om ny tid på /portal/booking/[bookingId] (Anders 29.09.2026).
 * Timen står på den gamle tiden til spilleren godtar. Godta flytter bookingen
 * (kollisjonssjekk, Google og EP-02 på serveren); Avslå fjerner forslaget.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Kort, Knapp } from "@/components/v2";
import { avslaaFlytteforslag, godtaFlytteforslag } from "@/app/portal/booking/[bookingId]/actions";

export function BookingFlytteforslag({ bookingId, naa, forslag }: { bookingId: string; naa: string; forslag: string }) {
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const svar = (fn: (id: string) => Promise<{ ok: true } | { ok: false; feil: string }>) =>
    start(async () => {
      setFeil(null);
      try {
      const res = await fn(bookingId);
      if (!res.ok) { setFeil(res.feil); return; }
      router.refresh();
      } catch { setFeil("Svaret kunne ikke lagres. Prøv igjen."); }
    });

  return (
    <Kort eyebrow="Coachen foreslår ny tid">
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 13.5, lineHeight: 1.55, color: TL.text }}>
          Nå: {naa}
          <br />
          <strong>Forslag: {forslag}</strong>
        </p>
        <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 12.5, lineHeight: 1.55, color: TL.mute }}>
          Timen står på den gamle tiden til du svarer.
        </p>
        {feil && <p role="alert" style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 12.5, color: TL.text }}>{feil}</p>}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Knapp onClick={() => svar(godtaFlytteforslag)} disabled={pending} style={{ flex: "1 1 140px" }}>
            {pending ? "Lagrer…" : "Godta ny tid"}
          </Knapp>
          <Knapp ghost onClick={() => svar(avslaaFlytteforslag)} disabled={pending} style={{ flex: "1 1 140px" }}>
            Avslå
          </Knapp>
        </div>
      </div>
    </Kort>
  );
}
