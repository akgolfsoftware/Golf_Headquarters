"use client";

import { useState } from "react";
import { Knapp } from "@/components/admin/agencyos-ny/ny";

/** Stripe-betalingslenke med kopier-knapp. Bare kort og Apple Pay. */
export function BetalingsLenke({ url }: { url: string }) {
  const [kopiert, setKopiert] = useState(false);
  const kopier = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setKopiert(true);
    } catch {
      setKopiert(false);
    }
  };
  return (
    <div style={{ display: "grid", gap: 8, minWidth: 0 }}>
      <label className="felt">
        <span className="etikett">Betalingslenke (kort og Apple Pay)</span>
        <input type="text" readOnly value={url} onFocus={(e) => e.currentTarget.select()} />
      </label>
      <div className="knapper">
        <Knapp variant="sek" onClick={kopier}>{kopiert ? "Kopiert" : "Kopier lenken"}</Knapp>
      </div>
    </div>
  );
}
