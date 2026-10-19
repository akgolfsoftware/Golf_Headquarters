/**
 * Rene regler for Data Golf for coach (DG-02, DG-08, DG-09), skilt ut fra `coach-data.ts`
 * så de kan testes uten database.
 */

/** Norske proffer er spillere i registeret med landkode NO som er koblet til Data Golf. */
export const NORSK_LAND = "NO";
export const norskProffWhere = { dataGolfId: { not: null }, country: NORSK_LAND } as const;

/** Proffer per side i katalogen (DG-02). */
export const KATALOG_PER_SIDE = 50;

/** Gyldig side (1 og oppover, aldri forbi siste) og hvor mange rader som hoppes over. */
export function katalogSide(onsket: number | undefined, totalt: number, perSide = KATALOG_PER_SIDE) {
  const sider = Math.max(1, Math.ceil(totalt / perSide));
  const side = Math.min(sider, Math.max(1, Number.isFinite(onsket) ? Math.trunc(onsket as number) : 1));
  return { side, sider, skip: (side - 1) * perSide, perSide };
}

/** Sidetallet fra adressen (`?side=3`). Alt annet enn et positivt heltall gir side 1. */
export function lesSide(raw: string | undefined): number {
  const n = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export type KildeSynkRad = {
  endpoint: string;
  rowCount: number | null;
  lastStatus: number | null;
  lastError: string | null;
  lastSyncedAt: Date | null;
};

export type KildeRad = { endepunkt: string; rader: number | null; status: number | null; feil: string | null; sist: Date | null };

/**
 * Én rad per endepunkt (DG-09). Synktabellen har én rad per endepunkt og parametersett
 * (f.eks. 3 199 for historiske runder), så radene summeres. Status og tid er fra siste kjøring;
 * feilet noen kjøring, står antallet.
 */
export function samleKilde(rader: KildeSynkRad[]): KildeRad[] {
  const per = new Map<string, KildeSynkRad[]>();
  for (const r of rader) per.set(r.endpoint, [...(per.get(r.endpoint) ?? []), r]);
  return [...per.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([endepunkt, gruppe]) => {
      const kjente = gruppe.filter((r) => r.rowCount != null);
      const siste = gruppe.reduce<KildeSynkRad | null>(
        (best, r) => (r.lastSyncedAt && (!best?.lastSyncedAt || r.lastSyncedAt > best.lastSyncedAt) ? r : best),
        null,
      );
      const feilet = gruppe.filter((r) => r.lastError).length;
      return {
        endepunkt,
        rader: kjente.length ? kjente.reduce((s, r) => s + (r.rowCount ?? 0), 0) : null,
        status: siste?.lastStatus ?? null,
        feil: feilet === 0 ? null : feilet === 1 && gruppe.length === 1 ? "Siste synk feilet." : `${feilet} av ${gruppe.length} kjøringer feilet.`,
        sist: siste?.lastSyncedAt ?? null,
      };
    });
}

/** Adressen til en side i katalogen. Filtrene følger med; side 1 får ikke `sidenr`. */
export function katalogLenke(base: string, faste: Record<string, string | undefined>, nr: number): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(faste)) if (v) q.set(k, v);
  if (nr > 1) q.set("sidenr", String(nr));
  const s = q.toString();
  return s ? `${base}?${s}` : base;
}
