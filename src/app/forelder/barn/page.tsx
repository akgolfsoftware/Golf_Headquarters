// Liste over alle koblede barn. Card-grid med kjernedata per barn.

import Link from "next/link";
import {
  ChevronRight,
  UserRound,
  TrendingUp,
  CalendarDays,
  Target,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnForForelder } from "@/lib/forelder";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";

const NB_DATO = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
});

export default async function MineBarn() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const barn = await hentBarnForForelder(user.id);

  if (barn.length === 0) {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="Foreldreportal · Barn"
          titleLead="Mine"
          titleItalic="barn"
          sub="Velg et barn for å se treningsprofilen."
        />
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <UserRound
            className="mx-auto h-8 w-8 text-muted-foreground"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <p className="mt-4 font-display text-base font-semibold">
            Ingen barn koblet til kontoen din
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Be spilleren sende en invitasjon, eller kontakt support.
          </p>
        </div>
      </div>
    );
  }

  const childIds = barn.map((b) => b.child.id);
  const [nesteOkter, malTeller, sisteLogger] = await Promise.all([
    prisma.trainingPlanSession.findMany({
      where: {
        plan: { userId: { in: childIds } },
        status: { in: ["PLANNED", "ACTIVE"] },
        scheduledAt: { gte: new Date() },
      },
      orderBy: { scheduledAt: "asc" },
      select: {
        scheduledAt: true,
        title: true,
        plan: { select: { userId: true } },
      },
    }),
    prisma.goal.groupBy({
      by: ["userId"],
      where: { userId: { in: childIds }, status: "ACTIVE" },
      _count: { _all: true },
    }),
    prisma.trainingPlanSessionLog.findMany({
      where: {
        completedAt: { not: null },
        session: { plan: { userId: { in: childIds } } },
      },
      orderBy: { completedAt: "desc" },
      select: {
        rating: true,
        session: { select: { plan: { select: { userId: true } } } },
      },
    }),
  ]);

  const nesteOktPerBarn = new Map<
    string,
    { scheduledAt: Date; title: string } | null
  >();
  for (const id of childIds) nesteOktPerBarn.set(id, null);
  for (const s of nesteOkter) {
    if (!nesteOktPerBarn.get(s.plan.userId)) {
      nesteOktPerBarn.set(s.plan.userId, {
        scheduledAt: s.scheduledAt,
        title: s.title,
      });
    }
  }

  const malPerBarn = new Map(malTeller.map((m) => [m.userId, m._count._all]));

  const sisteRatingPerBarn = new Map<string, number | null>();
  for (const id of childIds) sisteRatingPerBarn.set(id, null);
  for (const l of sisteLogger) {
    const uid = l.session.plan.userId;
    if (sisteRatingPerBarn.get(uid) == null && l.rating != null) {
      sisteRatingPerBarn.set(uid, l.rating);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Foreldreportal · Barn"
        titleLead="Mine"
        titleItalic="barn"
        sub={`${barn.length} ${barn.length === 1 ? "barn" : "barn"} koblet til kontoen din.`}
      />

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {barn.map((b) => {
          const neste = nesteOktPerBarn.get(b.child.id);
          const malAntall = malPerBarn.get(b.child.id) ?? 0;
          const rating = sisteRatingPerBarn.get(b.child.id);
          const initial = b.child.name.trim().charAt(0).toUpperCase() || "?";
          return (
            <li key={b.child.id}>
              <Link
                href={`/forelder/barn/${b.child.id}`}
                className="block rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-primary font-display text-lg font-semibold text-primary-foreground"
                  >
                    {initial}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      {b.relationship} · HCP {b.child.hcp ?? "—"}
                    </div>
                    <h2 className="mt-1 truncate font-display text-xl">
                      <em className="italic">
                        {b.child.name.split(" ")[0]}
                      </em>{" "}
                      {b.child.name.split(" ").slice(1).join(" ")}
                    </h2>
                  </div>
                  <ChevronRight
                    className="h-4 w-4 flex-shrink-0 text-muted-foreground"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </div>

                <dl className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border pt-4 text-sm">
                  <div>
                    <dt className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      <CalendarDays
                        className="h-3 w-3"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                      Neste
                    </dt>
                    <dd className="mt-1 font-mono text-xs tabular-nums">
                      {neste ? NB_DATO.format(neste.scheduledAt) : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      <Target
                        className="h-3 w-3"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                      Mål
                    </dt>
                    <dd className="mt-1 font-mono text-xs tabular-nums">
                      {malAntall}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      <TrendingUp
                        className="h-3 w-3"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                      Rating
                    </dt>
                    <dd className="mt-1 font-mono text-xs tabular-nums">
                      {rating != null ? `${rating}/5` : "—"}
                    </dd>
                  </div>
                </dl>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
