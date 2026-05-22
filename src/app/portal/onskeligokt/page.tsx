/**
 * PlayerHQ · Be om økt
 *
 * Endelig design fra wireframe/design-files-v2/playerhq-C/07-onskeligokt.html.
 * Datakilde: User (coacher fra DB). Plassholdere markert med // TODO for
 * fasilitet-katalog, økt-typer (CoachingSession-typer) og pris-info.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { OnskeligOktForm } from "./form";

type Search = { sent?: string };

export default async function OnskeligOktPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requirePortalUser();
  const params = await searchParams;

  const coacher = await prisma.user.findMany({
    where: { role: "COACH" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const standardCoach = coacher[0] ?? null;
  const standardFornavn = standardCoach
    ? standardCoach.name.split(" ")[0]
    : "coachen";
  const initials = standardCoach
    ? standardCoach.name
        .split(/\s+/)
        .map((p) => p[0]?.toUpperCase() ?? "")
        .join("")
        .slice(0, 2)
    : "AK";

  return (
    <div className="min-h-screen bg-background pb-20 text-foreground md:pb-0">
      <div className="mx-auto max-w-[820px] px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-8">
          <PageHeader
            eyebrow="PlayerHQ · Ønskelig økt"
            titleLead="Be om økt med"
            titleItalic={standardFornavn}
            sub={`${standardFornavn} svarer typisk innen 4 timer på hverdager.`}
            actions={
              standardCoach ? (
                <CoachPill name={standardCoach.name} initials={initials} />
              ) : undefined
            }
          />
        </div>

        {params.sent === "1" && (
          <div className="mb-6 rounded-md border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-foreground">
            Forespørsel sendt. Du får varsel når coachen har satt opp en tid.
          </div>
        )}

        <OnskeligOktForm coacher={coacher} />
      </div>
    </div>
  );
}

function CoachPill({ name, initials }: { name: string; initials: string }) {
  const fornavn = name.split(" ")[0];
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2 py-2">
      <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
        {initials}
      </div>
      <div className="text-xs leading-tight">
        <div className="font-semibold text-foreground">{fornavn}</div>
        <div className="text-[10px] text-muted-foreground">Hovedcoach</div>
      </div>
      <span className="h-2 w-2 rounded-full bg-primary" aria-label="Online" />
      <span className="pr-2 text-[10px] font-semibold text-primary">Online</span>
    </div>
  );
}
