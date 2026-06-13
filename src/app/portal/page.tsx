/**
 * PlayerHQ Oversikt (/portal) — Dashboard v2.
 *
 * Daglig «hva skal jeg gjøre i dag»-dashboard. Mobil-først, men med
 * desktop-layout som legger kalenderen i venstre kolonne og hero/KPI-er
 * i høyre kolonne.
 *
 * Auth-guard via requirePortalUser. PortalShell (layout) eier sidebar/topbar/
 * bottom-nav — denne siden rendrer kun dashbord-innholdet.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getDashboardData } from "@/app/portal/actions";
import { DashboardShell } from "@/components/portal/dashboard/DashboardShell";
import { DashboardHero } from "@/components/portal/dashboard/DashboardHero";
import { TodayCard } from "@/components/portal/dashboard/TodayCard";
import { WeekCalendar } from "@/components/portal/dashboard/WeekCalendar";
import { KpiGrid } from "@/components/portal/dashboard/KpiGrid";
import { WeekProgress } from "@/components/portal/dashboard/WeekProgress";
import { TournamentCountdown } from "@/components/portal/dashboard/TournamentCountdown";
import { QuickLinks } from "@/components/portal/dashboard/QuickLinks";
import { RecentActivity } from "@/components/portal/dashboard/RecentActivity";
import { NotificationsCard } from "@/components/portal/dashboard/NotificationsCard";
import { GoalsProgress } from "@/components/portal/dashboard/GoalsProgress";
import { CoachMessage } from "@/components/portal/dashboard/CoachMessage";

export const dynamic = "force-dynamic";

export default async function PortalOversiktPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const data = await getDashboardData(user.id);

  return (
    <DashboardShell data={data}>
      <div className="grid gap-4 md:grid-cols-12 md:gap-6">
        {/* Hero — full width */}
        <div className="md:col-span-12">
          <DashboardHero
            user={data.user}
            greeting={data.greeting}
            nextTournament={data.nextTournament}
          />
        </div>

        {/* Left column on desktop: calendar + progress */}
        <div className="space-y-4 md:col-span-7 lg:col-span-8">
          <TodayCard session={data.today} />
          <WeekCalendar days={data.week} />
          <WeekProgress progress={data.weekProgress} weekNumber={data.weekNumber} />
        </div>

        {/* Right column on desktop: KPI + countdown + shortcuts + activity/notifications */}
        <div className="space-y-4 md:col-span-5 lg:col-span-4">
          <KpiGrid stats={data.stats} />
          <TournamentCountdown tournament={data.nextTournament} />
          <QuickLinks />
          <RecentActivity items={data.recentActivity} />
          <NotificationsCard count={data.unreadCount} notifications={data.notifications} />
          <GoalsProgress goals={data.goals} />
          <CoachMessage message={data.coachMessage} />
        </div>
      </div>
    </DashboardShell>
  );
}
