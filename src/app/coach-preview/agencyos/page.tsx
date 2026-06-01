/**
 * UNGATED preview av AgencyOS Daglig brief — for design-kalibrering/screenshot.
 * Bruker NØYAKTIG samme komponent + data-loader som den gated /admin/agencyos,
 * men uten auth-guard. Speiler AdminShell-innholdsflaten (cream bg + padding).
 */

import { prisma } from "@/lib/prisma";
import { DailyBrief } from "@/components/admin/agencyos/daily-brief";
import { loadDailyBrief } from "@/lib/agencyos/daily-brief-data";

export const dynamic = "force-dynamic";

export default async function CoachPreviewAgencyOS() {
  const coach =
    (await prisma.user.findFirst({
      where: { role: { in: ["ADMIN", "COACH"] } },
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    })) ?? { id: "preview", name: "Anders" };

  const props = await loadDailyBrief(coach);

  return (
    <div className="min-h-screen bg-background px-8 py-6">
      <DailyBrief {...props} />
    </div>
  );
}
