/**
 * v2-forhåndsvisning — PlayerHQ Coach · Spørsmål (retning C). Egen top-level
 * route-group (v2preview) som IKKE arver PortalShell — kun root-layout. V2Shell
 * leverer chrome-en, CoachQAV2 rendrer innholds-stacken.
 *
 * Auth + datahenting speiler den ekte siden (src/app/portal/coach/sporsmal/page.tsx):
 * coachens egne + åpne (utildelte) spørsmål, nyeste først, med spillernavn.
 */

import { TilbakeLenke } from "@/components/v2";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { CoachQAV2, type CoachSporsmal } from "@/components/portal/v2/CoachQAV2";

export const dynamic = "force-dynamic";

function formatDatoTid(d: Date): string {
  return d.toLocaleString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function V2CoachSporsmalPreviewPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  // Spørsmål rettet til denne coachen + spørsmål uten tildelt coach (åpen kø).
  const questions = await prisma.question.findMany({
    where: { OR: [{ coachUserId: user.id }, { coachUserId: null }] },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const askerNavn = new Map<string, string>();
  const askerIds = [...new Set(questions.map((q) => q.askerUserId))];
  if (askerIds.length > 0) {
    const askere = await prisma.user.findMany({
      where: { id: { in: askerIds } },
      select: { id: true, name: true },
    });
    for (const a of askere) askerNavn.set(a.id, a.name);
  }

  const sporsmal: CoachSporsmal[] = questions.map((q) => ({
    id: q.id,
    navn: askerNavn.get(q.askerUserId) ?? "Ukjent spiller",
    tittel: q.title,
    besvart: q.status === "ANSWERED",
    tid: formatDatoTid(q.createdAt),
  }));

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name}>
      <TilbakeLenke href="/portal/coach">Coach</TilbakeLenke>
      <CoachQAV2 data={{ sporsmal }} />
    </V2Shell>
  );
}
