/**
 * PlayerHQ Coach Perioder (/portal/coach/plans/perioder) — hybrid-design 2026-06-17.
 * Årsplan-tidslinje per spiller. Matcher fasit B5 · Planer (Perioder-fane).
 */
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
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
    <div className="mx-auto max-w-[430px] pb-24 pt-2 md:max-w-[1240px] md:pb-8">

      {/* Header */}
      <div className="mb-4 px-4 md:px-0">
        <h1 className="font-display text-[20px] font-bold leading-[1.06] tracking-[-0.02em] text-foreground">
          Periode
          <em className="font-medium italic text-primary">-oversikt</em>
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Sesongperioder per spiller
        </p>
      </div>

      {data.length === 0 ? (
        <div className="mx-3 rounded-xl border border-dashed border-border bg-card p-8 text-center md:mx-0">
          <p className="text-[13px] text-muted-foreground">
            Ingen spillere har sesongplaner enda.
          </p>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Opprett en sesongplan via{" "}
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
        <div className="space-y-4 px-3 md:px-0">
          {data.map((d) => (
            <div
              key={d.spillerId}
              className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
            >
              {/* Spiller-header */}
              <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
                {d.avatarUrl ? (
                  <Image
                    src={d.avatarUrl}
                    alt=""
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary font-mono text-xs font-semibold text-primary-foreground"
                  >
                    {d.spillerNavn.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-semibold leading-tight text-foreground">
                    {d.spillerNavn}
                  </div>
                  {d.plan && (
                    <div className="font-mono text-[10px] text-muted-foreground">
                      Sesong {d.plan.year} &middot; {d.plan.periodBlocks.length} periode
                      {d.plan.periodBlocks.length !== 1 ? "r" : ""}
                    </div>
                  )}
                </div>
                <Link
                  href="/portal/coach/plans"
                  className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground hover:text-foreground"
                >
                  Alle planer
                  <ChevronRight size={12} strokeWidth={1.5} />
                </Link>
              </div>

              {/* PeriodeEditor eller tom-melding */}
              <div className="px-4 py-4">
                {d.plan ? (
                  <PeriodeEditor plan={d.plan} />
                ) : (
                  <p className="text-[13px] text-muted-foreground">Ingen aktiv sesongplan.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
