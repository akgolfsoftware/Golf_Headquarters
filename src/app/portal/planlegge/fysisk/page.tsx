// PlayerHQ Fysisk program — Precision Athletics, pakke 17b (utkast plan-hjelpere.html, 16.10.2026).
/**
 * Spillerens aktive fysiske program (ellers nyeste) med ukene, øktene og siste fysiske tester.
 * Erstatter /portal/tren/fys-plan, som sender hit. Føringen av økta er fortsatt /portal/fysisk.
 */
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { prisma } from "@/lib/prisma";
import { parseForScoring } from "@/lib/portal-tester/test-scoring";
import { byggFysiskProgram, fysTestRader } from "@/lib/portal-plan/fysisk-program";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHFysiskProgram } from "@/components/portal/precision/PHFysiskProgram";

export const dynamic = "force-dynamic";
export const metadata = { title: "Fysisk program · PlayerHQ" };

const OSLO_DATO = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short", year: "numeric" });

const PLAN_INCLUDE = {
  opprettetAv: { select: { name: true } },
  uker: {
    orderBy: { sortOrder: "asc" as const },
    select: {
      ukeNr: true,
      okter: {
        orderBy: { sortOrder: "asc" as const },
        select: {
          id: true, navn: true, dag: true, type: true, estimertMinutter: true, gjennomfortAt: true,
          rader: {
            orderBy: { sortOrder: "asc" as const },
            select: {
              navn: true, sett: true, repsMin: true, repsMax: true, belastningPst: true, loggBelastningKg: true, rir: true,
              hvile: true, notat: true, intervallSerier: true, intervallMinutter: true, pulssone: true, pause: true,
            },
          },
        },
      },
    },
  },
};

export default async function FysiskProgramPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const [plan, resultater, uleste] = await Promise.all([
    prisma.fysiskPlan.findFirst({ where: { userId: user.id, status: "ACTIVE" }, orderBy: { startDato: "desc" }, include: PLAN_INCLUDE })
      .then((p) => p ?? prisma.fysiskPlan.findFirst({ where: { userId: user.id }, orderBy: { startDato: "desc" }, include: PLAN_INCLUDE })),
    prisma.testResult.findMany({
      where: { userId: user.id, test: { pyramidArea: "FYS" } },
      orderBy: { takenAt: "desc" },
      take: 40,
      select: { testId: true, score: true, takenAt: true, test: { select: { name: true, protocol: true } } },
    }),
    getUnreadNotifications(user.id, 1),
  ]);

  const tester = fysTestRader(resultater.map((r) => ({
    testId: r.testId, navn: r.test.name, score: r.score, takenAt: r.takenAt, enhet: parseForScoring(r.test.protocol).unit,
  })));

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PHFysiskProgram data={{
        program: plan ? byggFysiskProgram({
          id: plan.id, navn: plan.navn, startDato: plan.startDato, fraNavn: plan.opprettetAvId === user.id ? null : plan.opprettetAv.name,
          uker: plan.uker,
        }, new Date()) : null,
        tester: { rader: tester.rader, sist: tester.sist ? OSLO_DATO.format(tester.sist) : null },
      }} />
    </PlayerHQSkall>
  );
}
