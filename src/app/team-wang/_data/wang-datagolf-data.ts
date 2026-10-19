// Server-only: Data Golf for WANG-trenerflaten (pakke 10). Samme lesing som AgencyOS
// pakke 10. Kalles bare etter kanSeDataGolf på siden (coach og admin).

import "server-only";

import {
  TOPPLISTE_KATEGORIER,
  erForsinket,
  hentKatalog,
  hentKilde,
  hentNorskeLive,
  hentNorskeResultater,
  hentOversikt,
  hentProff,
  hentTopplister,
  type TopplisteKategori,
} from "@/lib/admin/datagolf/coach-data";
import type { UserRole } from "@/generated/prisma/client";
import { lesNavngitteProfiler } from "@/lib/deling/profil-lesing";
import { hentDgSpillerVisning } from "@/lib/datagolf/spiller-mot-proff-data";
import { medWangElevData } from "./wang-tilgang";
import type { WangDataGolfData, WangDgElevSide, WangDgSide } from "./wang-datagolf-visning";

export interface WangDgValg {
  id?: string;
  sok?: string;
  tour?: string;
  norske?: string;
  kat?: string;
  aar?: string;
}

export async function hentWangDataGolf(side: WangDgSide, valg: WangDgValg): Promise<WangDataGolfData> {
  if (side === "proffer") {
    const v = { sok: valg.sok, tour: valg.tour || undefined, norskForst: valg.norske === "1" };
    const { rader, turer } = await hentKatalog(v);
    return { side, rader, turer, valg: v };
  }
  if (side === "proff") {
    const dgId = Number.parseInt(valg.id ?? "", 10);
    const p = Number.isFinite(dgId) ? await hentProff(dgId) : null;
    if (!p) return { side, proff: null };
    const t = p.tak;
    return {
      side,
      proff: {
        navn: t.name,
        land: t.country,
        tour: t.primaryTour,
        asOf: t.asOf,
        sgTotal: t.sgTotal,
        sgOtt: t.sgOtt,
        sgApp: t.sgApp,
        sgArg: t.sgArg,
        sgPutt: t.sgPutt,
        driverYards: t.drivingDistY,
        driverTreff: t.drivingAcc,
        dgRang: t.dgRank,
        owgr: t.owgrRank,
        innspill: t.bands.map((b) => ({ band: b.band, lie: b.lie, meter: b.proximityMeters, gir: b.girRate, slag: b.shotCount })),
        sesonger: p.sesonger.map((s) => ({
          tour: s.tour,
          aar: s.year,
          runder: s.rounds,
          snitt: s.avgScore,
          fairway: s.fairwayPct,
          gir: s.girPct,
          putter: s.puttsPerRound,
          sgTotal: s.sgTotal,
        })),
      },
    };
  }
  if (side === "topp") {
    const kat = (TOPPLISTE_KATEGORIER.some((k) => k.id === valg.kat) ? valg.kat : "sgTotal") as TopplisteKategori;
    const tour = valg.tour && /^[a-z]{2,10}$/.test(valg.tour) ? valg.tour : "pga";
    const aarTall = Number(valg.aar);
    const aar = Number.isInteger(aarTall) && aarTall > 2000 ? aarTall : new Date().getUTCFullYear();
    const t = await hentTopplister(kat, tour, aar, 20);
    return {
      side,
      kategorier: TOPPLISTE_KATEGORIER.map((k) => ({ id: k.id, label: k.label })),
      aktiv: t.kategori.id,
      tour,
      aar,
      aarValg: t.aarValg,
      turValg: t.turValg,
      oppdatert: t.oppdatert,
      rader: t.rader,
    };
  }
  if (side === "norske") {
    const [{ spillere, kommende }, live] = await Promise.all([hentNorskeResultater(), hentNorskeLive()]);
    return {
      side,
      live,
      spillere: spillere.map((s) => ({
        id: s.id,
        navn: s.name,
        resultater: s.entries.map((e) => ({
          id: e.id,
          plass: e.position,
          tilPar: e.scoreToPar,
          turnering: e.tournament.name,
          dato: e.tournament.startDate,
        })),
      })),
      kommende: kommende.map((t) => ({ id: t.id, navn: t.name, dato: t.startDate, tour: t.tour })),
    };
  }
  if (side === "kilde") return { side, rader: await hentKilde() };
  const d = await hentOversikt();
  return { side: "oversikt", ...d, forsinket: erForsinket(d.sistSynk ?? d.kildedato) };
}

/**
 * DG-05–07: bare elever som har delt med treneren kan velges, og elevens tall leses bare
 * innenfor delingslåsen (medWangElevData). Null for alle som ikke er coach eller admin.
 */
export async function hentWangDgElev(
  bruker: { id: string; role: UserRole },
  gruppeId: string,
  side: WangDgElevSide,
  valg: { spiller?: string; pro?: string },
): Promise<WangDataGolfData | null> {
  const spillere = await lesNavngitteProfiler(bruker.id, gruppeId, async (tx, id) => {
    const u = await tx.user.findFirst({ where: { id, deletedAt: null, anonymisertAt: null }, select: { id: true, name: true } });
    return u ? { id: u.id, navn: u.name ?? "Ukjent" } : null;
  });
  spillere.sort((a, b) => a.navn.localeCompare(b.navn, "nb"));
  const proffId = Number.parseInt(valg.pro ?? "", 10);
  const v = await hentDgSpillerVisning({
    bruker, spillere, spillerId: valg.spiller, proffId: Number.isFinite(proffId) ? proffId : undefined,
    medSpiller: (id, les) => medWangElevData(bruker, id, (tx) => les(tx)),
  });
  if (!v) return null;
  return { side, v, idag: new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(new Date()) };
}
