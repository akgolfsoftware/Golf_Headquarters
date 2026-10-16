/**
 * Plannivåene henger sammen (Anders 14.10.2026, punkt 2): månedsplan.
 * Rene regler og kontrakter — ingen database. Måneden fordeler timer per akse til
 * ukene sine; en uke måneden har tilpasset står i `weekAxisMinutes` og beholder
 * månedens tall når perioden senere endres («Endret i måneden»).
 */

import { z } from "zod";
import { AxisMinutesSchema, type AxisMinutes } from "@/lib/workbench/perioder";
import { ukerForPeriode, type PeriodeUke } from "@/lib/workbench/periode-ukefordeling-regler";

/** Nøkkel for en uke i `weekAxisMinutes`, f.eks. «2026-U42». Samme format som kvitteringen. */
export function ukeNokkel(isoYear: number, weekNumber: number): string {
  return `${isoYear}-U${weekNumber}`;
}

const UKE_NOKKEL = /^\d{4}-U([1-9]|[1-4]\d|5[0-3])$/;

export const UkeOverstyringerSchema = z.record(z.string().regex(UKE_NOKKEL), AxisMinutesSchema);
export type UkeOverstyringer = z.infer<typeof UkeOverstyringerSchema>;

/** Trygg lesing av weekAxisMinutes-JSON. Ugyldige oppføringer droppes, tomme uker likeså. */
export function parseUkeOverstyringer(json: unknown): UkeOverstyringer {
  if (json == null || typeof json !== "object" || Array.isArray(json)) return {};
  const ut: UkeOverstyringer = {};
  for (const [nokkel, verdi] of Object.entries(json as Record<string, unknown>)) {
    if (!UKE_NOKKEL.test(nokkel)) continue;
    const res = AxisMinutesSchema.safeParse(verdi);
    if (res.success && Object.keys(res.data).length > 0) ut[nokkel] = res.data;
  }
  return ut;
}

/** Input fra månedsskjemaet (delt server/klient). */
export const MaanedInputSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  fokus: z.string().trim().max(200).nullish(),
  notat: z.string().trim().max(2000).nullish(),
  evaluering: z.string().trim().max(4000).nullish(),
  /** Bare uker måneden har tilpasset. Uker uten oppføring følger perioden. */
  uker: UkeOverstyringerSchema.optional(),
});
export type MaanedInput = z.infer<typeof MaanedInputSchema>;

function sisteDagIMaaned(year: number, month: number): string {
  const d = new Date(Date.UTC(year, month, 0));
  return d.toISOString().slice(0, 10);
}

/**
 * Ukene som tilhører måneden og ikke er gått: en uke hører til måneden der torsdagen
 * ligger — samme regel som for perioder, så ingen uke eies av to måneder.
 */
export function ukerForMaaned(year: number, month: number, iDag: string): PeriodeUke[] {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  return ukerForPeriode(start, sisteDagIMaaned(year, month), iDag);
}

/** Alle uker (også gåtte) som tilhører måneden — brukes til å vise hele måneden. */
export function alleUkerIMaaned(year: number, month: number): PeriodeUke[] {
  return ukerForMaaned(year, month, "0000-01-01");
}

/** Hvilke av månedens overstyringer som gjelder uker i måneden og ikke er gått. */
export function gjeldendeOverstyringer(
  overstyringer: UkeOverstyringer,
  year: number,
  month: number,
  iDag: string,
): Array<{ uke: PeriodeUke; minutter: AxisMinutes }> {
  return ukerForMaaned(year, month, iDag).flatMap((uke) => {
    const minutter = overstyringer[ukeNokkel(uke.isoYear, uke.weekNumber)];
    return minutter ? [{ uke, minutter }] : [];
  });
}

/** Alle ukenøkler som er tilpasset av en måned, på tvers av måneder. */
export function overstyrteUkenokler(maaneder: Array<{ weekAxisMinutes: unknown }>): Set<string> {
  const nokler = new Set<string>();
  for (const m of maaneder) for (const k of Object.keys(parseUkeOverstyringer(m.weekAxisMinutes))) nokler.add(k);
  return nokler;
}

export type MaanedKvittering = { antallUker: number; fraUke: string | null; tilUke: string | null };

/** Teksten brukeren ser når en måned er lagret. */
export function maanedKvittering(k: MaanedKvittering | undefined, feilet?: boolean): string {
  if (feilet) return "Måneden er lagret, men ukene ble ikke oppdatert. Prøv å lagre på nytt.";
  if (!k || k.antallUker === 0) return "Måneden er lagret.";
  const uker = k.antallUker === 1 ? "1 uke" : `${k.antallUker} uker`;
  return `Måneden er lagret. ${uker} oppdatert fra og med inneværende uke.`;
}
