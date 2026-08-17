/**
 * IkkeFunnet — presentasjonell 404 «Denne siden finnes ikke»-side for
 * AK Golf HQ, Paper. Fasit: designsystem/paper/fase2/system/
 * system-tilstander.html (§404). Sentrert systemside uten app-sidebar.
 *
 * Rent presentasjonelt + props-drevet: ingen Prisma/DB/Supabase/auth.
 * Brukes av app-ruten (app/not-found.tsx).
 */
import { PaperTilstand, PaperIkon } from "@/components/system/paper-tilstand";

export type IkkeFunnetProps = {
  /** Lenke bak primær-CTA-en — vanligvis produktets hjem/oversikt. */
  hjemHref?: string;
  /** Tekst på primær-CTA-en. */
  knappTekst?: string;
  /** Overskrift. */
  tittel?: string;
  /** Forklarende undertekst. */
  beskrivelse?: string;
  /** Tekst på sekundær-CTA-en. */
  sekundarKnappTekst?: string;
  /** Lenke bak sekundær-CTA-en. */
  sekundarHref?: string;
};

export function IkkeFunnet({
  hjemHref = "/",
  knappTekst = "Til hjem",
  tittel = "Denne siden finnes ikke",
  beskrivelse = "Lenken kan være gammel, eller siden kan ha flyttet. Fant du den i en e-post fra oss, er den trolig utdatert.",
  sekundarKnappTekst = "Kontakt oss",
  sekundarHref = "/kontakt",
}: IkkeFunnetProps) {
  return (
    <PaperTilstand
      dataSlug="system-404"
      ikon={PaperIkon.finnesIkke}
      tittel={tittel}
      tekst={beskrivelse}
      knapper={[
        { label: knappTekst, href: hjemHref, primary: true },
        { label: sekundarKnappTekst, href: sekundarHref },
      ]}
      kode="404"
    />
  );
}
