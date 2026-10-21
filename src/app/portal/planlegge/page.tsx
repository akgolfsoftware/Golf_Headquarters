/** PlayerHQ Plan — PH-10 ukevisning i nytt design (pakke 3, godkjent 14.10.2026). */
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getGoals, getUnreadNotifications, getWeekOverview } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import type { PH01Maal } from "@/components/portal/precision/PH01IDag";
import { PH10Plan } from "@/components/portal/precision/PH10Plan";
import { getPlayerDepthMode } from "@/lib/player-depth-mode";
import { hentUkePeriode } from "@/lib/portal-plan/uke-periode";
import { hentEffektivNaa } from "@/lib/testing/dato-override";
import { hentSpillerUkeITiden } from "@/lib/kalender-lag/player-dag";
import { hentPlanForslag } from "@/lib/portal/plan-data";
import { egneAvtalerIPlan } from "@/lib/portal/plan-visning";
import { hentOpptattTid } from "@/lib/portal/tilgjengelighet";
import { OSLO_YMD_FMT, osloInstant } from "@/lib/jarvis/dagen";
import { osloUkeGrenser } from "@/lib/jarvis/ukesreview";
import { parseWeekOffset } from "@/lib/workbench/session-move-math";
import { ukenummer } from "@/lib/uke-helpers";
import { prisma } from "@/lib/prisma";

const FRIST_FMT = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "long", year: "numeric" });

export const dynamic = "force-dynamic";
export const metadata = { title: "Plan · PlayerHQ" };

export default async function PlayerPlanPage({ searchParams }: { searchParams: Promise<{ uke?: string | string[] }> }) {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");
  const naa = await hentEffektivNaa(user.email);
  const ukeOffset = parseWeekOffset((await searchParams).uke);
  const [y, m, d] = OSLO_YMD_FMT.format(naa).split("-").map(Number);
  const dato = new Date(Date.UTC(y, m - 1, d + ukeOffset * 7));
  const referanse = osloInstant(dato.getUTCFullYear(), dato.getUTCMonth() + 1, dato.getUTCDate(), 12, 0);
  const ukegrenser = osloUkeGrenser(referanse);
  const mandag = OSLO_YMD_FMT.format(ukegrenser.start);
  const [week, depthMode, periode, kalender, forslag, tekniskePlaner, uleste, opptatt, goals] = await Promise.all([
    getWeekOverview(user.id, referanse), getPlayerDepthMode(), hentUkePeriode(user.id, referanse),
    hentSpillerUkeITiden(user.id, mandag), hentPlanForslag(user.id, mandag),
    prisma.technicalPlan.count({ where: { userId: user.id } }),
    getUnreadNotifications(user.id, 1),
    hentOpptattTid(user.id, ukegrenser.start, ukegrenser.slutt),
    getGoals(user.id, 2, naa),
  ]);
  const maal: PH01Maal[] = goals.filter((g) => g.status !== "ABANDONED").map((g) => ({
    id: g.id, tittel: g.title, kategori: g.category === "PROCESS" ? "Prosessmål" : "Resultatmål",
    frist: g.deadline ? FRIST_FMT.format(g.deadline) : null, pct: g.progress, status: g.progressStatus, href: g.href,
  }));
  for (const day of week) day.isToday = OSLO_YMD_FMT.format(day.date) === OSLO_YMD_FMT.format(naa);
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PH10Plan data={{ weekNumber: ukenummer(referanse), week }} depthMode={depthMode} periode={periode} kalender={kalender} forslag={forslag} opptatt={egneAvtalerIPlan(opptatt.filter((o) => o.kilde === "EGEN_AVTALE"))} ukeOffset={ukeOffset} harTekniskPlan={tekniskePlaner > 0} maal={maal} />
    </PlayerHQSkall>
  );
}
