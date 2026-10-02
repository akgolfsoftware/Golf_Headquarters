import { Prisma } from "@/generated/prisma/client";
import { AkFormelLeseSchema, AkFormelSchema } from "@/lib/domain/workbench/schemas";
import type { AKFormel } from "@/lib/domain/workbench/types";

type JsonFelt = { [key: string]: true | JsonFelt };
export const FORMEL_FELT: JsonFelt = {
  pyramid: true, area: true, label: true, motorikk: true, belastning: true, press: true,
  detaljer: {
    hastighetProsent: true, tekniskFokus: true, sandTrinn: true, maaleutstyr: true, treningsmaate: true,
    kondisjonssegmenter: true, utstyr: true,
    sted: { hoved: true, delvalg: true },
    mengde: { enhet: true, antall: true, reps: true, vektKg: true, rir: true, pauseSek: true },
    mal: { malsetning: true, malemetode: true, resultatkrav: true, notat: true },
  },
};

/** Editorens kjente felter kan tømmes uten å slette historiske felt på samme JSON-nivå. */
const LISTE_FELT: Record<string, readonly string[]> = {
  kondisjonssegmenter: ["minutter", "pulssone"], utstyr: ["navn", "antall"],
};

function uendretKjentListe(gammel: Prisma.JsonValue | undefined, ny: Prisma.InputJsonValue | null, keys: readonly string[]): boolean {
  return Array.isArray(gammel) && Array.isArray(ny) && gammel.length === ny.length && gammel.every((post, i) => {
    const next = ny[i];
    return post !== null && typeof post === "object" && !Array.isArray(post) &&
      next !== null && typeof next === "object" && !Array.isArray(next) &&
      keys.every(key => Object.is(post[key], next[key]));
  });
}

function erDrillJsonObjekt(value: Prisma.InputJsonValue | null | undefined): value is Prisma.InputJsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function bevarHistoriskeDrillfelt(gammel: Prisma.JsonValue, ny: Prisma.InputJsonObject, felt: JsonFelt): Prisma.InputJsonObject {
  const ut: Record<string, Prisma.InputJsonValue | null> = Object.create(null);
  const gammelObj = gammel && typeof gammel === "object" && !Array.isArray(gammel) ? gammel : {};
  for (const [key, value] of Object.entries(gammelObj)) {
    if (!Object.hasOwn(felt, key) && value !== undefined) ut[key] = value;
  }
  for (const [key, spec] of Object.entries(felt)) {
    const value = ny[key];
    if (spec !== true) {
      const nextObj = erDrillJsonObjekt(value) ? value : {};
      const merged = bevarHistoriskeDrillfelt(gammelObj[key] ?? null, nextObj, spec);
      if (Object.keys(merged).length) ut[key] = merged;
    } else if (value !== undefined) {
      // Ved urelatert redigering består ufortolkede felt inne i gamle poster.
      // En bevisst listeendring eller tømming erstatter hele listen.
      ut[key] = LISTE_FELT[key] && uendretKjentListe(gammelObj[key], value, LISTE_FELT[key]) ? (gammelObj[key] ?? value) : value;
    }
  }
  return ut;
}

/** Historisk RIR 5–10 kan bare bestå dersom samme verdi allerede er lagret. */
export function gyldigFormelEndring(gammel: Prisma.JsonValue, ny: AKFormel): boolean {
  if (AkFormelSchema.safeParse(ny).success) return true;
  const lest = AkFormelLeseSchema.safeParse(gammel);
  const rir = ny.detaljer?.mengde?.rir;
  if (!lest.success || rir === undefined || rir <= 4 || rir !== lest.data.detaljer?.mengde?.rir) return false;
  return AkFormelSchema.safeParse({ ...ny, detaljer: { ...ny.detaljer, mengde: { ...ny.detaljer?.mengde, rir: undefined } } }).success;
}
