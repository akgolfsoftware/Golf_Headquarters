import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { PeriodeEditor } from "./periode-editor";

export default async function CoachPerioderPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const spillere = await prisma.user.findMany({
    where: {
      role: "PLAYER",
      seasonPlans: { some: {} },
    },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      seasonPlans: {
        orderBy: { year: "desc" },
        take: 1,
        include: {
          periodBlocks: {
            orderBy: { startDate: "asc" },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const data = spillere.map((s) => ({
    spillerId: s.id,
    spillerNavn: s.name,
    avatarUrl: s.avatarUrl,
    plan: s.seasonPlans[0]
      ? {
          id: s.seasonPlans[0].id,
          year: s.seasonPlans[0].year,
          name: s.seasonPlans[0].name,
          startDate: s.seasonPlans[0].startDate,
          endDate: s.seasonPlans[0].endDate,
          periodBlocks: s.seasonPlans[0].periodBlocks.map((b) => ({
            id: b.id,
            lPhase: b.lPhase,
            startDate: b.startDate,
            endDate: b.endDate,
            focus: b.focus,
            weeklyVolMin: b.weeklyVolMin,
            weeklyVolMax: b.weeklyVolMax,
          })),
        }
      : null,
  }));

  return (
    <div className="mx-auto max-w-[1240px] space-y-8 px-4 sm:px-6">
      <PageHeader
        eyebrow="AgencyOS · Perioder"
        titleLead="Sesong"
        titleItalic="perioder"
        sub="Planlegg GRUNN / SPESIALISERING / TURNERING for hver spiller"
      />

      {data.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Ingen spillere har sesongplaner enda.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Opprett en sesongplan for en spiller via{" "}
            <Link
              href="/portal/coach/plans"
              className="font-medium text-primary underline underline-offset-4 hover:opacity-80"
            >
              Planer
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {data.map((d) => (
            <section
              key={d.spillerId}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="mb-4 flex items-center gap-2">
                {d.avatarUrl ? (
                  <Image
                    src={d.avatarUrl}
                    alt=""
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary font-mono text-xs font-semibold text-muted-foreground">
                    {d.spillerNavn.charAt(0)}
                  </div>
                )}
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    {d.spillerNavn}
                  </h2>
                  {d.plan && (
                    <span className="font-mono text-[10px] text-muted-foreground">
                      Sesong {d.plan.year} — {d.plan.periodBlocks.length} periode
                      {d.plan.periodBlocks.length !== 1 ? "r" : ""}
                    </span>
                  )}
                </div>
                <Link
                  href={`/portal/coach/plans`}
                  className="ml-auto inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Alle planer
                  <ChevronRight size={12} strokeWidth={1.5} />
                </Link>
              </div>

              {d.plan ? (
                <PeriodeEditor plan={d.plan} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Ingen aktiv sesongplan.
                </p>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
