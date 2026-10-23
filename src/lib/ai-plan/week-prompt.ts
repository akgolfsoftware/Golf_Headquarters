import { z } from "zod";
import { SG_FOKUS_LABEL } from "@/lib/workbench/fokus";
import { STANDARD_OKT_ANTALL, STANDARD_PYRAMIDE } from "@/lib/plan-engine/standard-fordeling";

const sgArea = z.enum(["OTT", "APP", "ARG", "PUTT"]);
const phase = z.enum(["GRUNN", "SPESIAL", "TURNERING", "EVALUERING", "TESTUKE", "FERIE", "TRENINGSSAMLING", "HELDAGSSAMLING", "RESTITUSJON"]);
const category = z.enum(["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"]);
const boundedInt = (max: number) => z.number().int().min(0).max(max).nullable().catch(null);
const contextSchema = z.object({
  daysUntilTournament: boundedInt(366),
  completedSessions: boundedInt(200),
  sgWeaknesses: z.array(z.unknown()).max(5).catch([]),
}).catch({ daysUntilTournament: null, completedSessions: null, sgWeaknesses: [] });
const signalsSchema = z.object({
  fokus: z.object({
    kategori: sgArea.nullable().catch(null),
    kilde: z.enum(["coach", "sg-gap"]).nullable().catch(null),
  }).nullable().catch(null),
  aktivFase: phase.nullable().catch(null),
  adherencePct: z.number().min(0).max(100).nullable().catch(null),
  okterPerUke: boundedInt(21),
  foretrukneDager: z.array(z.unknown()).max(7).catch([]),
}).catch({ fokus: null, aktivFase: null, adherencePct: null, okterPerUke: null, foretrukneDager: [] });
const day = z.number().int().min(1).max(7);
const dayNames = ["man", "tir", "ons", "tor", "fre", "lør", "søn"];

/** Only allowlisted enums and bounded numbers may reach the model. No raw text slot. */
export function buildWeekPrompt(rawContext: unknown, rawSignals: unknown, rawCategory: unknown): string {
  const ctx = contextSchema.parse(rawContext);
  const weaknesses = [...new Set(ctx.sgWeaknesses.flatMap((value) => {
    const result = sgArea.safeParse(value);
    return result.success ? [SG_FOKUS_LABEL[result.data]] : [];
  }))];
  const signals = signalsSchema.parse(rawSignals);
  const lines = ["Kommende uke (0=mandag, 6=søndag)."];
  lines.push(ctx.daysUntilTournament === null
    ? "Neste turnering: ikke oppgitt i underlaget."
    : `Planlagt turnering: ${ctx.daysUntilTournament < 7 ? "innen sju dager" : ctx.daysUntilTournament < 28 ? "om én til fire uker" : "senere enn fire uker"}.`);
  lines.push(weaknesses.length
    ? `Registrerte negative SG-signaler: ${weaknesses.join(", ")}. Dette dokumenterer ikke en trend eller årsak.`
    : "SG-svakheter: ikke dokumentert i dette underlaget.");
  lines.push(ctx.completedSessions === null
    ? "Fullførte økter siste 14 dager: ukjent."
    : `Registrerte fullførte økter i TrainingSessionV2 siste 14 dager: ${ctx.completedSessions}. Dette er ikke samlet treningsbelastning eller antall treningsdager.`);
  if (signals.fokus?.kategori && signals.fokus.kilde) {
    const source = signals.fokus.kilde === "coach" ? "coachens periodefokus" : "beregnet SG-område";
    lines.push(`Fokusområde (${source}): ${SG_FOKUS_LABEL[signals.fokus.kategori]}.`);
  }
  if (signals.aktivFase) lines.push(`Aktiv treningsperiode: ${signals.aktivFase}.`);
  if (signals.adherencePct !== null && signals.adherencePct < 75) {
    lines.push(`Plan-etterlevelse siste 4 uker: ${Math.round(signals.adherencePct)} % — gjør variantene overkommelige.`);
  }
  if (signals.okterPerUke !== null) lines.push(`Ønsket antall økter fra onboarding: ${signals.okterPerUke}.`);
  const days = [...new Set(signals.foretrukneDager.flatMap((value) => {
    const result = day.safeParse(value);
    return result.success ? [dayNames[result.data - 1]] : [];
  }))];
  if (days.length) lines.push(`Foretrukne treningsdager: ${days.join(", ")}.`);
  const level = category.safeParse(rawCategory);
  if (level.success) {
    const pyr = STANDARD_PYRAMIDE[level.data];
    lines.push(`Eksisterende standardreferanse kategori ${level.data}: FYS ${pyr.FYS} % · TEK ${pyr.TEK} % · SLAG ${pyr.SLAG} % · SPILL ${pyr.SPILL} % · TURN ${pyr.TURN} %. Dette er en mal, ikke målt individuell fordeling.`);
    if (signals.aktivFase && signals.aktivFase !== "RESTITUSJON") {
      lines.push(`Standardreferansens øktantall for oppgitt fase: ${STANDARD_OKT_ANTALL[level.data][signals.aktivFase]}.`);
    }
  }
  lines.push(
    "Lag tre varianter (konservativ, standard, aggressiv) for kommende uke.",
    "Bruk pyramidområdene: FYS (fysisk), TEK (teknikk), SLAG (slagtrening), SPILL (banespill), TURN (turneringssimulering).",
    "Vurder oppgitt fokus og en nært forestående turnering. Manglende data betyr ukjent, ikke null. Ikke utled helse, skader, årsak eller sikker effekt.",
    "focusBlend er en kort beskrivelse av foreslått fordeling. Standardreferansen er ikke bevis for at fordelingen passer denne spilleren.",
    "Titler i norsk klarspråk uten fagkoder. Skriv «nærspill», aldri «kort spill».",
  );
  return lines.join("\n");
}
