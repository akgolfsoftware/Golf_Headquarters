// PH19TalentRoadmap — Precision Athletics.
/**
 * PlayerHQ · Talent · Roadmap (/portal/talent/roadmap) i Precision Athletics.
 * Kilde: Claude Design arkiv/2026-09-30/playerhq/screens/PH-19.jsx
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { FEATURES } from "@/lib/features";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH19Talent } from "@/components/portal/precision/PH19Talent";

export const dynamic = "force-dynamic";

function fmtKortDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function RoadmapPage() {
  if (!FEATURES.TALENT) notFound();

  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER"] });

  const [tracking, plan, uleste] = await Promise.all([
    prisma.talentTracking.findUnique({ where: { userId: user.id } }),
    prisma.seasonPlan.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        periodBlocks: {
          orderBy: { startDate: "asc" },
        },
      },
    }),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);

  if (!tracking) {
    return (
      <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
        <PH19Talent fane="roadmap" ikkeIProgrammet />
      </PlayerHQSkall>
    );
  }

  const now = new Date();
  const perioder = (plan?.periodBlocks ?? []).map((b) => ({
    id: b.id,
    navn: b.focus || b.lPhase || "Periode",
    startDato: fmtKortDato(b.startDate),
    sluttDato: fmtKortDato(b.endDate),
    aktiv: b.startDate <= now && b.endDate >= now,
  }));

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH19Talent
        fane="roadmap"
        niva={tracking.niva}
        klubb={tracking.klubb}
        region={tracking.region}
        perioder={perioder}
      />
    </PlayerHQSkall>
  );
}
