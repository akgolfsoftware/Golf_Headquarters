import Link from "next/link";
import { ArrowUpRight, Flag, LineChart, BarChart3, Radar } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";

export default async function StatistikkOversikt() {
  const user = await requirePortalUser();

  const [antallRunder, antallMaal, antallTrackman] = await Promise.all([
    prisma.round.count({ where: { userId: user.id } }),
    prisma.goal.count({ where: { userId: user.id, status: "ACTIVE" } }),
    prisma.trackManSession.count({ where: { userId: user.id } }),
  ]);

  const fornavn = user.name.split(" ")[0];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="PlayerHQ · Statistikk"
        titleLead="Din"
        titleItalic="utvikling"
        sub={`${antallRunder} runder · ${antallMaal} aktive mål · ${antallTrackman} TrackMan-sesjoner, ${fornavn}.`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <HubKort
          href="/portal/mal"
          icon={Flag}
          tittel="Mål og fremgang"
          beskrivelse="HCP-trend, aktive mål og milepæler."
          teller={antallMaal > 0 ? `${antallMaal} aktive mål` : undefined}
        />
        <HubKort
          href="/portal/mal/runder"
          icon={BarChart3}
          tittel="Runder"
          beskrivelse="Scorekort, statistikk og utvikling per runde."
          teller={antallRunder > 0 ? `${antallRunder} runder` : undefined}
        />
        <HubKort
          href="/portal/mal/statistikk"
          icon={LineChart}
          tittel="Strokes Gained"
          beskrivelse="SG-analyse per kategori — tee, tilnærming, rundt green og putting."
        />
        <HubKort
          href="/portal/mal/trackman"
          icon={Radar}
          tittel="TrackMan"
          beskrivelse="Balldata, slagmønster og teknisk utvikling fra studio."
          teller={antallTrackman > 0 ? `${antallTrackman} sesjoner` : undefined}
        />
      </div>
    </div>
  );
}

function HubKort({
  href,
  icon: Icon,
  tittel,
  beskrivelse,
  teller,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tittel: string;
  beskrivelse: string;
  teller?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col justify-between rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-secondary">
          <Icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
        </span>
        {teller && (
          <span className="rounded-full bg-secondary px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {teller}
          </span>
        )}
      </div>
      <div className="mt-4">
        <h3 className="font-display text-base font-semibold leading-snug tracking-tight text-foreground">
          {tittel}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{beskrivelse}</p>
      </div>
      <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
        Se mer
        <ArrowUpRight size={14} strokeWidth={1.5} />
      </span>
    </Link>
  );
}
