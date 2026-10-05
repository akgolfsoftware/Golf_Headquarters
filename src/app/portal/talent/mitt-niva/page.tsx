// PH19TalentMittNiva — Precision Athletics.
/**
 * PlayerHQ · Talent · Mitt nivå (/portal/talent/mitt-niva) i Precision Athletics.
 * Kilde: Claude Design arkiv/2026-09-30/playerhq/screens/PH-19.jsx
 *
 * Beslutning: Talentradar vises aldri for spilleren.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { FEATURES } from "@/lib/features";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH19Talent } from "@/components/portal/precision/PH19Talent";
import { testNivaaerSchema } from "@/lib/domain/talent-sync";
import { PYRAMID_LABEL } from "@/lib/domain/workbench/labels";

export default async function MittNivaPage() {
  if (!FEATURES.TALENT) notFound();

  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER"] });

  const [tracking, uleste] = await Promise.all([
    prisma.talentTracking.findUnique({ where: { userId: user.id } }),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);

  if (!tracking) {
    return (
      <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
        <PH19Talent fane="mitt-niva" ikkeIProgrammet />
      </PlayerHQSkall>
    );
  }

  const testNivaaerParsed = testNivaaerSchema.safeParse(tracking.testNivaaer);
  const testNivaaer = testNivaaerParsed.success
    ? Object.entries(testNivaaerParsed.data)
        .map(([omraade, n]) => ({
          omraade,
          omraadeLabel: PYRAMID_LABEL[omraade as keyof typeof PYRAMID_LABEL] ?? omraade,
          testNavn: n.testNavn,
          sisteScore: n.sisteScore,
          unit: n.unit,
          sisteDato: n.sisteDato,
          antallTester: n.antallTester,
          trend: n.trend,
        }))
        .sort((a, b) => (a.sisteDato < b.sisteDato ? 1 : -1))
    : [];

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH19Talent
        fane="mitt-niva"
        niva={tracking.niva}
        klubb={tracking.klubb}
        region={tracking.region}
        testNivaaer={testNivaaer}
      />
    </PlayerHQSkall>
  );
}
