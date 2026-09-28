"use client";

import { WangFeil, WangKnapp } from "@/components/wang/trener/wang-ui";

/** Felles feiltilstand for WANG-trenerskjermene. Viser aldri feilmeldingen fra serveren. */
export default function WangTrenerFeil({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <WangFeil
      tekst="Noe gikk galt da siden skulle hentes. Prøv igjen. Skjer det igjen, si fra til sportssjefen."
      handling={
        <form action={() => reset()}>
          <WangKnapp type="submit">Prøv igjen</WangKnapp>
        </form>
      }
    />
  );
}
