// PH19TalentSammenligning — Precision Athletics.
/**
 * PlayerHQ · Talent · Sammenligning (/portal/talent/sammenligning) i Precision Athletics.
 * Kilde: Claude Design arkiv/2026-09-30/playerhq/screens/PH-19.jsx
 *
 * Beslutning 28.09: Sammenligning mot andre spillere utgår for spilleren.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { FEATURES } from "@/lib/features";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH19Talent } from "@/components/portal/precision/PH19Talent";

export default async function SammenligningPage() {
  if (!FEATURES.TALENT) notFound();

  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER"] });

  const [tracking, uleste] = await Promise.all([
    prisma.talentTracking.findUnique({ where: { userId: user.id } }),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);

  if (!tracking) {
    return (
      <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
        <PH19Talent fane="sammenligning" ikkeIProgrammet />
      </PlayerHQSkall>
    );
  }

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH19Talent
        fane="sammenligning"
        niva={tracking.niva}
        klubb={tracking.klubb}
        region={tracking.region}
      />
    </PlayerHQSkall>
  );
}
