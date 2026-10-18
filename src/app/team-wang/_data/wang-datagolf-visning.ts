// Visningsmodellen for Data Golf i WANG-trenerflaten (pakke 10). Dataene hentes på
// serveren med samme modul som AgencyOS (src/lib/admin/datagolf/coach-data.ts), og
// bare når kanSeDataGolf slipper brukeren inn (coach og admin, aldri elever).

import type { DgSpillerVisning } from "@/lib/datagolf/spiller-mot-proff-data";

export type WangDgSide = "oversikt" | "proffer" | "proff" | "topp" | "norske" | "kilde";
/** DG-05 Elev mot proff, DG-06 Innspill-tak og DG-07 Fra funn til forslag. */
export type WangDgElevSide = "spiller" | "innspill" | "forslag";

export interface WangDgProff {
  dgId: number;
  navn: string;
  land: string | null;
  tour: string | null;
  sgTotal: number | null;
  dgRang: number | null;
  owgr: number | null;
  norsk: boolean;
}

export type WangDataGolfData =
  | {
      side: "oversikt";
      antallProffer: number;
      kildedato: Date | null;
      sistSynk: Date | null;
      feiletSynk: number;
      endepunkter: number;
      forsinket: boolean;
      norske: WangDgProff[];
    }
  | { side: "proffer"; rader: WangDgProff[]; turer: string[]; valg: { sok?: string; tour?: string; norskForst?: boolean } }
  | {
      side: "proff";
      proff: null | {
        navn: string;
        land: string | null;
        tour: string | null;
        asOf: Date;
        sgTotal: number | null;
        sgOtt: number | null;
        sgApp: number | null;
        sgArg: number | null;
        sgPutt: number | null;
        driverYards: number | null;
        driverTreff: number | null;
        dgRang: number | null;
        owgr: number | null;
        innspill: { band: string; lie: string; meter: number | null; gir: number | null; slag: number | null }[];
        sesonger: { tour: string; aar: number; runder: number | null; snitt: number | null; fairway: number | null; gir: number | null; putter: number | null; sgTotal: number | null }[];
      };
    }
  | {
      side: "topp";
      kategorier: { id: string; label: string }[];
      aktiv: string;
      tour: string;
      aar: number;
      aarValg: number[];
      turValg: string[];
      oppdatert: Date | null;
      rader: { dgId: number; navn: string; land: string | null; runder: number | null; verdi: number | null }[];
    }
  | {
      side: "norske";
      spillere: { id: string; navn: string; resultater: { id: string; plass: number | null; tilPar: number | null; turnering: string; dato: Date }[] }[];
      kommende: { id: string; navn: string; dato: Date; tour: string | null }[];
    }
  | { side: "kilde"; rader: { endepunkt: string; rader: number | null; status: number | null; feil: string | null; sist: Date | null }[] }
  | { side: WangDgElevSide; v: DgSpillerVisning; idag: string };

/** Fanen i adressen (`fane=dg…`) til siden i Data Golf. */
export function dgSideFraFane(fane?: string): WangDgSide | WangDgElevSide | null {
  if (fane === "dg-spiller") return "spiller";
  if (fane === "dg-innspill") return "innspill";
  if (fane === "dg-forslag") return "forslag";
  if (fane === "dg") return "oversikt";
  if (fane === "dg-proffer") return "proffer";
  if (fane === "dg-proff") return "proff";
  if (fane === "dg-topp") return "topp";
  if (fane === "dg-norske") return "norske";
  if (fane === "dg-kilde") return "kilde";
  return null;
}
