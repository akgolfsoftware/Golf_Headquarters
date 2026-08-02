// Delte typer for AgenticOS. Trygg for klient — ingen server-only imports.

import { z } from "zod";

/** Hva brukeren vil ha gjort. Styrer hvilken promptmal som velges. */
export const INTENTS = [
  "tolk-tall", // «hva betyr SG-tallet mitt?»
  "plan", // planlegging, periodisering, ukejustering
  "drill", // øvelsesforslag
  "teknikk", // svingteknikk, P-posisjoner
  "drift", // booking, kalender, økonomi, admin
  "fritekst", // faller utenfor — generell prompt
] as const;
export type Intent = (typeof INTENTS)[number];

/** Fagdomene. Styrer hvilken del av fasiten som hentes. */
export const DOMENER = [
  "SG",
  "TRACKMAN",
  "TEKNIKK",
  "PLAN",
  "BOOKING",
  "OKONOMI",
  "GENERELT",
] as const;
export type Domene = (typeof DOMENER)[number];

/** Rollen som spør. Avgjør tilgang og tone. */
export const ROLLER = ["SPILLER", "COACH", "ADMIN", "FORELDER"] as const;
export type Rolle = (typeof ROLLER)[number];

/** Kontekstlag, i truth-layer-prioritert rekkefølge. */
export const KONTEKST_KILDER = ["FASIT", "SPILLERDATA", "RAG"] as const;
export type KontekstKilde = (typeof KONTEKST_KILDER)[number];

/** Modell-tier. Velges på oppgave, ikke på agent-identitet. */
export const TIERS = ["haiku", "sonnet", "opus", "lokal"] as const;
export type Tier = (typeof TIERS)[number];

export const klassifiseringSchema = z.object({
  intent: z.enum(INTENTS),
  domene: z.enum(DOMENER),
  rolle: z.enum(ROLLER),
  /** Er dette PII om en mindreårig? Slår av fritekstlogging og tvinger lokal vask. */
  mindreaarig: z.boolean(),
  /** 0–1. Under TERSKEL_LAV_CONFIDENCE faller vi tilbake til generell prompt. */
  confidence: z.number().min(0).max(1),
});
export type Klassifisering = z.infer<typeof klassifiseringSchema>;

export const TERSKEL_LAV_CONFIDENCE = 0.5;

/** Utfall av en interaksjon — speiler AiInteraksjon.utfall. */
export const UTFALL = ["PENDING", "GODKJENT", "AVVIST", "ENDRET", "IGNORERT"] as const;
export type Utfall = (typeof UTFALL)[number];
