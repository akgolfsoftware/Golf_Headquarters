"use client";

import { RefreshCw } from "lucide-react";
import { Knapp, FeilTilstand } from "@/components/precision/pa";
import { BookingRamme } from "@/components/booking/precision/BookingRamme";

export default function BookingFeil({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <BookingRamme>
      <FeilTilstand
        icon={RefreshCw}
        title="Bookingen kunne ikke lastes"
        text="Ingen time er booket og ingenting er trukket. Prøv igjen."
        code={error.digest ? `REF ${error.digest}` : undefined}
        retry={<Knapp variant="secondary" icon={RefreshCw} onClick={reset}>Prøv igjen</Knapp>}
      />
    </BookingRamme>
  );
}
