"use client";

import { useState, useTransition } from "react";
import { T } from "@/lib/v2/tokens";
import { Knapp } from "@/components/v2/core";
import { slettHendelse } from "@/lib/kalender-hendelse/actions";

export function SlettKnapp({ id }: { id: string }) {
  const [bekreft, setBekreft] = useState(false);
  const [pending, startPending] = useTransition();

  if (!bekreft) {
    return (
      <Knapp ghost onClick={() => setBekreft(true)}>
        <span style={{ color: T.down }}>Slett hendelse</span>
      </Knapp>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2 }}>Sikker?</span>
      <Knapp ghost onClick={() => setBekreft(false)} disabled={pending}>Avbryt</Knapp>
      <Knapp
        disabled={pending}
        onClick={() =>
          startPending(async () => {
            try {
              await slettHendelse(id);
            } catch (err) {
              if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) return;
              throw err;
            }
          })
        }
      >
        {pending ? "Sletter …" : "Ja, slett"}
      </Knapp>
    </div>
  );
}
