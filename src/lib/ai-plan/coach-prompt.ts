// Delt system-prompt-bygger for AI-coach. Brukes både fra:
//   - src/lib/anthropic.ts (spillerens egen AI-coach)
//   - src/app/api/admin/coach-ai/route.ts (coach som analyserer spiller)
//
// Generisk input-type dekker begge bruksmønstrene.

export type SystemPromptInput = {
  /** Hvem prompten er rettet til. Styrer tone og rolle. */
  mottaker: "spiller" | "coach";
  /** Navn på spilleren (enten den som chater, eller den som analyseres). */
  spillerNavn: string;
  hcp: number | null;
  ambition: string | null;
  homeClub: string | null;
  tier: string;
  playingYears: number | null;
  /** Siste runder, normalisert. */
  sisteRunder: Array<{
    dato: string;
    bane: string;
    score: number;
    sgTotal: number | null;
  }>;
  /** Aktive treningsplaner (én linje per plan). */
  aktivePlaner: Array<{ navn: string; meta?: string }>;
  /** Siste tester (kun relevant for coach-flow). */
  sisteTester?: Array<{ dato: string; navn: string; score: number }>;
};

export function bygCoachSystemPrompt(input: SystemPromptInput): string {
  const profil = [
    `Spiller: ${input.spillerNavn}`,
    input.hcp != null
      ? `HCP: ${input.hcp.toFixed(1).replace(".", ",")}`
      : null,
    input.playingYears != null ? `Spilt: ${input.playingYears} år` : null,
    input.homeClub ? `Hjemmeklubb: ${input.homeClub}` : null,
    input.ambition ? `Ambisjon: ${input.ambition}` : null,
    `Tier: ${input.tier}`,
  ]
    .filter(Boolean)
    .join("\n");

  const planLinjer =
    input.aktivePlaner.length > 0
      ? input.aktivePlaner
          .map((p) => `- ${p.navn}${p.meta ? ` ${p.meta}` : ""}`)
          .join("\n")
      : "Ingen aktive treningsplaner.";

  const rundeLinjer =
    input.sisteRunder.length > 0
      ? input.sisteRunder
          .slice(0, 5)
          .map((r) => {
            const sg =
              r.sgTotal != null
                ? `SG ${r.sgTotal >= 0 ? "+" : ""}${r.sgTotal.toFixed(1)}`
                : "";
            return `- ${r.dato} · ${r.bane} · ${r.score}${
              sg ? " · " + sg : ""
            }`;
          })
          .join("\n")
      : "Ingen registrerte runder enda.";

  const testLinjer =
    input.sisteTester && input.sisteTester.length > 0
      ? input.sisteTester
          .map(
            (t) =>
              `- ${t.dato} · ${t.navn} · ${t.score
                .toFixed(1)
                .replace(".", ",")}`,
          )
          .join("\n")
      : null;

  if (input.mottaker === "spiller") {
    return `Du er AK Golf AI-coach — en personlig coaching-assistent for golfspillere på AK Golf-plattformen.

Du følger AK Golf-pyramidens fem områder: FYS (fysisk), TEK (teknisk), SLAG (slag — korthold/pitch/putt), SPILL (spill — banetilpasning), TURN (turnering).

Tone: motiverende, kortfattet, handlingsorientert. Snakk norsk bokmål. Bruk æ/ø/å riktig. Aldri emoji.

Profil til denne spilleren:
${profil}

Aktive treningsplaner:
${planLinjer}

Siste 5 runder:
${rundeLinjer}

Retningslinjer:
- Gi konkrete råd basert på spillerens data, ikke generiske golf-tips
- Ved spørsmål om "hva bør jeg trene": foreslå spesifikke drills knyttet til pyramide-områder
- Ved spørsmål om resultater: refer til siste runder hvis relevant
- Hold svar under 150 ord med mindre brukeren ber om mer
- Du har ikke tilgang til å booke timer eller endre planen direkte — be brukeren om å bruke /portal/tren eller /portal/coach for det
- Vær ærlig om hva du ikke vet`;
  }

  // mottaker === "coach"
  return `Du er AI-assistent for en AK Golf-coach som analyserer en spiller.

Du følger AK Golf-pyramidens fem områder: FYS (fysisk), TEK (teknisk),
SLAG (slag), SPILL (spill), TURN (turnering).

Tone: faglig, kortfattet, handlingsorientert. Snakk norsk bokmål.
Ingen emoji. Maks 200 ord per svar med mindre coach ber om mer.

Spilleren du analyserer:
${profil}

Aktiv plan: ${planLinjer}

Siste runder:
${rundeLinjer}

Siste tester:
${testLinjer ?? "Ingen tester."}

Retningslinjer:
- Gi konkrete observasjoner basert på dataene
- Når coach spør om "neste økt": foreslå pyramide-område + spesifikke drills
- Når coach spør om analyse: pek på tendenser i SG-tallene
- Si tydelig hvis du mangler data for å svare presist
- Aldri foreslå at coachen "snakker med spilleren" uten konkret innhold`;
}
