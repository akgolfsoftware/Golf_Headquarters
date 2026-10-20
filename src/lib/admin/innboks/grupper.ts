/**
 * Innboks (AG-04): lista deles i Haster · I dag · Tidligere, som tegningen
 * «Innboks» på canvaset «AgencyOS nøkkelskjermer» (godkjent 20.10.2026).
 * Ren modul: ingen Prisma, ingen React.
 */
import type { InnboksPost } from "./bygg-innboks";

export const INNBOKS_GRUPPER = ["Haster", "I dag", "Tidligere"] as const;
export type InnboksGruppe = (typeof INNBOKS_GRUPPER)[number];

/**
 * Haster: spørsmål ubesvart over 24 t, eller oppfølgingssak i Risiko.
 * I dag: `at` er bare klokkeslett — `tidTekst` skriver dato for alt som ikke er i dag (Oslo-tid).
 */
export function innboksGruppe(p: Pick<InnboksPost, "haster" | "risiko" | "lost" | "at">): InnboksGruppe {
  if ((p.haster || p.risiko) && !p.lost) return "Haster";
  return /^\d{2}:\d{2}$/.test(p.at.trim()) ? "I dag" : "Tidligere";
}

/** Grupperer i fast rekkefølge og dropper tomme grupper. Rekkefølgen inni gruppa beholdes. */
export function grupperInnboks<T extends Pick<InnboksPost, "haster" | "risiko" | "lost" | "at">>(poster: T[]): { navn: InnboksGruppe; poster: T[] }[] {
  return INNBOKS_GRUPPER
    .map((navn) => ({ navn, poster: poster.filter((p) => innboksGruppe(p) === navn) }))
    .filter((g) => g.poster.length > 0);
}
