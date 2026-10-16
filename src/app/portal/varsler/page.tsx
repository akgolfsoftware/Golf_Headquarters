/**
 * PH-21 Innboks bak bjella (pakke 7 Kommunikasjon, nytt design 15.10.2026).
 * Samler forslag (trener, coach, planer), siste melding fra coach og varslene.
 * Samme Notification-spørring som før. Åpning av et varsel markerer det lest og følger lenken.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH21InnboksOversikt } from "@/components/portal/precision/PH21InnboksOversikt";
import { getPH21Data } from "@/lib/portal-coach/ph21-queries";
import { hentPlanForslag } from "@/lib/portal/plan-data";
import { hentMineTrenerforslag } from "@/lib/workbench/trenerforslag";
import { hentEffektivNaa } from "@/lib/testing/dato-override";
import { OSLO_YMD_FMT } from "@/lib/jarvis/dagen";
import { osloUkeGrenser } from "@/lib/jarvis/ukesreview";
import {
  coachforslagTilSak, planTilSak, relativTid, sisteCoachMelding, trenerforslagTilSak,
  type InnboksForslag, type PH21InnboksData, type TrenerforslagInn,
} from "@/lib/portal/ph21-innboks";

export const dynamic = "force-dynamic";
export const metadata = { title: "Innboks · PlayerHQ" };

export default async function VarslerPage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  const naa = await hentEffektivNaa(user.email);
  const denneUka = OSLO_YMD_FMT.format(osloUkeGrenser(naa).start);
  const nesteUka = OSLO_YMD_FMT.format(osloUkeGrenser(new Date(naa.getTime() + 7 * 86_400_000)).start);

  const [rows, ph21, coachDenne, coachNeste, trener] = await Promise.all([
    prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100 }),
    getPH21Data(user.id),
    hentPlanForslag(user.id, denneUka),
    hentPlanForslag(user.id, nesteUka),
    user.role === "PLAYER" ? hentMineTrenerforslag() : Promise.resolve([]),
  ]);

  const forslag: InnboksForslag[] = [
    ...(trener as TrenerforslagInn[]).map((f) => trenerforslagTilSak(f, naa)),
    ...[...coachDenne, ...coachNeste].map(coachforslagTilSak),
    ...ph21.plans.map((p) => planTilSak(p, ph21.coach?.name ?? null)).filter((p): p is InnboksForslag => p !== null),
  ];

  const data: PH21InnboksData = {
    forslag,
    melding: sisteCoachMelding(ph21.messages, ph21.coach?.name ?? null),
    varsler: rows.map((r) => ({
      id: r.id, type: r.type, tittel: r.title, tekst: r.body, tid: relativTid(r.createdAt, naa), ulest: r.readAt == null, link: r.link,
    })),
    harCoach: Boolean(ph21.coach),
  };
  const uleste = rows.filter((r) => r.readAt == null).length;

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH21InnboksOversikt data={data} />
    </PlayerHQSkall>
  );
}
