// Restraint-blokk for live-coach-systemprompten — tale-disiplinen fra
// feedback-forskningen oversatt til instruksjoner modellen kan følge.
// Ren strengbygger (testbar); server-kontekst hentes i context.ts.
//
// Fase A: håndhevingen er prompt-basert («myk»). Hard post-filter på
// streamen og ekte per-slag-hendelser kommer når live slag-kilde finnes.

import type { PlayerBand } from "./bands";

export type RestraintPromptInput = {
  /** Personlige feilbånd fra siste TrackMan-økt (tom = for lite data). */
  bands: PlayerBand[];
  /** Dominant kølle båndene gjelder (null når bands er tom). */
  klubb: string | null;
  /** Baller logget i pågående plan-økt (null for v2/ukjent). */
  ballerLogget: number | null;
  /** Siste importerte TrackMan-økt, for ærlig databegrensning i samtalen. */
  sisteTrackManOkt: { dato: string; antallSlag: number } | null;
};

const METRIC_LABEL: Record<string, string> = {
  carry: "carry",
  side: "side",
  ballSpeed: "ballhastighet",
  launchAngle: "utskytingsvinkel",
  spinRate: "spinn",
  smash: "smash",
};

export function buildRestraintBlock(input: RestraintPromptInput): string {
  const bandLinjer =
    input.bands.length > 0
      ? input.bands
          .map(
            (b) =>
              `- ${METRIC_LABEL[b.metric] ?? b.metric}: normalt ${avrund(b.center)} ± ${avrund(b.halfWidth)} (${b.sampleSize} slag)`,
          )
          .join("\n")
      : "- For lite slagdata til personlige bånd ennå — vær ekstra tilbakeholden med tall.";

  const dataLinjer = [
    input.sisteTrackManOkt
      ? `Siste TrackMan-økt: ${input.sisteTrackManOkt.dato} (${input.sisteTrackManOkt.antallSlag} slag${input.klubb ? `, mest ${input.klubb}` : ""}). Du har INGEN ferskere slagdata enn dette.`
      : "Ingen TrackMan-data importert — du har ingen slagdata i det hele tatt. Si det ærlig hvis spilleren spør om tall.",
    input.ballerLogget !== null ? `Baller logget i denne økta: ${input.ballerLogget}.` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `
TALE-DISIPLIN (forskningsbasert — bryt aldri disse):
- Stillhet er standard. Ikke kommenter teknikk eller tall uoppfordret; svar på det spilleren faktisk spør om.
- Aldri tall etter enkeltslag. Snakk i blokker på ~5 slag, og løft frem MAKS 2 fokuspunkter.
- Selvestimat FØR data: når spilleren vil vurdere slag eller se tall — be først om spillerens egen vurdering («hva tror du selv om …?»), avslør tallene ETTERPÅ som kalibrering.
- Data hentes, pushes aldri: tilby («vil du se tallene?») i stedet for å servere dem.
- Kommenter avvik kun UTENFOR spillerens personlige bånd (under). Innenfor bånd = normal spredning = ingen kommentar, heller ikke ros.
- Eksternt fokus i alt teknisk språk: ballflukt, startlinje, kølle, mål og landingspunkt — aldri kroppsdeler eller kroppsposisjoner.
- Foreslå av og til en stille testblokk (~10 baller uten input fra deg) — og hold deg til den.

Spillerens personlige bånd${input.klubb ? ` (${input.klubb})` : ""}:
${bandLinjer}

Datagrunnlag:
${dataLinjer}`;
}

function avrund(n: number): number {
  return Math.round(n * 10) / 10;
}
