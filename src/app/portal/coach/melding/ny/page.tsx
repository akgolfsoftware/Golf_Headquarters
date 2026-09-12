/**
 * PlayerHQ Coach · Ny melding (/portal/coach/melding/ny) — v2.
 * Hovedcoach er den aktive PlayerEnrollment-coachen, samme datakilde
 * som hub-siden. Uten tildelt coach vises tom tilstand — ingen tilfeldig coach.
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
      <V2Shell bredde="kolonne" aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name}>
        <TilbakeLenke href="/portal/coach/melding">Meldinger</TilbakeLenke>
        <CoachMeldingNyV2 data={{ gratis: true, coach: null }} sendAction={sendMeldingNyV2} />
      </V2Shell>
    );
  }

  const aktivEnrollering = await prisma.playerEnrollment.findFirst({
    where: { userId: user.id, endedAt: null, coachId: { not: null } },
    include: { coach: { select: { id: true, name: true } } },
    orderBy: { enrolledAt: "desc" },
  });

  const coach = aktivEnrollering?.coach ?? null;

  return (
    <V2Shell bredde="kolonne" aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name}>
      <TilbakeLenke href="/portal/coach/melding">Meldinger</TilbakeLenke>
      <CoachMeldingNyV2 data={{ gratis: false, coach }} sendAction={sendMeldingNyV2} />
    </V2Shell>
  );
}
