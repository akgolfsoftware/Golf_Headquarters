/** Valgt PH-01 v1.0: visningsregler uten datatilgang eller mutasjoner. */
import type { WeekPlanProgress } from "@/app/portal/actions";
import type { IDagPrikk } from "./idag-visning";

type LaastPlanData<TNaa, TNeste, THendelse, TGodkjenning, TFangst> = {
  naa: TNaa | null;
  neste: TNeste | null;
  hendelser: THendelse[];
  godkjenninger: TGodkjenning[];
  fangstOkt: TFangst | null;
  valgtOktId?: string;
  okterUke: number;
  fullfortUke: number;
  prikker: IDagPrikk[];
  weekProgress: WeekPlanProgress;
};

/**
 * Gratis/TALENT kan bruke åpne spillerflater, men skal ikke få planinnhold
 * serialisert til klienten. Kalenderhendelser som ikke er økter beholdes.
 */
export function skjulLaastPlanData<
  TNaa,
  TNeste,
  THendelse extends { lag: string },
  TGodkjenning,
  TFangst,
>(
  planLaast: boolean,
  data: LaastPlanData<TNaa, TNeste, THendelse, TGodkjenning, TFangst>,
): LaastPlanData<TNaa, TNeste, THendelse, TGodkjenning, TFangst> {
  if (!planLaast) return data;
  return {
    naa: null,
    neste: null,
    hendelser: data.hendelser.filter((hendelse) => hendelse.lag !== "OEKTER"),
    godkjenninger: [],
    fangstOkt: null,
    valgtOktId: undefined,
    okterUke: 0,
    fullfortUke: 0,
    prikker: data.prikker.map((prikk) => ({ ...prikk, fylt: false })),
    weekProgress: {
      plannedMin: 0,
      completedMin: 0,
      plannedByAxis: { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 },
      completedByAxis: { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 },
    },
  };
}

export function sgAkse(verdi: number | null) {
  if (verdi == null || !Number.isFinite(verdi)) return null;
  const grense = Math.max(2, Math.ceil(Math.abs(verdi)));
  return { grense, start: verdi < 0 ? 50 + (verdi / grense) * 50 : 50, bredde: Math.abs(verdi / grense) * 50 };
}

/** Et ubesvart forslag sperrer bare sin egen økt, aldri en annen aktiv økt. */
export function valgtGodkjenningsforslag<T extends { id: string }>(
  forslag: readonly T[], naaId: string | undefined, harNaa: boolean,
): T | null {
  return (naaId ? forslag.find((g) => g.id === naaId) : undefined) ?? (!harNaa ? forslag[0] : undefined) ?? null;
}
