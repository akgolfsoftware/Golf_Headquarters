"use client";

import { WangFeil, WangKnapp } from "@/components/wang/trener/wang-ui";

/** Feiltilstand for Administrasjon (WANG-24 · Feil). Viser aldri feilmeldingen fra serveren. */
export default function WangAdminFeil({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <WangFeil
      tittel="Administrasjon kunne ikke hentes"
      tekst="Ingenting er tapt. Prøv igjen om litt."
      handling={
        <form action={() => reset()}>
          <WangKnapp type="submit">Prøv igjen</WangKnapp>
        </form>
      }
    />
  );
}
