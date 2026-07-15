/**
 * PlayerHQ Coach · Ny melding (/portal/coach/melding/ny) — v2.
 * Hovedcoach forhåndsvalgt (aktiv PlayerEnrollment → fallback første
 * COACH-bruker), samme datakilde-mønster som hub-siden
 * (src/app/portal/coach/melding/page.tsx → CoachMeldingerV2). Erstatter
 * legacy /portal/(legacy)/coach/melding/ny som spillerens inngang.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { CoachMeldingNyV2 } from "@/components/portal/v2/CoachMeldingNyV2";
import { sendMeldingNyV2 } from "./actions";

export const dynamic = "force-dynamic";

export default async function NyMeldingPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN", "PARENT"] });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  if (user.tier === "GRATIS") {
    return (
      <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name}>
        <TilbakeLenke href="/portal/coach/melding">Meldinger</TilbakeLenke>
        <CoachMeldingNyV2 data={{ gratis: true, coach: null }} sendAction={sendMeldingNyV2} />
      </V2Shell>
    );
  }

  const [aktivEnrollering, forsteCoach] = await Promise.all([
    prisma.playerEnrollment.findFirst({
      where: { userId: user.id, endedAt: null, coachId: { not: null } },
      include: { coach: { select: { id: true, name: true } } },
      orderBy: { enrolledAt: "desc" },
    }),
    prisma.user.findFirst({
      where: { role: "COACH" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const coach = aktivEnrollering?.coach ?? forsteCoach ?? null;

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name}>
      <TilbakeLenke href="/portal/coach/melding">Meldinger</TilbakeLenke>
      <CoachMeldingNyV2 data={{ gratis: false, coach }} sendAction={sendMeldingNyV2} />
    </V2Shell>
  );
}
