// Prompt Engineering Expert — produksjonsstien.
//
// Deterministisk, ikke en LLM. Den setter sammen fire lag fra et versjonert
// register: rolle/tone, invarianter, kontekst og utdataformat. Hver mal har id
// og versjon (`sg-tolkning@1`), og versjonen logges på hver interaksjon slik at
// «ble svarene dårligere etter at vi endret prompten?» er et spørsmål med svar.
//
// LLM-varianten av prompt engineering er `/prompt-engineer`-skillen, som Anders
// bruker til å FORFATTE nye maler. Den kjører aldri her.
//
// Trygg for klient — ingen server-only imports.

import type { Intent, Klassifisering, KontekstKilde } from "./typer";

/** Tone og skrivemåte. Én kilde, gjenbrukt av alle maler. */
const TONE = `
Du svarer på norsk bokmål med æ/ø/å. Profesjonell og direkte. Aktiv stemme.
Aldri utropstegn, aldri emoji. Ikke «Bra jobba!» — bruk «Solid» eller «Sterkt».
Skriv kort. Er du usikker, si det.
`.trim();

/**
 * Invarianter som gjelder ALLE svar. Speiler CLAUDE.md og masterbrains MANIFEST.
 * Endres disse, må guards.ts oppdateres i samme slengen.
 */
const INVARIANTER = `
- Anbefalinger sperrer aldri. Ingenting du skriver skal blokkere trening.
  Skriv aldri at noe «ikke kan» gjøres eller «må» gjøres.
- Finn aldri på golfmetodikk. Mangler kunnskapen i konteksten under, si at den
  mangler.
- SG-tall peker mot mulige svingfeil, men identifiserer dem ikke. Formuler alltid
  som hypotese som må bekreftes med video, sikte og køllevalg — aldri som funn.
- Drill-banken er tom og under oppbygging. Beskriv hva som bør trenes
  (pyramideområde, P-posisjon), men foreskriv ingen navngitt øvelse.
`.trim();

export type PromptMal = {
  id: string;
  versjon: number;
  /** Hvem modellen er i denne oppgaven. */
  rolle: string;
  /** Hva den skal levere, og i hvilken form. */
  format: string;
};

/**
 * Registeret. Én mal per intent. Bump `versjon` ved enhver endring i teksten —
 * ellers blir loggen løgn.
 */
export const MALER: Record<Intent, PromptMal> = {
  "tolk-tall": {
    id: "tolk-tall",
    versjon: 1,
    rolle:
      "Du forklarer en spillers egne tall slik at hen forstår hva de betyr for treningen.",
    format:
      "Svar i tre korte avsnitt: (1) hva tallet sier, (2) hva det sannsynligvis kommer av — som hypotese, (3) hva som bør prioriteres framover. Ingen punktliste.",
  },
  plan: {
    id: "plan",
    versjon: 1,
    rolle:
      "Du foreslår justeringer i en treningsplan, forankret i CANON-periodisering og spillerens nivå.",
    format:
      "Lever forslaget som: endring, begrunnelse, og hva coachen bør se etter i to uker. Ett forslag om gangen.",
  },
  drill: {
    id: "drill",
    versjon: 1,
    rolle: "Du foreslår hva som bør trenes for å lukke et konkret gap.",
    format:
      "Beskriv pyramideområde, hvilken ferdighet som skal utvikles og hvordan framgang måles. Ingen navngitte øvelser — banken er under oppbygging.",
  },
  teknikk: {
    id: "teknikk",
    versjon: 1,
    rolle:
      "Du forklarer svingteknikk med MORAD-posisjoner som referanse, uten å diagnostisere fra tall alene.",
    format:
      "Vis til P-posisjon og hva som kjennetegner den. Si eksplisitt hva som må sjekkes på video før noe konkluderes.",
  },
  drift: {
    id: "drift",
    versjon: 1,
    rolle: "Du hjelper med praktisk drift: booking, kalender og oppfølging.",
    format: "Svar kort og konkret. Foreslå neste steg, utfør ingenting.",
  },
  fritekst: {
    id: "fritekst",
    versjon: 1,
    rolle: "Du er en kunnskapsrik golfassistent i AK Golf HQ.",
    format:
      "Svar kort og presist. Er spørsmålet utenfor det du har kontekst for, si det framfor å gjette.",
  },
};

export type KontekstBlokk = {
  kilde: KontekstKilde;
  innhold: string;
};

/** Tegnbudsjett per kontekstlag. Fasit først — den er gratis og mest presis. */
export const KONTEKST_BUDSJETT: Record<KontekstKilde, number> = {
  FASIT: 6000,
  SPILLERDATA: 4000,
  RAG: 6000,
};

export type BygdPrompt = {
  promptId: string;
  promptVersjon: number;
  system: string;
  kontekstKilder: KontekstKilde[];
};

/**
 * Bygg system-prompten for en klassifisert oppgave.
 *
 * Kontekstblokkene fylles i rekkefølgen de kommer, hver innenfor sitt budsjett.
 * En blokk som sprenger budsjettet kuttes — vi limer aldri inn «alt».
 */
export function byggPrompt(
  k: Klassifisering,
  kontekst: KontekstBlokk[] = [],
): BygdPrompt {
  const mal = MALER[k.intent];
  const brukteKilder: KontekstKilde[] = [];

  const deler: string[] = [mal.rolle, TONE, `INVARIANTER:\n${INVARIANTER}`];

  for (const blokk of kontekst) {
    const innhold = blokk.innhold.trim();
    if (innhold.length === 0) continue;
    const budsjett = KONTEKST_BUDSJETT[blokk.kilde];
    deler.push(`KONTEKST (${blokk.kilde}):\n${innhold.slice(0, budsjett)}`);
    brukteKilder.push(blokk.kilde);
  }

  if (brukteKilder.length === 0) {
    deler.push(
      "KONTEKST: ingen. Du har ikke fått data om denne spilleren — svar generelt, og si at du mangler grunnlaget for et personlig råd.",
    );
  }

  deler.push(`SVARFORMAT:\n${mal.format}`);

  return {
    promptId: mal.id,
    promptVersjon: mal.versjon,
    system: deler.join("\n\n"),
    kontekstKilder: brukteKilder,
  };
}
