/**
 * Server-data til PH-01 prikk-måned og «Neste».
 * Workbench (synlig for spiller) + TrainingSessionV2.
 */
import "server-only";
import { prisma } from "@/lib/prisma";
import {
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from "@/lib/uke-helpers";
import { SPILLER_SYNLIGE_STATUSER, tilDatoKolonne } from "@/lib/workbench/wb-map";

const ISO = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" });

function isoLokal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dag = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dag}`;
}

export type IDagNeste = {
  tittel: string;
  meta: string;
  datoIso: string;
};

export type IDagKalender = {
  ferdigeDager: number[];
  okterDenneUken: number;
  neste: IDagNeste | null;
};

export async function hentIDagKalender(playerId: string, naa: Date): Promise<IDagKalender> {
  const mStart = startOfMonth(naa);
  const mSlutt = endOfMonth(naa);
  const uStart = startOfWeek(naa);
  const uSlutt = endOfWeek(naa);
  const iDagIso = ISO.format(naa);

  const [wbMnd, v2Mnd, wbUke, v2Uke] = await Promise.all([
    prisma.workbenchSession.findMany({
      where: {
        playerId,
        date: { gte: tilDatoKolonne(isoLokal(mStart)), lt: tilDatoKolonne(isoLokal(mSlutt)) },
        status: { in: [...SPILLER_SYNLIGE_STATUSER] },
        hiddenByPlayer: false,
      },
      select: { date: true, title: true, startMinute: true, durationMinutes: true, status: true },
      orderBy: [{ date: "asc" }, { startMinute: "asc" }],
    }),
    prisma.trainingSessionV2.findMany({
      where: {
        studentId: playerId,
        startTime: { gte: mStart, lt: mSlutt },
      },
      select: { startTime: true, title: true },
      orderBy: { startTime: "asc" },
    }),
    prisma.workbenchSession.findMany({
      where: {
        playerId,
        date: { gte: tilDatoKolonne(isoLokal(uStart)), lt: tilDatoKolonne(isoLokal(uSlutt)) },
        status: { in: [...SPILLER_SYNLIGE_STATUSER] },
        hiddenByPlayer: false,
      },
      select: { date: true, title: true, startMinute: true, durationMinutes: true },
    }),
    prisma.trainingSessionV2.count({
      where: { studentId: playerId, startTime: { gte: uStart, lt: uSlutt } },
    }),
  ]);

  const ferdige = new Set<number>();
  for (const s of wbMnd) {
    const iso = s.date.toISOString().slice(0, 10);
    ferdige.add(Number(iso.slice(8, 10)));
  }
  for (const s of v2Mnd) {
    ferdige.add(Number(ISO.format(s.startTime).slice(8, 10)));
  }

  const okterDenneUken = wbUke.length > 0 ? wbUke.length : v2Uke;

  const kommendeWb = wbMnd
    .map((s) => ({
      iso: s.date.toISOString().slice(0, 10),
      tittel: s.title,
      startMinute: s.startMinute,
    }))
    .filter((s) => s.iso > iDagIso);

  let neste: IDagNeste | null = null;
  if (kommendeWb[0]) {
    const n = kommendeWb[0];
    const ukedag = ukedagLangFraIso(n.iso);
    const erHvile = n.tittel.trim().toLowerCase() === "hvile";
    neste = {
      tittel: n.tittel,
      meta: erHvile ? `${ukedag} · programmert` : `${ukedag} · ${punktFraMinutt(n.startMinute)} · programmert`,
      datoIso: n.iso,
    };
  } else {
    const kommendeV2 = v2Mnd.find((s) => ISO.format(s.startTime) > iDagIso);
    if (kommendeV2) {
      const iso = ISO.format(kommendeV2.startTime);
      const kl = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Oslo",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
        .format(kommendeV2.startTime)
        .replace(":", ".");
      neste = {
        tittel: kommendeV2.title,
        meta: `${ukedagLangFraIso(iso)} · ${kl}`,
        datoIso: iso,
      };
    }
  }

  return { ferdigeDager: [...ferdige], okterDenneUken, neste };
}

function punktFraMinutt(m: number): string {
  const h = Math.floor(m / 60)
    .toString()
    .padStart(2, "0");
  const min = (m % 60).toString().padStart(2, "0");
  return `${h}.${min}`;
}

function ukedagLangFraIso(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const js = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const navn = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];
  const raw = navn[js] ?? "";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}
