import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getDashboardData } from "@/lib/dashboard-data";
import { aktivStreak } from "@/lib/streak";
import { totalMinutter } from "@/lib/pyramide";
import { DashHero } from "@/components/portal/dash-hero";
import { KpiStrip } from "@/components/portal/kpi-strip";
import { DagensFokusCard } from "@/components/portal/dagens-fokus-card";
import { PyramideCard } from "@/components/portal/pyramide-card";
import { StreakBars } from "@/components/portal/streak-bars";
import { SgFordelingCard } from "@/components/portal/sg-fordeling-card";
import { SistRegistrertCard } from "@/components/portal/sist-registrert-card";
import { PlanActionsCard } from "@/components/portal/plan-actions-card";

export default async function PortalHjem() {
  const user = await requirePortalUser();
  const data = await getDashboardData(user);

  // Pyramide-uke som prosent av målfordeling (krude tall — antar 240 min/uke som mål)
  const ukeMaal = 240;
  const ukeMinutter = totalMinutter(data.pyramideUke);
  const pyrUkeProsent = Math.min(100, Math.round((ukeMinutter / ukeMaal) * 100));

  const streakAktivAntall = aktivStreak(data.streak14);

  const kanStarteLive = user.tier !== "GRATIS";

  return (
    <div className="space-y-8">
      <DashHero
        name={user.name}
        avatarUrl={user.avatarUrl}
        hcp={user.hcp}
        homeClub={user.homeClub}
        tier={user.tier}
        ambition={user.ambition}
      />

      <KpiStrip
        hcp={user.hcp}
        sgTotal={data.sgAggregate.total}
        streakAktiv={streakAktivAntall}
        pyramideUkeProsent={pyrUkeProsent}
      />

      <PlanActionsCard actions={data.pendingActions} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <DagensFokusCard session={data.dagensSesjon} kanStarte={kanStarteLive} />
        </div>
        <div className="lg:col-span-2">
          <PyramideCard data={data.pyramide14d} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StreakBars streak={data.streak14} />
        <SgFordelingCard sg={data.sgAggregate} />
        <SistRegistrertCard items={data.sisteRegistrerte} />
      </div>

      {data.sisteCoachMelding && (
        <CoachMeldingCard
          melding={data.sisteCoachMelding}
          tier={user.tier}
        />
      )}
    </div>
  );
}

function CoachMeldingCard({
  melding,
  tier,
}: {
  melding: { content: string; ts: Date; coachNavn: string };
  tier: string;
}) {
  const tekst =
    melding.content.length > 240
      ? melding.content.slice(0, 240) + "…"
      : melding.content;

  return (
    <article className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Siste coach-melding
          </span>
          <h3 className="mt-2 font-display text-lg font-semibold leading-snug">
            {tekst}
          </h3>
          <p className="mt-2 font-mono text-[11px] text-muted-foreground">
            {melding.coachNavn} ·{" "}
            {melding.ts.toLocaleDateString("nb-NO", {
              day: "2-digit",
              month: "2-digit",
            })}
          </p>
        </div>
        <Link
          href={tier === "GRATIS" ? "/portal/meg/abonnement" : "/portal/coach/ai"}
          className="shrink-0 rounded-md border border-input bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-border"
        >
          Svar →
        </Link>
      </div>
    </article>
  );
}
