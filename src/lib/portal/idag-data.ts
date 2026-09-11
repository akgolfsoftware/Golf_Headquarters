/**
 * Server-data til PH-01 prikk-måned og «Neste».
 * Workbench (synlig for spiller) + TrainingSessionV2.
 */
import "server-only";
import { prisma } from "@/lib/prisma";
import { OSLO_YMD_FMT, osloDagGrenser, osloInstant } from "@/lib/jarvis/dagen";
import { tilDatoKolonne } from "@/lib/workbench/wb-map";
import { visibleV2Where } from "@/lib/portal/visible-v2";
import { v2DbSessionHref } from "@/lib/portal/session-hrefs";
import { liveHrefForStatus } from "@/lib/portal-live/live-route";

export type IDagNeste = {
  tittel: string;
  meta: string;
  datoIso: string;
  href: string;
};

export type IDagKalender = {
  ferdigeDager: number[];
  neste: IDagNeste | null;
};

export async function hentIDagKalender(playerId: string, naa: Date): Promise<IDagKalender> {
  const [aar, maned] = OSLO_YMD_FMT.format(naa).split("-").map(Number);
  const mStart = osloInstant(aar, maned, 1, 0, 0);
  const mSlutt = osloInstant(aar, maned + 1, 1, 0, 0);
  const { slutt: iMorgen } = osloDagGrenser(naa);
  const visibility = await visibleV2Where(playerId);
  const wbVisibility = {
    playerId,
    hiddenByPlayer: false,
    needsPlayerApproval: false,
    OR: [{ approvalStatus: null }, { approvalStatus: { not: "REJECTED" } }],
  };

  const [wbMnd, v2Mnd, wbNeste, v2Neste] = await Promise.all([
    prisma.workbenchSession.findMany({
      where: {
        ...wbVisibility,
        date: { gte: tilDatoKolonne(OSLO_YMD_FMT.format(mStart)), lt: tilDatoKolonne(OSLO_YMD_FMT.format(mSlutt)) },
        status: "COMPLETED",
      },
      select: { date: true },
    }),
    prisma.trainingSessionV2.findMany({
      where: { ...visibility, startTime: { gte: mStart, lt: mSlutt }, status: "COMPLETED" },
      select: { startTime: true },
    }),
    prisma.workbenchSession.findFirst({
      where: {
        ...wbVisibility,
        date: { gte: tilDatoKolonne(OSLO_YMD_FMT.format(iMorgen)) },
        status: "PUBLISHED",
      },
      select: { id: true, date: true, title: true, startMinute: true, status: true },
      orderBy: [{ date: "asc" }, { startMinute: "asc" }, { id: "asc" }],
    }),
    prisma.trainingSessionV2.findFirst({
      where: { ...visibility, startTime: { gte: iMorgen }, status: "PLANNED" },
      select: { id: true, startTime: true, title: true, status: true },
      orderBy: [{ startTime: "asc" }, { id: "asc" }],
    }),
  ]);

  const ferdige = new Set<number>();
  for (const s of wbMnd) ferdige.add(s.date.getUTCDate());
  for (const s of v2Mnd) ferdige.add(Number(OSLO_YMD_FMT.format(s.startTime).slice(8, 10)));

  // Sammenlign faktiske tidspunkt, også over måneds-/årsskiftet. Begge
  // øktmodellene beholder sin egen identitet og eksisterende detaljlenke.
  const kandidater: { start: Date; tittel: string; href: string; programmert: boolean }[] = [];
  if (wbNeste) {
    const d = wbNeste.date;
    kandidater.push({
      start: osloInstant(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), Math.floor(wbNeste.startMinute / 60), wbNeste.startMinute % 60),
      tittel: wbNeste.title,
      href: liveHrefForStatus("wb", wbNeste.status, wbNeste.id),
      programmert: true,
    });
  }
  if (v2Neste) kandidater.push({ start: v2Neste.startTime, tittel: v2Neste.title, href: v2DbSessionHref(v2Neste.id, v2Neste.status), programmert: false });
  kandidater.sort((a, b) => a.start.getTime() - b.start.getTime());
  const n = kandidater[0];
  let neste: IDagNeste | null = null;
  if (n) {
    const datoIso = OSLO_YMD_FMT.format(n.start);
    const kl = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(n.start).replace(":", ".");
    const hvile = n.tittel.trim().toLowerCase() === "hvile";
    neste = {
      tittel: n.tittel,
      meta: [ukedagLangFraIso(datoIso), hvile ? null : kl, n.programmert ? "programmert" : null].filter(Boolean).join(" · "),
      datoIso,
      href: n.href,
    };
  }
  return { ferdigeDager: [...ferdige].sort((a, b) => a - b), neste };
}

function ukedagLangFraIso(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const js = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  const navn = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];
  const raw = navn[js] ?? "";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}
