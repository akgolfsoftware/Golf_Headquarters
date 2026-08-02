/**
 * AgenticOS — felles inngangspunkt for AI-flatene i AK Golf HQ.
 *
 * Flyten er: klassifiser → bygg prompt → velg modell → (kall modellen) →
 * kjør guards → logg. Modellkallet selv eier hver flate fortsatt; dette laget
 * bestemmer HVA som spørres om, MED hvilken kontekst, av HVILKEN modell — og
 * gjør resultatet målbart.
 *
 *   const k = klassifiser({ tekst, rolle: "SPILLER", mindreaarig });
 *   const prompt = byggPrompt(k, [{ kilde: "FASIT", innhold: fasitTekst }]);
 *   const { modell } = velgModell(k);
 *   // ... kall modellen med prompt.system ...
 *   const treff = kjorGuards(svar);
 *   const id = await loggInteraksjon({ prompt, klassifisering: k, modell, guardTreff: treff });
 *
 * Se docs/platform/AGENTICOS-MASTERBRAIN-ARKITEKTUR.md §3.
 *
 * MERK: `logg.ts` eksporteres bevisst IKKE herfra — den er server-only, og en
 * re-eksport ville gjort hele denne modulen ubrukelig fra klientkode. Importer
 * den direkte: `import { loggInteraksjon } from "@/lib/agenticos/logg"`.
 */

export { klassifiser, erUsikker } from "./ruter";
export { byggPrompt, MALER, KONTEKST_BUDSJETT } from "./prompt-bygger";
export { byggFasitKontekst } from "./kontekst";
export type { FasitOpts } from "./kontekst";
export type { BygdPrompt, KontekstBlokk, PromptMal } from "./prompt-bygger";
export { velgModell, eskaler, MODELLER } from "./modell";
export type { ModellValg } from "./modell";
export { kjorGuards, sjekkInvarianter, sjekkHypoteseSpraak, sjekkMotFasit } from "./guards";
export type { GuardTreff } from "./guards";
export {
  INTENTS,
  DOMENER,
  ROLLER,
  KONTEKST_KILDER,
  TIERS,
  UTFALL,
  AVVIS_GRUNNER,
  erAvvisGrunn,
  TERSKEL_LAV_CONFIDENCE,
  klassifiseringSchema,
} from "./typer";
export type {
  Intent,
  Domene,
  Rolle,
  KontekstKilde,
  Tier,
  Klassifisering,
  Utfall,
  AvvisGrunn,
} from "./typer";
