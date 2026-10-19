// Visningsmodell for elevdata i WANG-trenerflaten (pakke 7 Elever): klasse, kategori A–K og HCP
// per elev, og Fireukerssjekken én elev har delt. Ren modul uten database, trygg i klienten.
// Serverhentingen står i wang-elevdata.ts.

import { formaterTall } from "@/lib/format-tall";
import type { IupBesvarelse } from "@/lib/iup/utviklingssjekk";

export interface WangElevInfo {
  /** VG1 | VG2 | VG3 fra elevens profil. null = ikke satt. */
  klasse: string | null;
  /** Eleven har delt profilen med denne treneren (navngitt deling, forelder under 16). */
  delt: boolean;
  /** Bare når delt. */
  hcp: number | null;
  /** A–K. Bare når delt. */
  kategori: string | null;
}

export type WangElevdata = Record<string, WangElevInfo>;

export const TOM_ELEVINFO: WangElevInfo = { klasse: null, delt: false, hcp: null, kategori: null };

export type WangFireukerssjekk =
  | { status: "ikke-delt" }
  | {
      status: "delt";
      /** Leverte fireukerssjekker, nyeste først. Utkast forlater aldri elevens skjerm. */
      runder: Array<{
        id: string;
        periodeStart: string;
        periodeSlutt: string;
        levert: string;
        /** null = kilde- eller formatavvik, vises ikke. */
        innhold: IupBesvarelse | null;
      }>;
      /** Titler på prosessmålene svarene viser til (Goal-ID → tittel). */
      prosessmal: Record<string, string>;
    };

/** Filterverdien for elever uten klasse i profilen. */
export const UTEN_KLASSE = "uten";

/** Klassene som finnes i gruppa, sortert (VG1, VG2, VG3). */
export function klasserIGruppa(elever: ReadonlyArray<{ id: string }>, elevdata: WangElevdata): string[] {
  const klasser = new Set<string>();
  for (const e of elever) {
    const k = elevdata[e.id]?.klasse;
    if (k) klasser.add(k);
  }
  return [...klasser].sort((a, b) => a.localeCompare(b, "nb"));
}

/** Søk på navn og filter på klasse. Tom klasse = alle. */
export function filtrerElever<T extends { id: string; navn: string }>(
  elever: ReadonlyArray<T>,
  elevdata: WangElevdata,
  { sok, klasse }: { sok: string; klasse: string },
): T[] {
  const s = sok.trim().toLowerCase();
  return elever.filter((e) => {
    if (s && !e.navn.toLowerCase().includes(s)) return false;
    if (!klasse) return true;
    const k = elevdata[e.id]?.klasse ?? null;
    return klasse === UTEN_KLASSE ? k === null : k === klasse;
  });
}

/** «4,2», «+1,3» for plusshandicap, «—» når ukjent. */
export function visHcp(hcp: number | null): string {
  if (hcp == null) return "—";
  const tall = formaterTall(Math.abs(hcp), 1, true);
  return hcp < 0 ? `+${tall}` : tall;
}

/** Undertekst i Elevlista: «VG2 · Kategori F · HCP 4,2» eller «VG2 · Ikke delt». */
export function elevLinje(info: WangElevInfo): string {
  const klasse = info.klasse ?? "Klasse ikke satt";
  if (!info.delt) return `${klasse} · Ikke delt`;
  return `${klasse} · Kategori ${info.kategori ?? "—"} · HCP ${visHcp(info.hcp)}`;
}
