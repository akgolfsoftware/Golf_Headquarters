/**
 * PlayerHQ · Ny økt — wizard
 *
 * Migrert fra public/design/batch3/ny-okt-wizard.html.
 * 4-stegs wizard: type → drills → tid/sted → bekreft.
 */
import Link from "next/link";
import { Lock } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { prisma } from "@/lib/prisma";
import { canUserAccessDrill } from "@/lib/portal-drills/drill-access";
import { NyOktWizard, type NyOktPreloadedDrill } from "./wizard";

type Props = {
  searchParams: Promise<{ drill?: string }>;
};

export default async function NyOktPage({ searchParams }: Props) {
  const user = await requirePortalUser();
  const drillId = (await searchParams).drill?.trim();

  let preloadedDrill: NyOktPreloadedDrill | null = null;
  if (drillId && (await canUserAccessDrill(user.id, drillId))) {
    const row = await prisma.exerciseDefinition.findUnique({
      where: { id: drillId },
      select: { id: true, name: true, durationMin: true, skillArea: true, pyramidArea: true },
    });
    if (row) {
      preloadedDrill = {
        id: row.id,
        name: row.name,
        meta: row.durationMin ? `${row.durationMin} min` : "20 min",
        cat: row.skillArea?.slice(0, 4) ?? row.pyramidArea.slice(0, 4),
      };
    }
  }

  if (user.tier === "GRATIS") {
    return (
      <div className="mx-auto max-w-[1240px] space-y-6 px-4 sm:px-6">
        <PageHeader
          eyebrow="PlayerHQ · Ny økt"
          titleLead="Lag din"
          titleItalic="egen"
          titleTrail="økt"
          sub="Bygg dine egne treningsøkter med valgfrie drills — en av Pro-fordelene."
        />
        <EmptyState
          icon={Lock}
          titleItalic="Krever Pro"
          sub="Egendefinerte økter er en del av Pro-abonnementet (300 kr/mnd). Oppgrader for å designe dine egne treningsøkter med valgfrie drills."
          cta={
            <Link
              href="/portal/meg/abonnement"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Se Pro-fordeler
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1240px] space-y-8 px-4 pb-32 sm:px-6">
      <PageHeader
        eyebrow="PlayerHQ · Ny økt"
        titleLead="Lag din"
        titleItalic="egen"
        titleTrail="økt"
        sub="Sett sammen en økt utenfor coach-planen din — på 4 raske steg."
      />
      <NyOktWizard preloadedDrill={preloadedDrill} />
    </div>
  );
}
