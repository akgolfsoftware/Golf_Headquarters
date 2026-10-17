/**
 * Vurderingen etter økta (PH-07, pakke 2 Treningsøkta).
 *
 * Belastning (golføkt) og «Hvor tungt» (fysisk økt) er samme skala 1–10 og lagres i
 * `WorkbenchSession.perceivedEffort`. Fokus 1–10 (bare golføkt) har ingen egen kolonne og
 * lagres i `liveSnapshot.etterOkta`, ved siden av gjennomføringshistorikken. Ukjente felt i
 * snapshotet bevares alltid.
 */
import { z } from "zod";
import { jsonObject } from "./wb-session-life";

const Skala = z.number().int().min(1).max(10);
const EtterOktaSchema = z.object({ fokus: Skala.nullable(), lagretISO: z.string() }).passthrough();

export type OktType = "golf" | "fys";

/** Fysisk økt får «Hvor tungt», alle andre akser Belastning og Fokus. */
export function oktTypeFraPyramide(pyramide: string | null | undefined): OktType {
  return (pyramide ?? "").toUpperCase() === "FYS" ? "fys" : "golf";
}

export function gyldigSkala(v: unknown): v is number {
  return Skala.safeParse(v).success;
}

/** Leser fokus fra snapshotet. Mangler eller er ugyldig: null. */
export function lesFokus(liveSnapshot: unknown): number | null {
  const raw = jsonObject(liveSnapshot);
  const parsed = EtterOktaSchema.safeParse(raw?.etterOkta);
  return parsed.success ? parsed.data.fokus : null;
}

/** Nytt snapshot med fokus lagt inn. Kaster ved et snapshot som ikke er et objekt. */
export function medFokus(liveSnapshot: unknown, fokus: number | null, nowISO: string): Record<string, unknown> {
  const raw = liveSnapshot == null ? {} : jsonObject(liveSnapshot);
  if (!raw) throw new Error("Eldre gjennomføringsdata må gjennomgås. Ingen data er endret.");
  return { ...raw, etterOkta: { fokus, lagretISO: nowISO } };
}

/**
 * Belastningen kan settes én gang her. Er den alt satt til en annen verdi, rettes den i
 * Workbench med årsak (etterregistrering), så historikken ikke skrives over i stillhet.
 */
export function nyBelastning(lagret: number | null, valgt: number): { ok: true; verdi: number } | { ok: false; feil: string } {
  if (lagret == null || lagret === valgt) return { ok: true, verdi: valgt };
  return { ok: false, feil: "Belastningen er alt lagret. Rett den i Workbench med årsak." };
}
