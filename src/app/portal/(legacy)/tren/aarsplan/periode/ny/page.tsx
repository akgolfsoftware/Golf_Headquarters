/**
 * PlayerHQ · Tren · Årsplan · Ny periode — v2.
 *
 * Søsterrute til `/periode/[id]/rediger` — samme skjema, ingen id i url.
 * `seasonPlanId` tas fra `?seasonPlanId=`, ellers brukerens nyeste sesongplan.
 *
 * v2-port 18. juli 2026: V2Shell + v2-primitiver erstatter PlayerHero/EmptyState.
 * Auth-guard, datainnhenting og server actions er uendret — kun presentasjon.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { Caps, Tittel, TomTilstand, TilbakeLenke } from "@/components/v2";
import { PeriodeFormV2 } from "@/components/portal/v2/PeriodeFormV2";

export const dynamic = "force-dynamic";

export default async function NyPeriodePage({
  searchParams,
}: {
  searchParams: Promise<{ seasonPlanId?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const { seasonPlanId: seasonPlanIdParam } = await searchParams;
  const isCoach = user.role === "COACH" || user.role === "ADMIN";

  const seasonPlan = seasonPlanIdParam
    ? await prisma.seasonPlan.findUnique({
        where: { id: seasonPlanIdParam },
        select: { id: true, userId: true },
      })
    : await prisma.seasonPlan.findFirst({
        where: { userId: user.id },
        orderBy: { year: "desc" },
        select: { id: true, userId: true },
      });

  const harTilgang = seasonPlan && (isCoach || seasonPlan.userId === user.id);

  return (
    <V2Shell aktiv="plan" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/tren/aarsplan">Årsplan</TilbakeLenke>
      <div style={{ margin: "14px 0 20px" }}>
        <Caps>PlayerHQ · Tren · Årsplan</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="periode">Ny</Tittel>
        </div>
      </div>

      {harTilgang ? (
        <PeriodeFormV2 mode="ny" seasonPlanId={seasonPlan.id} />
      ) : (
        <TomTilstand
          icon="calendar"
          title="Ingen sesongplan funnet"
          sub="Du trenger en sesongplan før du kan legge til perioder. Opprett en årsplan først."
        />
      )}
    </V2Shell>
  );
}
