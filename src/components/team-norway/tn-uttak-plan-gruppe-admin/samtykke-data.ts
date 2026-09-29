import { DELING_SCOPES, harGyldigSamtykke, type DelingSamtykkeRad, type DelingScope } from "@/lib/deling/samtykke-regler";

/**
 * Rene regler for samtykkedelen av TN-19 Tilgang og samtykke.
 * Bygger på samtykke-regler.ts (nyeste rad vinner, mindreårige krever
 * FORESATT). Ingen database her — lasteren ligger i samtykke-hent.ts.
 */

export type TnDelingStatus = "DELT" | "VENTER_FORELDER" | "TRUKKET" | "IKKE_DELT";
export type TnDelingGruppe = "delt" | "venter" | "ikke";

export const SCOPE_NAVN: Record<DelingScope, string> = {
  TEST_RESULTATER: "Tester",
  STATS: "Statistikk",
  KOMPLETT_PROFIL: "Komplett profil",
};

export type TnDelingVurdering = {
  status: TnDelingStatus;
  /** Tidspunktet statusen bygger på. Null når ingenting er registrert. */
  dato: Date | null;
  scopes: DelingScope[];
  foresattGodkjent: boolean;
};

const nyest = (rader: readonly DelingSamtykkeRad[]) => rader.reduce<DelingSamtykkeRad | null>((a, r) => (!a || r.createdAt > a.createdAt ? r : a), null);

export function vurderDeling(rader: readonly DelingSamtykkeRad[], gruppeId: string, kreverForesatt: boolean): TnDelingVurdering {
  const mine = rader.filter((r) => r.mottakerGruppeId === gruppeId);
  const scopes = DELING_SCOPES.filter((scope) => harGyldigSamtykke(mine, { scope, mottakerGruppeId: gruppeId, kreverForesatt }));

  if (scopes.length > 0) {
    const gjeldende = scopes
      .map((scope) => nyest(mine.filter((r) => r.scope === scope && (!kreverForesatt || r.gittAvRolle === "FORESATT"))))
      .filter((r): r is DelingSamtykkeRad => r !== null);
    const siste = nyest(gjeldende);
    return { status: "DELT", dato: siste?.createdAt ?? null, scopes, foresattGodkjent: gjeldende.some((r) => r.gittAvRolle === "FORESATT") };
  }

  const siste = nyest(mine);
  if (!siste) return { status: "IKKE_DELT", dato: null, scopes: [], foresattGodkjent: false };

  if (kreverForesatt) {
    const sisteSelv = nyest(mine.filter((r) => r.gittAvRolle === "SELV"));
    const sisteForesatt = nyest(mine.filter((r) => r.gittAvRolle === "FORESATT"));
    const foresattEtter = sisteForesatt && sisteSelv && sisteForesatt.createdAt > sisteSelv.createdAt;
    if (sisteSelv?.gitt && !foresattEtter) return { status: "VENTER_FORELDER", dato: sisteSelv.createdAt, scopes: [], foresattGodkjent: false };
  }

  const trukket = nyest(mine.filter((r) => !r.gitt));
  if (trukket && mine.some((r) => r.gitt)) return { status: "TRUKKET", dato: trukket.createdAt, scopes: [], foresattGodkjent: false };
  return { status: "IKKE_DELT", dato: null, scopes: [], foresattGodkjent: false };
}

export function delingGruppe(status: TnDelingStatus): TnDelingGruppe {
  return status === "DELT" ? "delt" : status === "VENTER_FORELDER" ? "venter" : "ikke";
}

export function lesDelingFilter(verdi: string | string[] | undefined): TnDelingGruppe | "alle" {
  const v = Array.isArray(verdi) ? verdi[0] : verdi;
  return v === "delt" || v === "venter" || v === "ikke" ? v : "alle";
}
