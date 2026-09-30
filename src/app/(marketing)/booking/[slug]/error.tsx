"use client";

import { Knapp } from "@/components/precision/pa";
import { RotateCw } from "lucide-react";
import { BookingFeil } from "@/components/booking/precision/BookingSkall";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <BookingFeil
      tittel="Bookingen kunne ikke lastes"
      tekst="Ingen time er booket og ingenting er trukket. Prøv igjen."
      kode={`FEIL · BOOKING${error.digest ? ` · ${error.digest}` : ""}`}
      retry={<Knapp variant="secondary" icon={RotateCw} onClick={reset}>Prøv igjen</Knapp>}
    />
  );
}
