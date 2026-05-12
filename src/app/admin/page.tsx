import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getAdminHubData } from "@/lib/admin-hub-data";
import { PageHeader } from "@/components/shared/page-header";
import { HubKpiStrip } from "@/components/admin/hub-kpi-strip";
import { DagensTimerCard } from "@/components/admin/dagens-timer-card";
import { SpillerlisteCard } from "@/components/admin/spillerliste-card";
import { AktivitetsFeed } from "@/components/admin/aktivitets-feed";

export default async function AdminHub() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN", "GUEST"] });
  // GUEST har read-only-tilgang — send direkte til fasilitet-kalender
  if (user.role === "GUEST") redirect("/admin/calendar");
  const data = await getAdminHubData(user);

  const fornavn = user.name.split(" ")[0] ?? user.name;
  const idag = new Date();
  const datoFormatert = idag.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={`CoachHQ · ${datoFormatert}`}
        titleLead="Hei,"
        titleItalic={fornavn}
        actions={
          <Link
            href="/admin/brief"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Daglig brief →
          </Link>
        }
      />

      <HubKpiStrip
        aktiveSpillere={data.kpi.aktiveSpillere}
        dagensTimer={data.kpi.dagensTimer}
        ubesvarteMeldinger={data.kpi.ubesvarteMeldinger}
        ventendeGodkjenninger={data.kpi.ventendeGodkjenninger}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DagensTimerCard timer={data.dagensTimer} />
        <SpillerlisteCard players={data.aktivePlayers} />
      </div>

      <AktivitetsFeed items={data.aktivitetsFeed} />

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <ModulCard label="Plans" href="/admin/plans" />
        <ModulCard label="Spillere" href="/admin/elever" />
        <ModulCard label="Bookinger" href="/admin/bookings" />
        <ModulCard label="Finance" href="/admin/finance" />
      </section>
    </div>
  );
}

function ModulCard({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-border bg-card p-6 text-center transition-colors hover:border-primary"
    >
      <span className="font-display text-base font-semibold text-foreground group-hover:text-primary">
        {label}
      </span>
      <span className="mt-1 block text-xs text-muted-foreground">→</span>
    </Link>
  );
}
