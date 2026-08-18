// Fagkunnskap-tool for Caddie — auto-approved (rent oppslag, ingen skriving).
//
// Caddie er først og fremst en forretningsassistent: bookinger, fakturaer,
// spillere, meldinger. Golffaglige spørsmål kommer sjelden. Å presse hele
// MORAD-ordboka (~13 500 tegn) og posisjonskatalogen (~17 000 tegn) inn i
// systemprompten på HVER melding ville kostet mest på de aller fleste turer
// og samtidig fortynnet resten av prompten.
//
// I stedet henter modellen kunnskapen når den faktisk trenger den.

import { tool } from "ai";
import { z } from "zod";
import {
  formatMasterbrainBlokk,
  hentMasterbrainKunnskap,
  type Oppgavetype,
} from "@/lib/masterbrain";
import { toolError } from "../types";

/**
 * Tak per oppslag. Terminologi (ordbok + posisjoner) er ~30 500 tegn samlet;
 * 16 000 gir hele ordboka og lar posisjonskatalogen ryke — den er sjelden det
 * Caddie trenger for å svare på et begrepsspørsmål, og utelatelsen navngis i
 * svaret så modellen vet at den mangler noe.
 */
const MAKS_TEGN = 16_000;

const OPPGAVETYPER = [
  "terminologi",
  "sg-diagnose",
  "periodisering",
  "plan-generering",
  "drill-forslag",
] as const satisfies readonly Oppgavetype[];

export const KNOWLEDGE_TOOLS = {
  getGolfKnowledge: tool({
    description:
      "Slå opp autoritativ AK Golf-fagkunnskap fra Masterbrain: MORAD-terminologi og " +
      "svingposisjoner, Strokes Gained-prinsipper og svingfeil, " +
      "pyramidefordeling, L-faser og periodisering. Bruk denne FØR du svarer " +
      "på noe golffaglig — finn aldri på metodikk, tall eller begreper selv.",
    inputSchema: z.object({
      emne: z
        .enum(OPPGAVETYPER)
        .describe(
          "terminologi = MORAD-begreper og P-posisjoner. " +
            "sg-diagnose = Strokes Gained og svingfeil. " +
            "periodisering = perioder, L-faser, ukesstruktur. " +
            "plan-generering = pyramide og periodestruktur. " +
            "drill-forslag = drill-bankens status og hva en drill skal rette.",
        ),
    }),
    execute: async ({ emne }) => {
      try {
        const kunnskap = hentMasterbrainKunnskap(emne, { maksTegn: MAKS_TEGN });
        return {
          emne,
          kunnskap: formatMasterbrainBlokk(kunnskap),
          kilder: kunnskap.kilder,
          utelatt: kunnskap.utelatt,
          versjon: kunnskap.versjonsnokkel,
        };
      } catch (e) {
        return toolError(
          `Kunne ikke hente fagkunnskap for «${emne}»: ${
            e instanceof Error ? e.message : "ukjent feil"
          }`,
        );
      }
    },
  }),
} as const;
