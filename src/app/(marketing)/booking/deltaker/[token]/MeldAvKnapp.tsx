"use client";

import { useState, useTransition } from "react";

export function MeldAvKnapp({ meldAv }: { meldAv: () => Promise<{ ok: boolean; melding: string }> }) {
  const [melding, setMelding] = useState<string | null>(null);
  const [ferdig, setFerdig] = useState(false);
  const [pending, start] = useTransition();
  return (
    <div>
      {!ferdig && (
        <button
          type="button"
          disabled={pending}
          onClick={() => start(async () => { const r = await meldAv(); setMelding(r.melding); setFerdig(r.ok); })}
        >
          {pending ? "Melder av …" : "Meld meg av"}
        </button>
      )}
      {melding && <p role="status">{melding}</p>}
    </div>
  );
}
