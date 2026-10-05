// PH19TalentMinPlan — Precision Athletics.
/**
 * PlayerHQ · Talent · Min plan (/portal/talent/min-plan) i Precision Athletics.
 * Kilde: Claude Design arkiv/2026-09-30/playerhq/screens/PH-19.jsx
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { FEATURES } from "@/lib/features";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH19Talent } from "@/components/portal/precision/PH19Talent";

type Milepael = {
  tittel: string;
  dato?: string;
  beskrivelse?: string;
  fullfort?: boolean;
};

function parseMilepaeler(json: unknown): Milepael[] {
  if (!Array.isArray(json)) return [];
  return json
    .filter((m): m is Record<string, unknown> => typeof m === "object" && m !== null)
    .map((m) => ({
      tittel: typeof m.tittel === "string" ? m.tittel : "",
      dato: typeof m.dato === "string" ? m.dato : undefined,
      beskrivelse: typeof m.beskrivelse === "string" ? m.beskrivelse : undefined,
      fullfort: typeof m.fullfort === "boolean" ? m.fullfort : false,
    }))
    .filter((m) => m.tittel.length > 0);
}

export default async function MinPlanPage() {
  if (!FEATURES.TALENT) notFound();

  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER"] });

  const [tracking, uleste] = await Promise.all([
    prisma.talentTracking.findUnique({ where: { userId: user.id } }),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);

  if (!tracking) {
    return (
      <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
        <PH19Talent fane="min-plan" ikkeIProgrammet />
      </PlayerHQSkall>
    );
  }

  const milepaeler = parseMilepaeler(tracking.milepaeler);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH19Talent
        fane="min-plan"
        niva={tracking.niva}
        klubb={tracking.klubb}
        region={tracking.region}
        milepaeler={milepaeler}
      />
    </PlayerHQSkall>
  );
}
