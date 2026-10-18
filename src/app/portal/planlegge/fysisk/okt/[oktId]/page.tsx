// PlayerHQ · føring av én fysisk økt — Live fysisk (PH-06) i nytt design (utkast treningsokt.html, 14.10.2026).
/**
 * Spilleren fører seriene i én økt fra sitt fysiske program. Erstatter /portal/fysisk, som sender til Fysisk program.
 * Lagring: loggFysOkt og angreFysOktLogg, som før.
 */
import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { prisma } from "@/lib/prisma";
import { loggFysOkt, angreFysOktLogg } from "@/app/portal/fysisk/actions";
import { byggFysOkt } from "@/lib/portal-plan/fysisk-okt";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHFysiskOkt } from "@/components/portal/precision/PHFysiskOkt";

export const dynamic = "force-dynamic";
export const metadata = { title: "Fysisk økt · PlayerHQ" };

export default async function FysiskOktPage({ params }: { params: Promise<{ oktId: string }> }) {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");
  const { oktId } = await params;

  const [okt, uleste] = await Promise.all([
    prisma.fysOkt.findUnique({
      where: { id: oktId },
      select: {
        id: true, navn: true, dag: true, type: true, estimertMinutter: true, gjennomfortAt: true, faktiskMinutter: true,
        uke: { select: { plan: { select: { userId: true, navn: true } } } },
        rader: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true, navn: true, sett: true, repsMin: true, repsMax: true, belastningPst: true, loggBelastningKg: true, rir: true,
            hvile: true, notat: true, intervallSerier: true, intervallMinutter: true, pulssone: true, pause: true,
            loggSett: true, loggRepsPerSett: true, loggRir: true, loggSettData: true,
          },
        },
      },
    }),
    getUnreadNotifications(user.id, 1),
  ]);
  // Bare spillerens egne økter; en fremmed økt-ID gir samme svar som en som ikke finnes.
  if (!okt || okt.uke.plan.userId !== user.id) notFound();

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PHFysiskOkt okt={byggFysOkt(okt, okt.uke.plan.navn)} lagre={loggFysOkt} angre={angreFysOktLogg} />
    </PlayerHQSkall>
  );
}
