"use client";

import { RefreshCw } from "lucide-react";
import { Knapp, FeilTilstand } from "@/components/precision/pa";
import { BookingRamme } from "@/components/booking/precision/BookingRamme";

export default function KvitteringFeil({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <BookingRamme smal>
      <FeilTilstand
        icon={RefreshCw}
        title="Kvitteringen kunne ikke hentes"
        text="Bookingen er lagret. Kvitteringen ligger også i e-posten din."
        code={error.digest ? `REF ${error.digest}` : undefined}
        retry={<Knapp variant="secondary" icon={RefreshCw} onClick={reset}>Prøv igjen</Knapp>}
      />
    </BookingRamme>
  );
}
