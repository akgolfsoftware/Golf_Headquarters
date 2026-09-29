/**
 * Teknisk plan · oversikt i Precision Athletics. Leste før TEK-økter fra
 * TrainingPlan; nå spillerens TechnicalPlan (samme data som AG-10 og PH-TP-01).
 * Tilgang som før: COACH/ADMIN, bare spillere i coachens stall.
 */

import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { oversiktRad } from "@/lib/teknisk-plan/tp-oversikt";
import { AG10Oversikt } from "@/components/admin/precision/AG10Oversikt";

export const dynamic = "force-dynamic";
export const metadata = { title: "Teknisk plan · AgencyOS" };

export default async function AdminTekniskPlanPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const spillere = await prisma.user.findMany({
    where: coachScopedPlayerWhere(user),
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      technicalPlans: {
        select: {
          id: true, navn: true, status: true, startDato: true,
          positions: {
            select: {
              tasks: {
                select: {
                  status: true, repsMaalDry: true, repsMaalLav: true, repsMaalFull: true,
                  repsGjortDry: true, repsGjortLav: true, repsGjortFull: true, lastRepLoggedAt: true,
                },
              },
            },
          },
        },
      },
    },
  });
  return <AG10Oversikt coachNavn={user.name ?? "Coach"} rader={spillere.map((s) => oversiktRad(s, s.technicalPlans))} />;
}
