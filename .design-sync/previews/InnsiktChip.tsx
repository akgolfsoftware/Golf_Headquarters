import { InnsiktChip } from "akgolf-hq-komponenter";

const boks = { maxWidth: 440 };

/** AI-innsikt: stille, aldri ropende. Sparkles-ikon i handlingsfargen, dempet tekst. */
export function Standard() {
  return (
    <div style={boks}>
      <InnsiktChip>
        Approach fra 80–120 m koster 0,6 slag per runde mot ditt eget snitt de siste 10 rundene.
      </InnsiktChip>
    </div>
  );
}

/** cta + href: ekte lenke med pil. */
export function MedLenke() {
  return (
    <div style={boks}>
      <InnsiktChip cta="Se analysen" href="/portal/analysere">
        Putt fra 2–3 m holder 71 % de siste fire ukene, opp fra 58 %.
      </InnsiktChip>
    </div>
  );
}

/** cta uten href: uthevet tekst uten pil — ser aldri klikkbar ut uten å være det. */
export function UthevetUtenLenke() {
  return (
    <div style={boks}>
      <InnsiktChip cta="Forslag: wedge-økt torsdag.">
        Tre av fire bogeyer i helgen kom etter et approach-slag som stoppet kort.
      </InnsiktChip>
    </div>
  );
}
