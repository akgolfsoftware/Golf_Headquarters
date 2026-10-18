/**
 * AG-05-AR Året (pakke 3, natt 17.10): coachede økter i ett år, per måned og
 * akse. «Coachet» = bookinger (ikke avlyst) og gruppeøkter i Workbench, samme
 * blokker som coachkolonnene i dagvisningen. Head coach ser alle coacher;
 * assistant coach egne bookinger og alle gruppeøkter (maskerForSeer).
 */
import { prisma } from "@/lib/prisma";
import { fraDatoKolonne, tilDatoKolonne } from "@/lib/workbench/wb-map";
import { akseFraPyramide, type KalenderSeer } from "@/lib/domain/kalender-lag";
import { summerAar, type AarManed, type AarRad } from "@/lib/domain/kalender-aar";
import { akseFraTekst } from "@/lib/agencyos/neste-okt";

export type KalenderAarData = {
  aar: number;
  maneder: AarManed[];
  totalt: number;
  nav: { forrige: string; neste: string; idag: string };
};

const OSLO_DATO = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" });
const href = (aar: number) => `/admin/kalender?fane=ar&aar=${aar}`;

export async function hentKalenderAar(aarParam: string | undefined, seer: KalenderSeer): Promise<KalenderAarData> {
  const idagIso = OSLO_DATO.format(new Date());
  const iAar = Number(idagIso.slice(0, 4));
  const n = Number(aarParam);
  const aar = Number.isInteger(n) && n >= 2000 && n <= 2100 ? n : iAar;
  const fra = new Date(Date.UTC(aar, 0, 1));
  const til = new Date(Date.UTC(aar + 1, 0, 1));

  const [bookinger, gruppeOkter] = await Promise.all([
    prisma.booking.findMany({
      where: {
        startAt: { gte: fra, lt: til },
        status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
        ...(seer.erHeadCoach ? {} : { coachId: seer.id }),
      },
      select: { startAt: true, endAt: true, notes: true, serviceType: { select: { name: true } } },
      take: 20000,
    }),
    prisma.workbenchSession.findMany({
      where: {
        groupId: { not: null },
        date: { gte: tilDatoKolonne(`${aar}-01-01`), lte: tilDatoKolonne(`${aar}-12-31`) },
        status: { notIn: ["CANCELLED", "SKIPPED"] },
      },
      select: { id: true, date: true, startMinute: true, durationMinutes: true, pyramid: true, groupId: true, sourceGroupSessionId: true, title: true },
      take: 50000,
    }),
  ]);

  const rader: AarRad[] = bookinger.map((b) => ({
    dato: OSLO_DATO.format(b.startAt),
    minutter: Math.round((b.endAt.getTime() - b.startAt.getTime()) / 60000),
    akse: akseFraTekst(`${b.serviceType.name} ${b.notes ?? ""}`),
  }));
  const sett = new Set<string>();
  for (const g of gruppeOkter) {
    const dato = fraDatoKolonne(g.date);
    const nokkel = g.sourceGroupSessionId ?? (g.id.startsWith("wb-group-") ? g.id : `${g.groupId}|${dato}|${g.startMinute}|${g.title}`);
    if (sett.has(nokkel)) continue;
    sett.add(nokkel);
    rader.push({ dato, minutter: g.durationMinutes, akse: akseFraPyramide(g.pyramid) });
  }

  const { maneder, totalt } = summerAar(rader, aar, idagIso);
  return { aar, maneder, totalt, nav: { forrige: href(aar - 1), neste: href(aar + 1), idag: href(iAar) } };
}
