// DB-first datahenting for GFGK Junior-micrositen.
// AgencyOS (Workbench, /admin/grupper) er ALLTID master: finnes gruppa i databasen
// brukes dens faste økter, perioder og samlinger — designinnholdet i
// gfgk-junior-data.ts er kun fallback til gruppene er opprettet.
// Sidene bruker revalidate = 300, så endringer i Workbench er ute innen 5 min.
import { hentGruppeKalenderData } from "@/lib/gruppe-kalender/hent-data";
import type { GruppeKalenderData } from "@/lib/gruppe-kalender/types";

import { GRUPPE_KEYS, UKEPLAN, type GruppeKey, type UkeOkt } from "./gfgk-junior-data";

// Samme gruppenavn som den opprinnelige /gfgk-junior-kalenderen (og opprett-scriptet).
export const GRUPPE_DB_NAVN: Record<GruppeKey, string> = {
  U10: "GFGK Junior Mini U10",
  U13: "GFGK Junior Basis U13",
  U15: "GFGK Junior Utvikling U15",
  U19: "GFGK Junior Elite U19",
};

const DAG_NAVN = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];

function typeFraTittel(tittel: string): UkeOkt["type"] {
  const t = tittel.toLowerCase();
  if (t.includes("lek")) return "lek";
  if (t.includes("fys")) return "fysisk";
  if (t.includes("spill") || t.includes("bane")) return "spill";
  return "teknikk";
}

function dbTilUkeplan(data: GruppeKalenderData): UkeOkt[] {
  return data.faste.map((f) => {
    // hent-data bruker 0 = mandag … 6 = søndag; UkeOkt.wd bruker JS getDay (0 = søndag).
    const jsWd = (f.weekday + 1) % 7;
    return {
      wd: jsWd,
      dag: DAG_NAVN[jsWd],
      tid: `${f.startTime}–${f.endTime}`,
      type: typeFraTittel(f.title),
      sted: "GFGK",
      beskrivelse: f.title,
    };
  });
}

export interface GfgkGruppeData {
  key: GruppeKey;
  kilde: "agencyos" | "fallback";
  ukeplan: UkeOkt[];
  db: GruppeKalenderData | null;
}

export async function hentGfgkGruppe(key: GruppeKey): Promise<GfgkGruppeData> {
  try {
    const db = await hentGruppeKalenderData(GRUPPE_DB_NAVN[key]);
    if (db && db.faste.length > 0) {
      return { key, kilde: "agencyos", ukeplan: dbTilUkeplan(db), db };
    }
    return { key, kilde: "fallback", ukeplan: UKEPLAN[key], db };
  } catch {
    // Bygg/CI kjører uten ekte DB — designinnholdet er alltid trygg fallback.
    return { key, kilde: "fallback", ukeplan: UKEPLAN[key], db: null };
  }
}

export async function hentAlleGfgkGrupper(): Promise<Record<GruppeKey, GfgkGruppeData>> {
  const alle = await Promise.all(GRUPPE_KEYS.map((k) => hentGfgkGruppe(k)));
  return Object.fromEntries(alle.map((g) => [g.key, g])) as Record<GruppeKey, GfgkGruppeData>;
}
