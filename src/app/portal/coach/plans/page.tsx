/**
 * PH-21 Innboks · Planer (/portal/coach/plans) i Precision Athletics.
 * Coach-delte planer (createdById satt): Aktiv, Fullført eller Pause.
 */
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { innboksKontekst } from "@/lib/portal-okt/innboks-data";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH21Ramme, PH21Planer, type PH21Plan } from "@/components/portal/precision/PH21Innboks";

export const dynamic = "force-dynamic";
export const metadata = { title: "Planer · PlayerHQ" };

const DATO = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "2-digit", month: "2-digit", year: "numeric" });
const dma = (d: Date) => DATO.format(d).replaceAll("/", ".");

export default async function CoachPlanerPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");
  const ctx = await innboksKontekst(user.id);
  const rader = user.tier === "GRATIS" ? [] : await prisma.trainingPlan.findMany({
    where: { userId: user.id, createdById: { not: null } },
    include: { sessions: { select: { id: true, status: true } } },
    orderBy: { startDate: "desc" },
  });
  const planer: PH21Plan[] = rader.map((p) => {
    const fullfort = p.sessions.filter((s) => s.status === "COMPLETED").length;
    return {
      id: p.id,
      navn: p.name,
      periode: `${dma(p.startDate)}${p.endDate ? ` – ${dma(p.endDate)}` : ""}`,
      fullfort,
      total: p.sessions.length,
      status: p.isActive ? "Aktiv" : fullfort > 0 ? "Fullført" : "Pause",
    };
  });
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ctx.uleste}>
      <PH21Ramme aktiv="plan" coachNavn={ctx.coachNavn}>
        <PH21Planer planer={planer} />
      </PH21Ramme>
    </PlayerHQSkall>
  );
}
