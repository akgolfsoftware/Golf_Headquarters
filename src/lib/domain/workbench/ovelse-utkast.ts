/**
 * Utkastet bak «Legg til øvelse»: ett utkast per pyramidegren, slik at et valg i én
 * gren aldri overskriver det som er fylt ut i en annen (masteren kap. 9). Ren logikk
 * som bygger øvelsen skjemaet sender til serveren.
 */

import { AREA_LABEL } from "@/lib/domain/workbench/labels";
import {
  belastningFraSted,
  feltForOvelse,
  MAALEUTSTYR,
  MENGDE_ENHET,
  STED_HOVED,
  TRENINGSMAATE,
  type StedHoved,
  vaskDetaljer,
  type OvelseDetaljer,
} from "@/lib/domain/workbench/ovelse-detaljer";
import { DIMENSJON_KODER, MOTORIKK_KODER, PRESS_KODER, SAND_TRINN_KODER } from "@/lib/domain/ak-formel-v2";
import type { AKFormel, Belastning, Motorikk, Press, PyramidArea, TrainingArea } from "@/lib/domain/workbench/types";

export type GrenUtkast = {
  area: TrainingArea;
  stedHoved: string;
  stedDelvalg: string;
  maaleutstyr: string;
  motorikk: string;
  hastighet: string;
  sandTrinn: string;
  tekniskFokus: string;
  treningsmaate: string;
  press: string;
  enhet: string;
  antall: string;
  reps: string;
  vektKg: string;
  rir: string;
  pauseSek: string;
  malsetning: string;
  malemetode: string;
  resultatkrav: string;
  notat: string;
};

export type FellesUtkast = { title: string; durationMinutes: number; description: string };

export type OvelseInput = {
  title: string;
  durationMinutes: number;
  description?: string;
  techniqueFocus?: string;
  akFormel: AKFormel;
};

/** Området pyramiden foreslår først. Alle områder kan fortsatt velges. */
export const FORESLATT_OMRADE: Record<PyramidArea, TrainingArea> = {
  FYS: "STYRKE",
  TEK: "TEE",
  SLAG: "TEE",
  SPILL: "BANE",
  TURN: "BANE",
};

export function tomtUtkast(pyramid: PyramidArea): GrenUtkast {
  return {
    area: FORESLATT_OMRADE[pyramid],
    stedHoved: "",
    stedDelvalg: "",
    maaleutstyr: "",
    motorikk: "",
    hastighet: "",
    sandTrinn: "",
    tekniskFokus: "",
    treningsmaate: "",
    press: "",
    enhet: "",
    antall: "",
    reps: "",
    vektKg: "",
    rir: "",
    pauseSek: "",
    malsetning: "",
    malemetode: "",
    resultatkrav: "",
    notat: "",
  };
}

export function tommeUtkast(): Record<PyramidArea, GrenUtkast> {
  return {
    FYS: tomtUtkast("FYS"),
    TEK: tomtUtkast("TEK"),
    SLAG: tomtUtkast("SLAG"),
    SPILL: tomtUtkast("SPILL"),
    TURN: tomtUtkast("TURN"),
  };
}

const tall = (v: string): number | undefined => {
  if (v.trim() === "") return undefined;
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
};

const heltall = (v: string): number | undefined => {
  const n = tall(v);
  return n === undefined ? undefined : Math.round(n);
};

function ett<T extends string>(liste: readonly T[], v: string): T | undefined {
  return (liste as readonly string[]).includes(v) ? (v as T) : undefined;
}

export type ByggResultat = { ok: true; ovelse: OvelseInput } | { ok: false; feil: string };

export function byggOvelse(pyramid: PyramidArea, u: GrenUtkast, felles: FellesUtkast): ByggResultat {
  const title = felles.title.trim();
  if (!title) return { ok: false, feil: "Øvelsen må ha et navn." };
  if (!Number.isFinite(felles.durationMinutes) || felles.durationMinutes < 1) {
    return { ok: false, feil: "Varigheten må være minst ett minutt." };
  }

  const felt = feltForOvelse(pyramid, u.area);
  const motorikk = felt.laeringssteg ? ett(MOTORIKK_KODER, u.motorikk) : undefined;
  const press = felt.press ? ett(PRESS_KODER, u.press) : undefined;
  const stedHoved = ett(STED_HOVED, u.stedHoved);
  const enhet = ett(MENGDE_ENHET, u.enhet) ?? felt.mengde.enheter[0];

  const rå: OvelseDetaljer = {
    hastighetProsent: (heltall(u.hastighet) as OvelseDetaljer["hastighetProsent"]) ?? undefined,
    tekniskFokus: ett(DIMENSJON_KODER, u.tekniskFokus),
    sandTrinn: ett(SAND_TRINN_KODER, u.sandTrinn),
    sted: stedHoved ? { hoved: stedHoved, delvalg: u.stedDelvalg || undefined } : undefined,
    maaleutstyr: ett(MAALEUTSTYR, u.maaleutstyr),
    treningsmaate: ett(TRENINGSMAATE, u.treningsmaate),
    mengde:
      tall(u.antall) !== undefined
        ? {
            enhet,
            antall: heltall(u.antall),
            reps: heltall(u.reps),
            vektKg: tall(u.vektKg),
            rir: heltall(u.rir),
            pauseSek: heltall(u.pauseSek),
          }
        : undefined,
    mal:
      u.malemetode || u.resultatkrav || u.notat
        ? { malemetode: u.malemetode, resultatkrav: u.resultatkrav, notat: u.notat }
        : undefined,
  };
  const detaljer = vaskDetaljer(pyramid, u.area, motorikk, stripUndefined(rå));

  const akFormel: AKFormel = {
    pyramid,
    area: u.area,
    label: `${pyramid} · ${AREA_LABEL[u.area]}`,
    ...(motorikk ? { motorikk: motorikk as Motorikk } : {}),
    ...(press ? { press: press as Press } : {}),
    ...(stedHoved && detaljer?.sted ? { belastning: workbenchBelastning(stedHoved, detaljer.sted.delvalg) } : {}),
    ...(detaljer ? { detaljer } : {}),
  };

  return {
    ok: true,
    ovelse: {
      title,
      durationMinutes: Math.round(felles.durationMinutes),
      ...(felles.description.trim() ? { description: felles.description.trim() } : {}),
      ...(u.malsetning.trim() ? { techniqueFocus: u.malsetning.trim() } : {}),
      akFormel,
    },
  };
}

/** Workbench skriver miljøverdien «TRENINGSOMRADE»; formelen «TRENINGSOMRAADE». */
function workbenchBelastning(hoved: StedHoved, delvalg: string | undefined): Belastning {
  const b = belastningFraSted(hoved, delvalg);
  return b === "TRENINGSOMRAADE" ? "TRENINGSOMRADE" : b;
}

function stripUndefined(d: OvelseDetaljer): OvelseDetaljer {
  const ut: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(d)) if (v !== undefined) ut[k] = v;
  return ut as OvelseDetaljer;
}
