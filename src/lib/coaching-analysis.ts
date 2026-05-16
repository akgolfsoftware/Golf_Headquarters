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

const SYSTEM_PROMPT = `Du er en erfaren golf-coach som analyserer en coaching-okt for Anders Kristiansen (AK Golf Academy).
Du skal strukturere okten i 5 kategorier: Teknisk, Taktisk, Mental, Fysisk, Hjemmelekse.

Stil:
- Norsk bokmal
- Direkte og konkret - ingen fluff
- Bruk fagsprak fra golf der det er relevant (HCP, slope, swing path, low point, kompresjon, fade/draw, divot, lie-vinkel, smash factor, AOA, club path, face angle)
- Hjemmelekse skal vaere SPESIFIKK og MALBAR (f.eks. "3 sett x 10 putt fra 1.5m hver morgen i 2 uker", ikke "jobb mer med putting")

For hver kategori:
- Hva ble jobbet med
- Hva fungerte / hva fungerte ikke
- Hva er neste steg

Hvis kategorien IKKE ble berort i okten: skriv "Ikke spesielt fokus denne okten."

Bruk spiller-konteksten for a gi relevant veiledning.

Returner KUN JSON med eksakt denne strukturen - ingen prosa rundt:
{
  "teknisk": "...",
  "taktisk": "...",
  "mental": "...",
  "fysisk": "...",
  "hjemmelekse": "...",
  "coachAnalyse": "...",
  "nesteOktAnbefaling": "...",
  "oppsummering": "..."
}`;

function byggBrukerPrompt(input: AnalyseInput): string {
  const k = input.spillerKontekst;
  const linjer: string[] = [];
  linjer.push(`SPILLER: ${k.navn}`);
  linjer.push(`HCP: ${k.hcp ?? "ukjent"}`);
  if (k.alder !== null) linjer.push(`Alder: ${k.alder}`);
  if (k.ambisjon) linjer.push(`Ambisjon: ${k.ambisjon}`);
  if (k.aktivPlan) linjer.push(`Aktiv treningsplan: ${k.aktivPlan}`);
  linjer.push("");
  linjer.push("AKTIVITET SISTE 4 UKER:");
  linjer.push(k.sisteFireUkerSummary);
  linjer.push("");
  linjer.push(`OKT-VARIGHET: ${input.varighetMin} min`);
  linjer.push("");
  linjer.push("RA-TRANSKRIPSJON FRA COACHING-OKT:");
  linjer.push("---");
  linjer.push(input.transkripsjon);
  linjer.push("---");
  linjer.push("");
  linjer.push("Analyser okten og returner JSON som beskrevet i system-prompten.");
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
          "Lever strukturert analyse av coaching-okt i 5 kategorier + oppsummering.",
        input_schema: {
          type: "object",
          properties: {
            teknisk: { type: "string" },
            taktisk: { type: "string" },
            mental: { type: "string" },
            fysisk: { type: "string" },
            hjemmelekse: { type: "string" },
            coachAnalyse: { type: "string" },
            nesteOktAnbefaling: { type: "string" },
            oppsummering: { type: "string" },
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
