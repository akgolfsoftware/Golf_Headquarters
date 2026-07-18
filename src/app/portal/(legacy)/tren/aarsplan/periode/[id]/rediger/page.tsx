/**
 * PlayerHQ · Tren · Årsplan · Rediger periode — v2.
 *
 * Lar coach/spiller justere én periodeblokk: type, datoer, volum, fokus, notater.
 *
 * v2-port 18. juli 2026: V2Shell + v2-primitiver erstatter PlayerHero/EmptyState.
 * Auth-guard, datainnhenting og server actions er uendret — kun presentasjon.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { Caps, Tittel, TomTilstand, TilbakeLenke, StatusPill } from "@/components/v2";
import { PeriodeFormV2 } from "@/components/portal/v2/PeriodeFormV2";

export const dynamic = "force-dynamic";

export default async function PeriodeRedigerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const { id } = await params;

  const periodeRaw = await prisma.periodBlock.findUnique({
    where: { id },
    include: { seasonPlan: { select: { userId: true, name: true } } },
  });

  const isCoach = user.role === "COACH" || user.role === "ADMIN";
  const periode =
    periodeRaw && (isCoach || periodeRaw.seasonPlan.userId === user.id) ? periodeRaw : null;

  return (
    <V2Shell aktiv="plan" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/tren/aarsplan">Årsplan</TilbakeLenke>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, margin: "14px 0 20px" }}>
        <div>
          <Caps>PlayerHQ · Tren · Årsplan</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em="periode">Rediger</Tittel>
          </div>
        </div>
        {periode && <StatusPill tone="info">ID {id.slice(0, 8)}</StatusPill>}
      </div>

      {periode ? (
        <PeriodeFormV2
          mode="rediger"
          periodeId={id}
          initial={{
            focus: periode.focus,
            notes: periode.notes,
            startDate: periode.startDate.toISOString().slice(0, 10),
            endDate: periode.endDate.toISOString().slice(0, 10),
            lPhase: periode.lPhase,
            weeklyVolMin: periode.weeklyVolMin,
            weeklyVolMax: periode.weeklyVolMax,
          }}
        />
      ) : (
        <TomTilstand
          icon="calendar"
          title="Periode ble ikke funnet"
          sub="Perioden er enten slettet eller du har ikke tilgang til den."
        />
      )}
    </V2Shell>
  );
}
