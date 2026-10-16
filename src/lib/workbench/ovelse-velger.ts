/**
 * Øvelsesvelgeren i Workbench (beslutning 16.10.2026): søk i alle øvelser, mest brukt først.
 * Fasit: docs/design-system/utkast-playerhq/workbench-ovelser.html.
 *
 * Ren modul uten database (testet i ovelse-velger.test.ts). «Mest brukt» er antall
 * WorkbenchDrill med exerciseId i spillerens økter, alle økter, uten tidsvindu.
 */
import type { PyramidArea } from "@/lib/domain/workbench/types";

export type VelgerOvelse = {
  id: string;
  navn: string;
  pyramide: PyramidArea;
  /** Treningsområdet som tekst, null når øvelsen ikke har det. */
  omraade: string | null;
  /** Spillerens egen øvelse. */
  egen: boolean;
  /** Antall ganger øvelsen er lagt inn i spillerens økter i Workbench. */
  brukt: number;
  min: number | null;
};

export type VelgerResultat = { treff: VelgerOvelse[]; antall: number };

/** Hvor mange ganger hver øvelse er lagt inn. Rader uten øvelse telles ikke. */
export function tellBruk(rader: readonly { exerciseId: string | null }[]): Map<string, number> {
  const bruk = new Map<string, number>();
  for (const r of rader) if (r.exerciseId) bruk.set(r.exerciseId, (bruk.get(r.exerciseId) ?? 0) + 1);
  return bruk;
}

const norm = (s: string) => s.toLocaleLowerCase("nb-NO").replace(/\s+/g, " ").trim();

/** Søkeordet treffer navn eller treningsområde, uten hensyn til store og små bokstaver. */
export function treffer(o: Pick<VelgerOvelse, "navn" | "omraade">, q: string): boolean {
  const s = norm(q);
  if (!s) return true;
  return norm(`${o.navn} ${o.omraade ?? ""}`).includes(s);
}

/** Mest brukt først, deretter navn i norsk rekkefølge. */
export function sorterMestBrukt<T extends Pick<VelgerOvelse, "navn" | "brukt">>(liste: readonly T[]): T[] {
  return [...liste].sort((a, b) => b.brukt - a.brukt || a.navn.localeCompare(b.navn, "nb-NO"));
}

/** Filtrer på søk og pyramide, sorter mest brukt først og kutt lista ved grensen. */
export function velgOvelser(
  alle: readonly VelgerOvelse[],
  valg: { q?: string; pyramide?: PyramidArea | null; grense: number },
): VelgerResultat {
  const passer = alle.filter((o) => (!valg.pyramide || o.pyramide === valg.pyramide) && treffer(o, valg.q ?? ""));
  return { treff: sorterMestBrukt(passer).slice(0, valg.grense), antall: passer.length };
}

/** «14× lagt inn» eller «—» når øvelsen aldri er brukt. */
export function bruktTekst(brukt: number): string {
  return brukt > 0 ? `${brukt}× lagt inn` : "—";
}
