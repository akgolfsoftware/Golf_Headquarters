// AI-strukturering av coaching-okt-transkripsjon.
// Tar ra-transkripsjon + spiller-kontekst -> kjorer Claude med tool_use -> returnerer
// strukturert analyse i 5 kategorier (teknisk, taktisk, mental, fysisk,
// hjemmelekse) + coach-analyse, neste-okt-anbefaling og kort oppsummering
// til logg-linje.

import { z } from "zod";
import { anthropicKlient, COACH_MODEL } from "./anthropic";

// ----------------------------------------------------------------------------
// Typer
// ----------------------------------------------------------------------------

export type SpillerKontekst = {
  navn: string;
  hcp: number | null;
  ambisjon: string | null;
  alder: number | null;
  sisteFireUkerSummary: string;
  aktivPlan: string | null;
};

export type AnalyseInput = {
  spillerKontekst: SpillerKontekst;
  transkripsjon: string;
  varighetMin: number;
};

export const AnalyseResultatSchema = z.object({
  teknisk: z.string().min(1),
  taktisk: z.string().min(1),
  mental: z.string().min(1),
  fysisk: z.string().min(1),
  hjemmelekse: z.string().min(1),
  coachAnalyse: z.string().min(1),
  nesteOktAnbefaling: z.string().min(1),
  oppsummering: z.string().min(1),
});

export type AnalyseResultat = z.infer<typeof AnalyseResultatSchema>;

// ----------------------------------------------------------------------------
// Prompt
// ----------------------------------------------------------------------------

const SYSTEM_PROMPT = `Du er en erfaren golf-coach som skriver referat fra en coaching-økt for Anders Kristiansen (AK Golf Academy).
Du skal strukturere økten i 5 kategorier: Teknisk, Taktisk, Mental, Fysisk, Hjemmelekse.

VIKTIGST — hold deg til det som faktisk ble sagt:
- Referatet skal bygge KUN på transkripsjonen. Ikke dikt opp øvelser, tall,
  observasjoner eller fremgang som ikke er nevnt.
- Ble en kategori ikke berørt: skriv nøyaktig "Ikke spesielt fokus denne økten."
  Det er et helt greit svar — bedre enn å fylle på med gjetninger.
- Spiller-konteksten (HCP, plan, siste 4 uker) er BAKGRUNN for å gjøre rådene
  relevante. Den er ikke innhold fra økten, og skal ikke refereres som noe som
  skjedde i økten.
- Er noe uklart i transkripsjonen: skriv at det er uklart, ikke velg en tolkning.

Transkripsjonen kommer fra automatisk tale-til-tekst og inneholder feil:
navn, tall og fagord kan være feilhørt, og setninger kan mangle punktum.
Les gjennom feilene og tolk velvillig ut fra golf-sammenhengen. Er et TALL
(avstand, antall, score) tydelig feilhørt eller usikkert, skriv det uten tallet
heller enn å gjengi et tall du ikke stoler på.

Stil:
- Norsk bokmål med æ, ø og å
- Direkte og konkret — ingen fluff, ingen skryt uten dekning
- Bruk fagspråk fra golf der det er relevant (HCP, slope, swing path, low point, kompresjon, fade/draw, divot, lie-vinkel, smash factor, AOA, club path, face angle)
- Hjemmelekse skal være SPESIFIKK og MÅLBAR (f.eks. "3 sett x 10 putt fra 1,5 m hver morgen i 2 uker", ikke "jobb mer med putting") — men bygg den på det økten faktisk handlet om

Innhold per kategori (teknisk, taktisk, mental, fysisk):
- Hva ble jobbet med
- Hva fungerte / hva fungerte ikke
- Hva er neste steg
Skriv 2–5 setninger per kategori som ble berørt.

De øvrige feltene:
- hjemmelekse: konkrete oppgaver til spilleren fram til neste økt
- coachAnalyse: din faglige vurdering på tvers av kategoriene — hovedbildet, ikke en gjentakelse av listene over
- nesteOktAnbefaling: hva neste økt bør handle om, og hvorfor
- oppsummering: MAKS 2 setninger. Denne blir én linje i spillerens logg, så den må stå alene uten resten av referatet.

Anbefalinger er alltid råd, aldri krav — skriv aldri at spilleren "må" eller
"ikke kan" gjøre noe.

Returner resultatet gjennom verktøyet lever_okt_analyse.`;

function byggBrukerPrompt(input: AnalyseInput): string {
  const k = input.spillerKontekst;
  const linjer: string[] = [];
  linjer.push("BAKGRUNN OM SPILLEREN (kontekst — ikke innhold fra økten):");
  // ANONYMISERT (GDPR art. 9): spillerens navn sendes ALDRI til Anthropic.
  // Kombinasjonen navn + helse-/prestasjonskontekst + rå transkripsjon er
  // sensitiv personopplysning om en (ofte mindreårig) person. HCP/alder/plan er
  // fagkonteksten modellen faktisk trenger, og peker ikke tilbake på personen.
  linjer.push(`HCP: ${k.hcp ?? "ukjent"}`);
  if (k.alder !== null) linjer.push(`Alder: ${k.alder}`);
  if (k.ambisjon) linjer.push(`Ambisjon: ${k.ambisjon}`);
  if (k.aktivPlan) linjer.push(`Aktiv treningsplan: ${k.aktivPlan}`);
  linjer.push(`Aktivitet siste 4 uker: ${k.sisteFireUkerSummary}`);
  linjer.push("");
  linjer.push(`ØKT-VARIGHET: ${input.varighetMin} min`);
  linjer.push("");
  linjer.push("RÅ TRANSKRIPSJON FRA COACHING-ØKTEN (automatisk tale-til-tekst, kan inneholde feil):");
  linjer.push("---");
  linjer.push(input.transkripsjon);
  linjer.push("---");
  linjer.push("");
  linjer.push(
    "Skriv referatet fra økten over. Bygg kun på det som faktisk ble sagt, og bruk verktøyet lever_okt_analyse.",
  );
  return linjer.join("\n");
}

// ----------------------------------------------------------------------------
// analyserCoachingSesjon
// ----------------------------------------------------------------------------

/**
 * Kjorer Claude med okt-transkripsjon og returnerer strukturert analyse.
 * Bruker tool_use for tvunget JSON-output.
 */
export async function analyserCoachingSesjon(
  input: AnalyseInput,
): Promise<AnalyseResultat> {
  const klient = anthropicKlient();
  const brukerPrompt = byggBrukerPrompt(input);

  const respons = await klient.messages.create({
    model: COACH_MODEL,
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    tools: [
      {
        name: "lever_okt_analyse",
        description:
          "Lever strukturert referat fra coaching-økt i 5 kategorier + coach-analyse, anbefaling og kort oppsummering.",
        input_schema: {
          type: "object",
          properties: {
            teknisk: {
              type: "string",
              description:
                "Teknisk arbeid i økten: hva ble jobbet med, hva fungerte, neste steg. «Ikke spesielt fokus denne økten.» hvis ikke berørt.",
            },
            taktisk: {
              type: "string",
              description:
                "Taktisk arbeid (baneplan, køllevalg, risiko). «Ikke spesielt fokus denne økten.» hvis ikke berørt.",
            },
            mental: {
              type: "string",
              description:
                "Mentalt arbeid (rutiner, fokus, press). «Ikke spesielt fokus denne økten.» hvis ikke berørt.",
            },
            fysisk: {
              type: "string",
              description:
                "Fysisk arbeid (bevegelighet, styrke, utholdenhet). «Ikke spesielt fokus denne økten.» hvis ikke berørt.",
            },
            hjemmelekse: {
              type: "string",
              description:
                "Konkrete, målbare oppgaver til neste økt — bygget på det økten faktisk handlet om.",
            },
            coachAnalyse: {
              type: "string",
              description:
                "Faglig vurdering på tvers av kategoriene — hovedbildet, ikke en gjentakelse av listene.",
            },
            nesteOktAnbefaling: {
              type: "string",
              description: "Hva neste økt bør handle om, og hvorfor.",
            },
            oppsummering: {
              type: "string",
              description:
                "Maks 2 setninger. Blir én linje i spillerens logg og må stå alene uten resten av referatet.",
            },
          },
          required: [
            "teknisk",
            "taktisk",
            "mental",
            "fysisk",
            "hjemmelekse",
            "coachAnalyse",
            "nesteOktAnbefaling",
            "oppsummering",
          ],
        },
      },
    ],
    tool_choice: { type: "tool", name: "lever_okt_analyse" },
    messages: [{ role: "user", content: brukerPrompt }],
  });

  const toolBlock = respons.content.find(
    (b): b is Extract<typeof b, { type: "tool_use" }> => b.type === "tool_use",
  );
  if (!toolBlock) {
    throw new Error("Claude returnerte ikke tool_use-blokk for okt-analyse.");
  }

  const parsed = AnalyseResultatSchema.safeParse(toolBlock.input);
  if (!parsed.success) {
    throw new Error(
      `Claude-respons matchet ikke forventet schema: ${parsed.error.message}`,
    );
  }
  return parsed.data;
}
